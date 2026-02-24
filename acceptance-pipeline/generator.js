#!/usr/bin/env node
/**
 * Acceptance Test Pipeline — Stage 2: Generator
 *
 * Reads IR JSON files from acceptance-pipeline/ir/ and produces executable
 * Vitest + React Testing Library test files in generated-acceptance-tests/.
 *
 * The generator has deep knowledge of this Game of Life codebase:
 *   - GameView is the central state container (src/components/GameView.jsx)
 *   - Board state is cells: a 2D array of 0s and 1s (columns × rows)
 *   - The save/load feature stores boards in localStorage under the key
 *     "gol_saved_boards" as a JSON object { [name]: { cells, savedAt } }
 *   - The SaveLoadForm component (to be built) exposes:
 *       data-testid="save-name-input"       — text input for board name
 *       data-testid="save-button"           — confirm save
 *       data-testid="saved-boards-list"     — container listing saved boards
 *       data-testid="saved-board-item"      — each row in the list
 *       data-testid="load-button-<name>"    — load trigger per board
 *       data-testid="delete-button-<name>"  — delete trigger per board
 *       data-testid="empty-state-message"   — shown when no boards saved
 *       data-testid="save-error-message"    — duplicate-name error
 *       data-testid="save-load-panel"       — the whole panel wrapper
 *   - Generation counter uses data-testid="generation-counter" (to be added
 *     to Header.jsx)
 *   - Simulation running state is reflected by data-testid="play-button"
 *     having aria-label "Play" (stopped) or "Pause" (running)
 *
 * Usage:
 *   node acceptance-pipeline/generator.js [irFile]
 *
 * If no irFile is given, all *.json files in acceptance-pipeline/ir/ are
 * processed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const IR_DIR = path.join(__dirname, "ir");
const OUT_DIR = path.join(PROJECT_ROOT, "generated-acceptance-tests");

// ---------------------------------------------------------------------------
// Code-generation helpers
// ---------------------------------------------------------------------------

/**
 * Indent every line of a multi-line string by `n` spaces.
 */
function indent(str, n) {
  const pad = " ".repeat(n);
  return str
    .split("\n")
    .map((l) => (l.trim() === "" ? "" : pad + l))
    .join("\n");
}

/**
 * Escape double quotes in a string for embedding in a JS template literal.
 */
function esc(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

// ---------------------------------------------------------------------------
// GIVEN directive -> setup code
// ---------------------------------------------------------------------------

/**
 * Map a GIVEN directive text to imperative Vitest setup statements.
 * Returns an array of code-line strings (no trailing newline).
 */
function givenToCode(text) {
  const t = text.toLowerCase();

  // "the board has at least one alive cell" / "the board has some alive cells"
  if (t.includes("at least one alive cell") || t.includes("has some alive cells")) {
    return [
      "// GIVEN: board has at least one alive cell",
      "// Place a single live cell at position [0][0] so liveCells > 0",
      "const aliveCell = screen.getAllByTestId(/^cell-/)[0];",
      "await userEvent.click(aliveCell);",
    ];
  }

  // "the user has typed a name in the save input field"
  if (t.includes("typed a name in the save input field")) {
    return [
      "// GIVEN: user has typed a name",
      "const saveNameInput = screen.getByTestId('save-name-input');",
      "await userEvent.clear(saveNameInput);",
      "await userEvent.type(saveNameInput, saveName);",
    ];
  }

  // "the user saves the board as X"
  const savesAsMatch = text.match(/saves the board as "([^"]+)"/i);
  if (savesAsMatch) {
    const name = savesAsMatch[1];
    return [
      `// GIVEN: user saves the current board as "${name}"`,
      `const saveInput = screen.getByTestId('save-name-input');`,
      `await userEvent.clear(saveInput);`,
      `await userEvent.type(saveInput, "${name}");`,
      `await userEvent.click(screen.getByTestId('save-button'));`,
    ];
  }

  // "the simulation is running"
  if (t.includes("simulation is running")) {
    return [
      "// GIVEN: start the simulation by clicking the play button",
      "await userEvent.click(screen.getByTestId('play-button'));",
    ];
  }

  // "the user clears the board"
  if (t.includes("clears the board")) {
    return [
      "// GIVEN: user clears the board via the Clear button",
      "await userEvent.click(screen.getByRole('button', { name: 'Clear' }));",
    ];
  }

  // "the user reloads the page" (used as a GIVEN step)
  if (t.includes("reloads the page")) {
    return [
      "// GIVEN: user reloads the page — unmount and remount to simulate",
      "cleanup();",
      "render(<GameView />);",
    ];
  }

  // "every cell on the board is dead" / "the current board is empty"
  if (t.includes("every cell on the board is dead") || t.includes("current board is empty")) {
    return [
      "// GIVEN: board is empty — this is the default initial state",
    ];
  }

  // "the user has previously saved a board named X"
  // "the user has saved a board named X"
  // "the user has already saved a board named X"
  const savedBoardMatch = text.match(
    /(?:previously saved|has saved|already saved) a board named "([^"]+)"/i,
  );
  if (savedBoardMatch) {
    const name = savedBoardMatch[1];
    return [
      `// GIVEN: a board named "${name}" is pre-seeded in localStorage`,
      `const savedCells = [[1, 0], [0, 1]]; // minimal known pattern`,
      `const existingBoards = { "${name}": { cells: savedCells, savedAt: "2026-01-01T00:00:00.000Z" } };`,
      `localStorageMock.setItem("gol_saved_boards", JSON.stringify(existingBoards));`,
    ];
  }

  // "the current board shows a different configuration"
  if (t.includes("different configuration")) {
    return [
      "// GIVEN: current board is different from the saved one",
      "// The default empty board is already different from savedCells above",
    ];
  }

  // "no boards have been saved"
  if (t.includes("no boards have been saved")) {
    return [
      "// GIVEN: no saved boards — localStorage starts empty (ensured by beforeEach)",
    ];
  }

  // fallback — generate a failing assertion to document the gap
  return [
    `// GIVEN: [UNRECOGNISED] ${text}`,
    `throw new Error("Generator could not translate GIVEN: ${esc(text)}");`,
  ];
}

