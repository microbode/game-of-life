import React, { useState } from "react";
import PropTypes from "prop-types";
import { getColumsNumber, getRowsNumber, flipOneCell } from "../helpers";

const Grid = ({ width, height, cellSize, columnsNumber, rowsNumber, children }) => (
  <div
    className="bg-black grid grid-flow-col"
    style={{
      width: `${width}px`,
      height: `${height}px`,
      gridTemplateColumns: `repeat(${columnsNumber}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rowsNumber}, ${cellSize}px)`,
    }}
  >
    {children}
  </div>
);

Grid.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  columnsNumber: PropTypes.number.isRequired,
  rowsNumber: PropTypes.number.isRequired,
  children: PropTypes.node,
};

const Cell = ({ alive, onMouseDown, onMouseUp, onMouseOver }) => (
  <div
    className={`cell ${alive ? "bg-white" : "bg-black"}`}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseOver={onMouseOver}
  />
);

Cell.propTypes = {
  alive: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseOver: PropTypes.func,
};

const Board = ({ cells, cellSize, height, setCells, width }) => {
  const [mouseDown, setMouseDown] = useState(false);
  const columnsNumber = getColumsNumber(width, cellSize);
  const rowsNumber = getRowsNumber(height, cellSize);

  const handleCellClickDown = (x, y) => () => {
    const newCells = flipOneCell({ cells, x, y });
    setCells(newCells);
    setMouseDown(true);
  };

  const handleCellClickUp = () => {
    setMouseDown(false);
  };

  const handleMouseOver = (x, y) => () => {
    if (mouseDown) {
      const newCells = flipOneCell({ cells, x, y });
      setCells(newCells);
    }
  };

  return (
    <div className="grid-container">
      <Grid
        width={width}
        height={height}
        cellSize={cellSize}
        columnsNumber={columnsNumber}
        rowsNumber={rowsNumber}
      >
        {cells.map((column, xIndex) =>
          column.map((cell, yIndex) => (
            <Cell
              key={`${xIndex}${yIndex}`}
              alive={cell}
              onMouseDown={handleCellClickDown(xIndex, yIndex)}
              onMouseUp={handleCellClickUp}
              onMouseOver={handleMouseOver(xIndex, yIndex)}
            />
          )),
        )}
      </Grid>
    </div>
  );
};

Board.displayName = "Board";
Board.propTypes = {
  cells: PropTypes.array,
  cellSize: PropTypes.number,
  height: PropTypes.number,
  setCells: PropTypes.func,
  width: PropTypes.number,
};

export default Board;
