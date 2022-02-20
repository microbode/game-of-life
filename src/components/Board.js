import React, { useState } from "react";
import PropTypes from "prop-types";
import { getColumsNumber, getRowsNumber, flipOneCell } from "../helpers";
import { Grid, Cell } from "../styles/styles";

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
    <div className={"grid-container"}>
      <Grid
        width={width}
        height={height}
        color="black"
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
          ))
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