// ---------------------------------------------------------------------------
// WHEN directive -> action code
// ---------------------------------------------------------------------------

/**
 * Map a WHEN directive text to imperative action statements.
 */
function whenToCode(text) {
  const t = text.toLowerCase();

  // "the user confirms the save action"
  if (t.includes("confirms the save action")) {
    return [
      "// WHEN: user confirms the save",
      "const saveButton = screen.getByTestId('save-button');",
      "await userEvent.click(saveButton);",
    ];
  }

  // "the user views the save controls"
  if (t.includes("views the save controls")) {
    return [
      "// WHEN: user views save controls — component is already rendered",
      "// No additional action needed; the panel is visible on render",
    ];
  }

  // "the user clicks on 'X' in the saved-boards list"
  const clicksOnMatch = text.match(/clicks on "([^"]+)" in the saved-boards list/i);
  if (clicksOnMatch) {
    const name = clicksOnMatch[1];
    return [
      `// WHEN: user clicks on "${name}" in the saved-boards list`,
      `const loadButton = screen.getByTestId('load-button-${name}');`,
      `await userEvent.click(loadButton);`,
    ];
  }

  // "the user selects X from the saved-boards list and confirms load"
  const loadMatch = text.match(/selects "([^"]+)" from the saved-boards list/i);
  if (loadMatch) {
    const name = loadMatch[1];
    return [
      `// WHEN: user loads the board named "${name}"`,
      `const loadButton = screen.getByTestId('load-button-${name}');`,
      `await userEvent.click(loadButton);`,
    ];
  }

  // "the user reloads the page"
  if (t.includes("reloads the page")) {
    return [
      "// WHEN: user reloads — we unmount and remount GameView to simulate a fresh load",
      "// localStorage data persists via localStorageMock across the remount",
      "cleanup(); // unmount the current render",
      "render(<GameView />); // fresh mount reads localStorage on initialization",
    ];
  }

  // "the user opens the save/load panel" / "views the save/load panel"
  if (t.includes("opens the save/load panel") || t.includes("views the save/load panel")) {
    return [
      "// WHEN: user opens/views the panel — it is rendered by default in GameView",
      "// No interaction needed; SaveLoadForm is always visible in the sidebar",
    ];
  }

  // "the user deletes X"
  const deleteMatch = text.match(/deletes "([^"]+)"/i);
  if (deleteMatch) {
    const name = deleteMatch[1];
    return [
      `// WHEN: user deletes the board named "${name}"`,
      `const deleteButton = screen.getByTestId('delete-button-${name}');`,
      `await userEvent.click(deleteButton);`,
    ];
  }

  // "the user loads X" (direct load by name, no list selection phrasing)
  const loadsMatch = text.match(/^the user loads "([^"]+)"$/i);
  if (loadsMatch) {
    const name = loadsMatch[1];
    return [
      `// WHEN: user loads the board named "${name}"`,
      `const loadButton = screen.getByTestId('load-button-${name}');`,
      `await userEvent.click(loadButton);`,
    ];
  }

  // "the user tries to save another board with the name X"
  const dupeSaveMatch = text.match(/save another board with the name "([^"]+)"/i);
  if (dupeSaveMatch) {
    const name = dupeSaveMatch[1];
    return [
      `// WHEN: user tries to save with a duplicate name "${name}"`,
      `// First set up a board with at least one alive cell`,
      `const aliveCells = screen.getAllByTestId(/^cell-/);`,
      `await userEvent.click(aliveCells[0]);`,
      `const saveNameInput = screen.getByTestId('save-name-input');`,
      `await userEvent.clear(saveNameInput);`,
      `await userEvent.type(saveNameInput, "${name}");`,
      `const saveButton = screen.getByTestId('save-button');`,
      `await userEvent.click(saveButton);`,
    ];
  }

  // fallback
  return [
    `// WHEN: [UNRECOGNISED] ${text}`,
    `throw new Error("Generator could not translate WHEN: ${esc(text)}");`,
  ];
}

