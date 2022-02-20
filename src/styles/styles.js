import styled from "styled-components";

export const StyledGridContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Grid = styled.div`
  background: black;
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: ${({ columnsNumber, cellSize }) =>
    `repeat(${columnsNumber}, ${cellSize}px)`};
  grid-template-rows: ${({ rowsNumber, cellSize }) => `repeat(${rowsNumber}, ${cellSize}px)`};
`;

export const Cell = styled.div`
  background: ${(props) => (props.alive ? "white" : "black")};
  border-top: 1px solid #939393;
  border-left: 1px solid #939393;
`;
