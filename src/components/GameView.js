import { useState, useEffect } from "react";
import { getColumsNumber, getRowsNumber } from "../helpers";
import { StyledButtonGo, StyledButtonStop, StyledButtonContainer } from "../styles/styles";
import Board from "./Board";
import ConfigurationBoardForm from "./ConfigurationBoardForm";
import PatternsForm from "./PatternsForm";
import SetupsForm from "./SetupsForm";

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

// If current cell
const rule1 = ({ cells, row, column }) => {
  const { alive } = getNeighbours({
    cells,
    column,
    row,
  });
  return alive === 2 || alive === 3 ? 1 : 0;
};

// If current cell is dead and has 3 neighbours alive, then it back to life.
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
  const [boardHeight, setBoardHeight] = useState(900);
  const [cellSize, setCellSize] = useState(10);
  const [refreshRate, setRefreshRate] = useState(0);
  const [cells, setCells] = useState(() => getEmptyCellsState(boardWidth, boardHeight, cellSize));
  const [running, setRunning] = useState(false);

  // useEffect(() => {
  //   window.addEventListener("mousedown", (e) => {
  //     if (e.button === 1) {
  //       setMouseDown(true);
  //     }
  //   });

  //   window.addEventListener("mouseup", (e) => {
  //     if (e.button === 1) {
  //       setMouseDown(false);
  //     }
  //   });
  //   return () => {
  //     window.removeEventListener("mousedown");
  //     window.removeEventListener("mouseup");
  //   };
  // }, []);

  useEffect(() => {
    setRunning(false);
    setCells(getEmptyCellsState(boardWidth, boardHeight, cellSize));
  }, [boardWidth, boardHeight, cellSize]);

  useEffect(() => {
    const setNewState = async () => {
      const newCells = await new Promise((resolve) =>
        setTimeout(() => {
          const newCells = applyRules(cells);
          resolve(newCells);
        }, refreshRate)
      );
      setCells(newCells);
    };

    if (running) {
      setNewState();
    }
  }, [refreshRate, cells, running, setCells]);

  const toggleRunning = () => {
    setRunning((running) => !running);
  };

  return (
    <>
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
      <div>
        <PatternsForm
          cells={cells}
          setCells={setCells}
          running={running}
          toogleRunning={toggleRunning}
        />
        <SetupsForm
          cells={cells}
          setCells={setCells}
          running={running}
          toogleRunning={toggleRunning}
        />
        <StyledButtonContainer>
          {running ? (
            <StyledButtonStop onClick={toggleRunning}>Stop</StyledButtonStop>
          ) : (
            <StyledButtonGo onClick={toggleRunning}>Go!</StyledButtonGo>
          )}
        </StyledButtonContainer>
      </div>
      <Board
        cells={cells}
        cellSize={cellSize}
        height={boardHeight}
        width={boardWidth}
        setCells={setCells}
      />
    </>
  );
}

export default GameView;