// ---------------------------------------------------------------------------
// THEN directive -> assertion code
// ---------------------------------------------------------------------------

/**
 * Map a THEN directive text to assertion statements.
 */
function thenToCode(text) {
  const t = text.toLowerCase();

  // "the board configuration appears in the saved-boards list with that name"
  if (t.includes("board configuration appears in the saved-boards list")) {
    return [
      "// THEN: saved board appears in the list",
      "const boardsList = screen.getByTestId('saved-boards-list');",
      "expect(boardsList).toBeInTheDocument();",
      "expect(within(boardsList).getByText(saveName)).toBeInTheDocument();",
    ];
  }

  // "the board on screen is unchanged"
  if (t.includes("board on screen is unchanged")) {
    return [
      "// THEN: the live board cells are not affected by the save action",
      "// The cell we clicked alive at the start must still be alive",
      "const firstCell = screen.getAllByTestId(/^cell-/)[0];",
      "expect(firstCell).toHaveClass('cell--alive');",
    ];
  }

  // "the save action is not available"
  if (t.includes("save action is not available")) {
    return [
      "// THEN: save button is disabled when the board is empty",
      "const saveButton = screen.getByTestId('save-button');",
      "expect(saveButton).toBeDisabled();",
    ];
  }

  // "the board updates to match the saved configuration"
  // "the board shows the alive cells that were present when X was saved"
  if (
    t.includes("board updates to match the saved configuration") ||
    t.includes("board shows the alive cells that were present")
  ) {
    return [
      "// THEN: board reflects the loaded cells",
      "// cell-0-0 should be alive based on the saved pattern",
      "const cellAtOrigin = screen.getByTestId('cell-0-0');",
      "expect(cellAtOrigin).toHaveClass('cell--alive');",
    ];
  }

  // "the generation counter resets to zero"
  if (t.includes("generation counter resets to zero")) {
    return [
      "// THEN: generation counter shows 0000",
      "const genCounter = screen.getByTestId('generation-counter');",
      "expect(genCounter).toHaveTextContent('0000');",
    ];
  }

  // "the simulation is stopped"
  if (t.includes("simulation is stopped")) {
    return [
      "// THEN: simulation is stopped — play button shows 'Play' aria-label",
      "const playButton = screen.getByTestId('play-button');",
      "expect(playButton).toHaveAttribute('aria-label', 'Play');",
    ];
  }

  // '"Glider Loop" still appears in the saved-boards list'
  const appearsMatch = text.match(/"([^"]+)" still appears in the saved-boards list/i);
  if (appearsMatch) {
    const name = appearsMatch[1];
    return [
      `// THEN: "${name}" still appears after page reload`,
      `const boardsList = screen.getByTestId('saved-boards-list');`,
      `expect(within(boardsList).getByText("${name}")).toBeInTheDocument();`,
    ];
  }

  // "loading it restores the same configuration" / "clicking on it restores the same configuration"
  if (
    t.includes("loading it restores the same configuration") ||
    t.includes("clicking on it restores the same configuration")
  ) {
    return [
      "// THEN: clicking the board item after reload restores the saved cells",
      "// Re-find the load button in the freshly mounted component",
      "const reloadedLoadButton = screen.getByTestId('load-button-Glider Loop');",
      "await userEvent.click(reloadedLoadButton);",
      "const cellAtOrigin = screen.getByTestId('cell-0-0');",
      "expect(cellAtOrigin).toHaveClass('cell--alive');",
    ];
  }

  // '"X" is marked as selected in the list'
  const markedSelectedMatch = text.match(/"([^"]+)" is marked as selected in the list/i);
  if (markedSelectedMatch) {
    const name = markedSelectedMatch[1];
    return [
      `// THEN: "${name}" is marked as selected`,
      `expect(screen.getByTestId('load-button-${name}')).toHaveAttribute('aria-pressed', 'true');`,
    ];
  }

  // "the save input is not available" (simulation is running)
  if (t.includes("save input is not available")) {
    return [
      "// THEN: save input is disabled during simulation",
      "const saveInput = screen.getByTestId('save-name-input');",
      "expect(saveInput).toBeDisabled();",
    ];
  }

  // "the saved-boards list is not interactive"
  if (t.includes("saved-boards list is not interactive")) {
    return [
      "// THEN: saved-boards list is marked as not interactive",
      "const savedBoardsList = screen.getByTestId('saved-boards-list');",
      "expect(savedBoardsList).toHaveAttribute('aria-disabled', 'true');",
    ];
  }

  // "a message indicates there are no saved boards yet"
  if (t.includes("no saved boards yet")) {
    return [
      "// THEN: empty-state message is visible",
      "const emptyMsg = screen.getByTestId('empty-state-message');",
      "expect(emptyMsg).toBeInTheDocument();",
    ];
  }

  // '"Old Pattern" no longer appears in the saved-boards list'
  const goneMatch = text.match(/"([^"]+)" no longer appears/i);
  if (goneMatch) {
    const name = goneMatch[1];
    return [
      `// THEN: "${name}" is gone from the list`,
      `const boardsList = screen.getByTestId('saved-boards-list');`,
      `expect(within(boardsList).queryByText("${name}")).not.toBeInTheDocument();`,
    ];
  }

  // "an error message appears indicating the name is already taken"
  if (t.includes("name is already taken")) {
    return [
      "// THEN: error message is visible",
      "const errorMsg = screen.getByTestId('save-error-message');",
      "expect(errorMsg).toBeInTheDocument();",
    ];
  }

  // "the existing X save is not overwritten"
  const notOverwrittenMatch = text.match(/the existing "([^"]+)" save is not overwritten/i);
  if (notOverwrittenMatch) {
    const name = notOverwrittenMatch[1];
    return [
      `// THEN: the original "${name}" board in localStorage is untouched`,
      `const stored = JSON.parse(localStorageMock.getItem("gol_saved_boards"));`,
      `expect(Object.keys(stored).filter((k) => k === "${name}")).toHaveLength(1);`,
      `expect(stored["${name}"].cells).toEqual([[1, 0], [0, 1]]);`,
    ];
  }

  // fallback
  return [
    `// THEN: [UNRECOGNISED] ${text}`,
    `throw new Error("Generator could not translate THEN: ${esc(text)}");`,
  ];
}

