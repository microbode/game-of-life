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

const countAliveNeighbours = (cells, column, row) => {
  const columnsNumber = cells.length;
  const rowsNumber = cells[0].length;
  const x = column + columnsNumber;
  const y = row + rowsNumber;

  let count = 0;
  if (cells[(x - 1) % columnsNumber][(y - 1) % rowsNumber]) count++;
  if (cells[x % columnsNumber][(y - 1) % rowsNumber]) count++;
  if (cells[(x + 1) % columnsNumber][(y - 1) % rowsNumber]) count++;
  if (cells[(x + 1) % columnsNumber][y % rowsNumber]) count++;
  if (cells[(x + 1) % columnsNumber][(y + 1) % rowsNumber]) count++;
  if (cells[x % columnsNumber][(y + 1) % rowsNumber]) count++;
  if (cells[(x - 1) % columnsNumber][(y + 1) % rowsNumber]) count++;
  if (cells[(x - 1) % columnsNumber][y % rowsNumber]) count++;

  return count;
};

const applyRules = (cells) => {
  const columnsNumber = cells.length;
  const rowsNumber = cells[0].length;
  const newCells = cells.map((column) => [...column]);

  for (let column = 0; column < columnsNumber; column++) {
    for (let row = 0; row < rowsNumber; row++) {
      const alive = countAliveNeighbours(cells, column, row);
      if (cells[column][row]) {
        // Rule 1: célula viva sobrevive con 2 o 3 vecinos
        newCells[column][row] = alive === 2 || alive === 3 ? 1 : 0;
      } else {
        // Rule 2: célula muerta nace con exactamente 3 vecinos
        newCells[column][row] = alive === 3 ? 1 : 0;
      }
    }
  }
  return newCells;
};

function GameView() {
  const [boardWidth, setBoardWidth] = useState(900);
  const [boardHeight, setBoardHeight] = useState(600);
  const [cellSize, setCellSize] = useState(10);
  const [refreshRate, setRefreshRate] = useState(333);
  const [cells, setCells] = useState(() => getEmptyCellsState(boardWidth, boardHeight, cellSize));
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [mobilePanel, setMobilePanel] = useState(null);

  const liveCells = useMemo(() => {
    let count = 0;
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        if (cells[i][j]) count++;
      }
    }
    return count;
  }, [cells]);

  useEffect(() => {
    setRunning(false);
    setGeneration(0);
    setCells(getEmptyCellsState(boardWidth, boardHeight, cellSize));
  }, [boardWidth, boardHeight, cellSize]);

  useEffect(() => {
    if (!running) return;

    const intervalId = setInterval(() => {
      setCells((currentCells) => applyRules(currentCells));
      setGeneration((g) => g + 1);
    }, refreshRate);

    return () => clearInterval(intervalId);
  }, [running, refreshRate]);

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
