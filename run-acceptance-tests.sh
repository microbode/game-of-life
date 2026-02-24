#!/bin/bash
# =============================================================================
# run-acceptance-tests.sh
#
# Three-stage acceptance test pipeline for the Game of Life project.
#
#   Stage 1 — Parse:    specs/*.md  ->  acceptance-pipeline/ir/*.json
#   Stage 2 — Generate: ir/*.json   ->  generated-acceptance-tests/*.test.jsx
#   Stage 3 — Run:      vitest runs generated-acceptance-tests/
#
# The pipeline is incremental: a spec is only re-parsed / re-generated when
# its source file is newer than the corresponding IR or test file.
#
# Usage:
#   ./run-acceptance-tests.sh            # full pipeline, all specs
#   ./run-acceptance-tests.sh --force    # force re-parse and re-generate
# =============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPECS_DIR="$PROJECT_ROOT/specs"
IR_DIR="$PROJECT_ROOT/acceptance-pipeline/ir"
TESTS_DIR="$PROJECT_ROOT/generated-acceptance-tests"
PARSER="$PROJECT_ROOT/acceptance-pipeline/parser.js"
GENERATOR="$PROJECT_ROOT/acceptance-pipeline/generator.js"

FORCE=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

# -----------------------------------------------------------------------
# Colour helpers (no-op if not a terminal)
# -----------------------------------------------------------------------
if [ -t 1 ]; then
  BOLD="\033[1m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"
else
  BOLD=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

info()    { echo -e "${BOLD}[pipeline]${RESET} $*"; }
success() { echo -e "${GREEN}[pipeline]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[pipeline]${RESET} $*"; }
die()     { echo -e "${RED}[pipeline] ERROR:${RESET} $*" >&2; exit 1; }

# -----------------------------------------------------------------------
# Prerequisite checks
# -----------------------------------------------------------------------
command -v node >/dev/null 2>&1 || die "node not found. Install Node.js."

info "Checking test dependencies..."

# Install Vitest and React Testing Library if not already present
MISSING_DEPS=()
node -e "import('vitest')" 2>/dev/null || MISSING_DEPS+=("vitest")
node -e "import('@testing-library/react')" 2>/dev/null || MISSING_DEPS+=("@testing-library/react")
node -e "import('@testing-library/user-event')" 2>/dev/null || MISSING_DEPS+=("@testing-library/user-event")
node -e "import('@testing-library/jest-dom')" 2>/dev/null || MISSING_DEPS+=("@testing-library/jest-dom")
node -e "import('jsdom')" 2>/dev/null || MISSING_DEPS+=("jsdom")

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  warn "Installing missing dependencies: ${MISSING_DEPS[*]}"
  npm install --save-dev "${MISSING_DEPS[@]}" || die "npm install failed."
  success "Dependencies installed."
else
  success "All dependencies present."
fi

# -----------------------------------------------------------------------
# Ensure output directories exist
# -----------------------------------------------------------------------
mkdir -p "$IR_DIR"
mkdir -p "$TESTS_DIR"

# -----------------------------------------------------------------------
# Stage 1 — Parse specs into IR
# -----------------------------------------------------------------------
info "Stage 1: Parsing specs..."

SPECS_TO_PARSE=()

for spec_file in "$SPECS_DIR"/*.md "$SPECS_DIR"/*.txt; do
  [ -f "$spec_file" ] || continue

  base=$(basename "$spec_file")
  base_noext="${base%.*}"
  ir_file="$IR_DIR/${base_noext}.json"
  test_file="$TESTS_DIR/${base_noext}.test.jsx"

  if $FORCE; then
    SPECS_TO_PARSE+=("$spec_file")
  elif [ ! -f "$ir_file" ] || [ "$spec_file" -nt "$ir_file" ]; then
    warn "  $base is newer than its IR — will re-parse."
    SPECS_TO_PARSE+=("$spec_file")
  elif [ ! -f "$test_file" ] || [ "$ir_file" -nt "$test_file" ]; then
    warn "  IR for $base is newer than generated tests — will re-generate (skip parse)."
  else
    info "  $base is up to date."
  fi
done

if [ ${#SPECS_TO_PARSE[@]} -gt 0 ]; then
  node "$PARSER" "${SPECS_TO_PARSE[@]}" || die "Parser failed."
else
  info "  No specs need re-parsing."
fi

# -----------------------------------------------------------------------
# Stage 2 — Generate test files from IR
# -----------------------------------------------------------------------
info "Stage 2: Generating test files..."

IR_TO_GENERATE=()

for spec_file in "$SPECS_DIR"/*.md "$SPECS_DIR"/*.txt; do
  [ -f "$spec_file" ] || continue

  base=$(basename "$spec_file")
  base_noext="${base%.*}"
  ir_file="$IR_DIR/${base_noext}.json"
  test_file="$TESTS_DIR/${base_noext}.test.jsx"

  if $FORCE; then
    [ -f "$ir_file" ] && IR_TO_GENERATE+=("$ir_file")
  elif [ ! -f "$test_file" ] || [ "$ir_file" -nt "$test_file" ]; then
    IR_TO_GENERATE+=("$ir_file")
  fi
done

if [ ${#IR_TO_GENERATE[@]} -gt 0 ]; then
  node "$GENERATOR" "${IR_TO_GENERATE[@]}" || die "Generator failed."
else
  info "  No test files need regenerating."
fi

# -----------------------------------------------------------------------
# Stage 3 — Run generated tests with Vitest
# -----------------------------------------------------------------------
info "Stage 3: Running acceptance tests..."
echo ""

npx vitest run --config "$PROJECT_ROOT/vitest.config.js" || {
  echo ""
  die "Acceptance tests FAILED. Check the output above for the failing spec file and line number."
}

echo ""
success "All acceptance tests passed."