// ---------------------------------------------------------------------------
// Scenario -> test function body
// ---------------------------------------------------------------------------

function scenarioToTestCode(scenario) {
  const { title, sourceFile, sourceLine, givens, whens, thens } = scenario;
  const testId = `${sourceFile}:${sourceLine}`;

  // Determine if the scenario references a saveName variable in givens
  const needsSaveName =
    givens.some((g) => g.text.toLowerCase().includes("typed a name in the save input field")) ||
    whens.some(
      (w) =>
        w.text.toLowerCase().includes("confirms the save action") &&
        givens.some((g) => g.text.toLowerCase().includes("typed a name")),
    );

  // For the "Save the current board" scenario we pick a concrete name
  let saveNameDecl = "";
  if (needsSaveName) {
    saveNameDecl = `  const saveName = "My Board";\n`;
  }

  const lines = [];
  lines.push(`it("[${testId}] ${title}", async () => {`);
  lines.push(`  // Spec: ${sourceFile} line ${sourceLine}`);
  lines.push(`  // Reset localStorage before each scenario body (belt-and-suspenders)`);
  lines.push(`  localStorageMock.clear();`);
  lines.push(``);

  if (saveNameDecl) {
    lines.push(saveNameDecl.trimEnd());
    lines.push(``);
  }

  // Detect if any GIVEN pre-seeds localStorage without an explicit reload step.
  // If so, auto-inject a cleanup+render before WHEN so the component reads the
  // seeded data on initialisation.
  const givenTexts = givens.map((g) => g.text.toLowerCase());
  const hasSetItem = givens.some((g) =>
    givenToCode(g.text).some((line) => line.includes("localStorageMock.setItem")),
  );
  const hasExplicitReload = givenTexts.some((t) => t.includes("reloads the page"));
  const needsAutoRemount = hasSetItem && !hasExplicitReload;

  if (givens.length > 0) {
    lines.push(`  // --- GIVEN ---`);
    for (const g of givens) {
      const code = givenToCode(g.text);
      for (const l of code) lines.push(`  ${l}`);
      lines.push(``);
    }
    if (needsAutoRemount) {
      lines.push(`  // Remount so the component reads the pre-seeded localStorage on initialisation`);
      lines.push(`  cleanup();`);
      lines.push(`  render(<GameView />);`);
      lines.push(``);
    }
  }

  if (whens.length > 0) {
    lines.push(`  // --- WHEN ---`);
    for (const w of whens) {
      const code = whenToCode(w.text);
      for (const l of code) lines.push(`  ${l}`);
      lines.push(``);
    }
  }

  if (thens.length > 0) {
    lines.push(`  // --- THEN ---`);
    for (const th of thens) {
      const code = thenToCode(th.text);
      for (const l of code) lines.push(`  ${l}`);
      lines.push(``);
    }
  }

  lines.push(`});`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Full test file generation
// ---------------------------------------------------------------------------

function generateTestFile(ir) {
  const header = `/**
 * GENERATED FILE — DO NOT EDIT MANUALLY.
 * Regenerate with: node acceptance-pipeline/generator.js
 *
 * Spec source: specs/${ir.specFile}
 * Generated at: ${new Date().toISOString()}
 *
 * These tests exercise the Save/Load Board feature through the full
 * React component tree (GameView) using Vitest + React Testing Library.
 *
 * The feature does NOT exist yet — these tests are expected to FAIL (RED)
 * until the feature is implemented.
 *
 * Assumed component contracts (data-testid attributes):
 *   save-name-input          — <input> for the board name
 *   save-button              — <button> to confirm save (disabled when board empty)
 *   saved-boards-list        — <ul>/<div> listing all saved boards
 *   saved-board-item         — each row in the list
 *   load-button-<name>       — <button> to load a specific board
 *   delete-button-<name>     — <button> to delete a specific board
 *   empty-state-message      — shown when no boards are saved
 *   save-error-message       — shown on duplicate-name error
 *   save-load-panel          — the whole panel wrapper
 *   generation-counter       — displays the current generation (in Header)
 *   play-button              — the play/pause toggle (aria-label "Play"|"Pause")
 *   cell-<x>-<y>             — individual board cells (class cell--alive|cell--dead)
 *
 * localStorage key: "gol_saved_boards"
 *   format: { [name: string]: { cells: number[][], savedAt: string } }
 */

import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GameView from "../src/components/GameView";

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
// jsdom provides a real localStorage; we wrap it to allow spying and
// to guarantee a clean slate between tests.

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ---------------------------------------------------------------------------
// Test setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear();
  // Render a fresh GameView before each test.
  // Individual tests that need to remount will call cleanup() + render().
  render(<GameView />);
});

afterEach(() => {
  cleanup();
  localStorageMock.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

describe("Feature: Save and Load Board State — specs/${ir.specFile}", () => {
`;

  const testBodies = ir.scenarios.map((s) => indent(scenarioToTestCode(s), 2));

  const footer = `
});
`;

  return header + testBodies.join("\n\n") + footer;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const args = process.argv.slice(2);
  let irFiles;

  if (args.length > 0) {
    irFiles = args.map((a) => path.resolve(a));
  } else {
    irFiles = fs
      .readdirSync(IR_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(IR_DIR, f));
  }

  if (irFiles.length === 0) {
    console.error("Generator: no IR files found in acceptance-pipeline/ir/");
    process.exit(1);
  }

  for (const irFile of irFiles) {
    if (!fs.existsSync(irFile)) {
      console.error(`Generator: IR file not found: ${irFile}`);
      process.exit(1);
    }

    const ir = JSON.parse(fs.readFileSync(irFile, "utf-8"));
    console.log(`Generator: processing ${path.basename(irFile)} (${ir.scenarios.length} scenarios)`);

    const baseName = path.basename(irFile, ".json");
    const outPath = path.join(OUT_DIR, `${baseName}.test.jsx`);
    const content = generateTestFile(ir);
    fs.writeFileSync(outPath, content);
    console.log(
      `Generator: wrote ${path.relative(PROJECT_ROOT, outPath)}`,
    );
  }

  console.log("Generator: done.");
}

run();
