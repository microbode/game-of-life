#!/usr/bin/env node
/**
 * Acceptance Test Pipeline — Stage 1: Parser
 *
 * Reads Markdown spec files from specs/ that use the Given/When/Then format.
 * Scenarios are delimited by --- (horizontal rule) lines.
 * Each scenario begins with a ## Scenario: heading.
 *
 * Produces one JSON IR file per spec file into acceptance-pipeline/ir/.
 *
 * Usage:
 *   node acceptance-pipeline/parser.js [specFile]
 *
 * If no specFile is given, all *.md files in specs/ are processed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SPECS_DIR = path.join(PROJECT_ROOT, "specs");
const IR_DIR = path.join(__dirname, "ir");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a raw directive line.
 * Strips the leading keyword (GIVEN, AND, WHEN, THEN) and returns
 * { kind, text } where kind is one of "given" | "when" | "then".
 *
 * AND inherits the kind of the previous directive.
 */
function parseDirectiveLine(line, previousKind) {
  const upper = line.trim().toUpperCase();

  let kind = null;
  let text = line.trim();

  if (upper.startsWith("GIVEN ")) {
    kind = "given";
    text = line.trim().slice("GIVEN ".length).trim();
  } else if (upper.startsWith("WHEN ")) {
    kind = "when";
    text = line.trim().slice("WHEN ".length).trim();
  } else if (upper.startsWith("THEN ")) {
    kind = "then";
    text = line.trim().slice("THEN ".length).trim();
  } else if (upper.startsWith("AND ")) {
    kind = previousKind; // inherits from previous
    text = line.trim().slice("AND ".length).trim();
  }

  if (!kind) return null;
  return { kind, text };
}

/**
 * Parse a single scenario block (array of non-empty lines).
 * Returns a scenario object or null if the block is malformed.
 */
function parseScenarioBlock(lines, sourceFile, scenarioStartLine) {
  let title = null;
  const givens = [];
  const whens = [];
  const thens = [];
  let previousKind = null;

  for (const { text, lineNumber } of lines) {
    const trimmed = text.trim();
    if (!trimmed) continue;

    // ## Scenario: title
    const scenarioMatch = trimmed.match(/^##\s+Scenario:\s+(.+)$/i);
    if (scenarioMatch) {
      title = scenarioMatch[1].trim();
      continue;
    }

    const directive = parseDirectiveLine(trimmed, previousKind);
    if (directive) {
      previousKind = directive.kind;
      const entry = { text: directive.text, line: lineNumber };
      if (directive.kind === "given") givens.push(entry);
      else if (directive.kind === "when") whens.push(entry);
      else if (directive.kind === "then") thens.push(entry);
    }
  }

  if (!title) return null;

  return {
    title,
    sourceFile: path.basename(sourceFile),
    sourceLine: scenarioStartLine,
    givens,
    whens,
    thens,
  };
}

/**
 * Parse an entire spec file.
 * Splits on --- delimiters to get scenario blocks, then parses each block.
 */
function parseSpecFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const rawLines = content.split("\n");

  // Annotate every line with its 1-based line number
  const annotated = rawLines.map((text, idx) => ({ text, lineNumber: idx + 1 }));

  // Split into blocks separated by lines that are exactly "---"
  const blocks = [];
  let currentBlock = [];
  let blockStartLine = 1;

  for (const { text, lineNumber } of annotated) {
    if (text.trim() === "---") {
      if (currentBlock.length > 0) {
        blocks.push({ lines: currentBlock, startLine: blockStartLine });
      }
      currentBlock = [];
      blockStartLine = lineNumber + 1;
    } else {
      currentBlock.push({ text, lineNumber });
    }
  }
  if (currentBlock.length > 0) {
    blocks.push({ lines: currentBlock, startLine: blockStartLine });
  }

  const scenarios = [];

  for (const { lines, startLine } of blocks) {
    const scenario = parseScenarioBlock(lines, filePath, startLine);
    if (scenario) {
      scenarios.push(scenario);
    }
  }

  return {
    specFile: path.basename(filePath),
    specPath: filePath,
    parsedAt: new Date().toISOString(),
    scenarios,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run() {
  if (!fs.existsSync(IR_DIR)) {
    fs.mkdirSync(IR_DIR, { recursive: true });
  }

  const args = process.argv.slice(2);
  let specFiles;

  if (args.length > 0) {
    specFiles = args.map((a) => path.resolve(a));
  } else {
    specFiles = fs
      .readdirSync(SPECS_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
      .map((f) => path.join(SPECS_DIR, f));
  }

  if (specFiles.length === 0) {
    console.error("Parser: no spec files found in specs/");
    process.exit(1);
  }

  let totalScenarios = 0;

  for (const specFile of specFiles) {
    if (!fs.existsSync(specFile)) {
      console.error(`Parser: spec file not found: ${specFile}`);
      process.exit(1);
    }

    console.log(`Parser: processing ${path.basename(specFile)}`);
    const ir = parseSpecFile(specFile);
    totalScenarios += ir.scenarios.length;

    const baseName = path.basename(specFile, path.extname(specFile));
    const irPath = path.join(IR_DIR, `${baseName}.json`);
    fs.writeFileSync(irPath, JSON.stringify(ir, null, 2) + "\n");
    console.log(
      `Parser: wrote ${ir.scenarios.length} scenario(s) -> ${path.relative(PROJECT_ROOT, irPath)}`,
    );
  }

  console.log(`Parser: done. ${totalScenarios} total scenario(s) parsed.`);
}

run();
