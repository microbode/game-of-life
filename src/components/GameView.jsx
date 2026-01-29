import { useState, useEffect, useMemo } from "react";
import { getColumsNumber, getRowsNumber } from "../helpers";
import Board from "./Board";
import ConfigurationBoardForm from "./ConfigurationBoardForm";
import PatternsForm from "./PatternsForm";
import SetupsForm from "./SetupsForm";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AccordionSection } from "./AccordionSection";
import { MobileControlBar } from "./MobileControlBar";

const getEmptyCellsState = (boardWidth, boardHeight, cellSize) => {
  const columnsNumber = getColumsNumber(boardWidth, cellSize);
  const rowsNumber = getRowsNumber(boardHeight, cellSize);
  let state = Array.from({ length: columnsNumber }, () => Array(rowsNumber).fill(0));
  return state;
};

const countNeighbours = (neighbours) => {
  const alive = neighbours.filter((n) => n);
  const dead = neighbours.filter((n) => !n);
  return { alive: alive.length, dead: dead.length };
};

const getNeighbours = ({ cells, column, row }) => {
  const columnsNumber = cells.length;
  const rowsNumber = cells[0].length;
  const neighbours = [];
  const x = column + columnsNumber;
  const y = row + rowsNumber;
  neighbours.push(cells[(x - 1) % columnsNumber][(y - 1) % rowsNumber]);
  neighbours.push(cells[x % columnsNumber][(y - 1) % rowsNumber]);
  neighbours.push(cells[(x + 1) % columnsNumber][(y - 1) % rowsNumber]);
  neighbours.push(cells[(x + 1) % columnsNumber][y % rowsNumber]);
  neighbours.push(cells[(x + 1) % columnsNumber][(y + 1) % rowsNumber]);
  neighbours.push(cells[x % columnsNumber][(y + 1) % rowsNumber]);
  neighbours.push(cells[(x - 1) % columnsNumber][(y + 1) % rowsNumber]);
  neighbours.push(cells[(x - 1) % columnsNumber][y % rowsNumber]);
  return countNeighbours(neighbours);
};

const rule1 = ({ cells, row, column }) => {
  const { alive } = getNeighbours({
    cells,
    column,
    row,
  });
  return alive === 2 || alive === 3 ? 1 : 0;
};

const rule2 = ({ cells, column, row }) => {
  const { alive } = getNeighbours({
    cells,
    column,
    row,
  });
  return alive === 3 ? 1 : 0;
};

const applyRules = (cells) => {
  const newCells = cells.map((column) => [...column]);
  for (let column = 0; column < cells.length; column++) {
    for (let row = 0; row < cells?.[0]?.length; row++) {
      const currentCell = cells[column][row];
      const isAlive = currentCell;
      if (isAlive) {
        newCells[column][row] = rule1({
          cells,
          column,
          row,
        });
      } else {
        newCells[column][row] = rule2({
          cells,
          column,
          row,
        });
      }
    }
  }
  return newCells;
};

function GameView() {
  const [boardWidth, setBoardWidth] = useState(900);
  const [boardHeight, setBoardHeight] = useState(600);
  const [cellSize, setCellSize] = useState(10);
  const [refreshRate, setRefreshRate] = useState(0);
  const [cells, setCells] = useState(() => getEmptyCellsState(boardWidth, boardHeight, cellSize));
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null);

  const liveCells = useMemo(() => {
    return cells.flat().filter((cell) => cell).length;
  }, [cells]);

  useEffect(() => {
    setRunning(false);
    setGeneration(0);
    setCells(getEmptyCellsState(boardWidth, boardHeight, cellSize));
  }, [boardWidth, boardHeight, cellSize]);

  useEffect(() => {
    if (!running) return;

    const timeoutId = setTimeout(() => {
      setCells((currentCells) => applyRules(currentCells));
      setGeneration((g) => g + 1);
    }, refreshRate);

    return () => clearTimeout(timeoutId);
  }, [running, refreshRate, cells]);

  const toggleRunning = () => {
    setRunning((running) => !running);
  };

  const handleRandomize = () => {
    const randomCells = cells.map((column) => column.map(() => (Math.random() > 0.7 ? 1 : 0)));
    setCells(randomCells);
    setGeneration(0);
  };

  const handleClear = () => {
    setCells(getEmptyCellsState(boardWidth, boardHeight, cellSize));
    setGeneration(0);
    setRunning(false);
  };

  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    setMobilePanel(null);
  };

  const handlePatternPlace = () => {
    // Pattern stays selected to allow multiple placements
  };

  const toggleMobilePanel = (panel) => {
    setMobilePanel(mobilePanel === panel ? null : panel);
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Full Height */}
      <div className="hidden lg:block">
        <Sidebar>
          <AccordionSection title="Configuration" defaultOpen>
            <ConfigurationBoardForm
              boardHeight={boardHeight}
              boardWidth={boardWidth}
              cellSize={cellSize}
              refreshRate={refreshRate}
              setBoardHeight={setBoardHeight}
              setBoardWidth={setBoardWidth}
              setCellSize={setCellSize}
              setRefreshRate={setRefreshRate}
              running={running}
            />
          </AccordionSection>

          <AccordionSection title="Patterns" defaultOpen>
            <PatternsForm
              cells={cells}
              setCells={setCells}
              running={running}
              toogleRunning={toggleRunning}
              selectedPattern={selectedPattern}
              onPatternSelect={handlePatternSelect}
            />
          </AccordionSection>

          <AccordionSection title="Setups">
            <SetupsForm cells={cells} setCells={setCells} running={running} />
          </AccordionSection>
        </Sidebar>
      </div>

      {/* Main Content Area - Header + Board */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          generation={generation}
          liveCells={liveCells}
          running={running}
          onToggleRunning={toggleRunning}
          onRandomize={handleRandomize}
          onClear={handleClear}
        />

        {/* Board Area */}
        <main className="flex-1 relative overflow-auto flex items-center justify-center p-4 lg:p-8">
          <Board
            cells={cells}
            cellSize={cellSize}
            height={boardHeight}
            width={boardWidth}
            setCells={setCells}
            selectedPattern={selectedPattern}
            onPatternPlace={handlePatternPlace}
          />
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden">
        <MobileControlBar
          activePanel={mobilePanel}
          onPanelToggle={toggleMobilePanel}
          selectedPattern={selectedPattern}
        />

        {/* Mobile Panel Content */}
        {mobilePanel && (
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 max-h-[50vh] overflow-y-auto p-4 z-30">
            {mobilePanel === "config" && (
              <ConfigurationBoardForm
                boardHeight={boardHeight}
                boardWidth={boardWidth}
                cellSize={cellSize}
                refreshRate={refreshRate}
                setBoardHeight={setBoardHeight}
                setBoardWidth={setBoardWidth}
                setCellSize={setCellSize}
                setRefreshRate={setRefreshRate}
                running={running}
              />
            )}
            {mobilePanel === "patterns" && (
              <PatternsForm
                cells={cells}
                setCells={setCells}
                running={running}
                toogleRunning={toggleRunning}
                selectedPattern={selectedPattern}
                onPatternSelect={handlePatternSelect}
              />
            )}
            {mobilePanel === "setups" && (
              <SetupsForm
                cells={cells}
                setCells={setCells}
                running={running}
                toogleRunning={toggleRunning}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameView;
