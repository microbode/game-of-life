import { useState, memo, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { getColumsNumber, getRowsNumber, flipOneCell, applyPattern } from "../helpers";

const Grid = ({ width, height, cellSize, columnsNumber, rowsNumber, patternMode, children }) => (
  <div
    className={`grid grid-flow-col rounded-lg overflow-hidden ${patternMode ? "board--pattern-mode" : ""}`}
    style={{
      width: `${width}px`,
      height: `${height}px`,
      gridTemplateColumns: `repeat(${columnsNumber}, ${cellSize - 1}px)`,
      gridTemplateRows: `repeat(${rowsNumber}, ${cellSize - 1}px)`,
      backgroundColor: "var(--color-grid-line)",
      border: "1px solid var(--color-border-light)",
      gap: "1px",
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
  patternMode: PropTypes.bool,
  children: PropTypes.node,
};

const Cell = memo(
  ({ alive, x, y, onMouseDown, onMouseUp, onMouseOver }) => (
    <div
      data-x={x}
      data-y={y}
      className={`cell ${alive ? "cell--alive" : "cell--dead"}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
    />
  ),
  (prevProps, nextProps) => prevProps.alive === nextProps.alive,
);

Cell.displayName = "Cell";
Cell.propTypes = {
  alive: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseOver: PropTypes.func,
};

const Board = ({ cells, cellSize, height, setCells, width, selectedPattern, onPatternPlace }) => {
  const [mouseDown, setMouseDown] = useState(false);
  const columnsNumber = getColumsNumber(width, cellSize);
  const rowsNumber = getRowsNumber(height, cellSize);

  // Refs para acceder siempre al estado actual sin recrear handlers
  const cellsRef = useRef(cells);
  const selectedPatternRef = useRef(selectedPattern);
  const mouseDownRef = useRef(mouseDown);

  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  useEffect(() => {
    selectedPatternRef.current = selectedPattern;
  }, [selectedPattern]);

  useEffect(() => {
    mouseDownRef.current = mouseDown;
  }, [mouseDown]);

  const handleMouseDown = useCallback(
    (e) => {
      const x = parseInt(e.target.dataset.x);
      const y = parseInt(e.target.dataset.y);

      if (selectedPatternRef.current) {
        const newCells = applyPattern({
          pattern: selectedPatternRef.current.pattern,
          state: cellsRef.current,
          initialX: x,
          initialY: y,
        });
        setCells(newCells);
        if (onPatternPlace) {
          onPatternPlace();
        }
      } else {
        const newCells = flipOneCell({ cells: cellsRef.current, x, y });
        setCells(newCells);
        setMouseDown(true);
      }
    },
    [setCells, onPatternPlace],
  );

  const handleMouseUp = useCallback(() => {
    setMouseDown(false);
  }, []);

  const handleMouseOver = useCallback(
    (e) => {
      if (mouseDownRef.current && !selectedPatternRef.current) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        const newCells = flipOneCell({ cells: cellsRef.current, x, y });
        setCells(newCells);
      }
    },
    [setCells],
  );

  return (
    <div className="grid-container">
      <Grid
        width={width}
        height={height}
        cellSize={cellSize}
        columnsNumber={columnsNumber}
        rowsNumber={rowsNumber}
        patternMode={!!selectedPattern}
      >
        {cells.map((column, xIndex) =>
          column.map((cell, yIndex) => (
            <Cell
              key={`${xIndex}-${yIndex}`}
              alive={cell}
              x={xIndex}
              y={yIndex}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseOver={handleMouseOver}
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
  selectedPattern: PropTypes.object,
  onPatternPlace: PropTypes.func,
};

export default Board;
