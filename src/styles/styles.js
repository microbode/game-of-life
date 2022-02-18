import styled from "styled-components";

export const StyledGridContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledFormHead = styled.div`
  font-size: 1.7em;
  font-weight: bold;
  margin-bottom: 1em;
`;

export const StyledInput = styled.input`
  border: none;
  font-size: 1em;
  max-width: 5em;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-right: 0.5em;
  background-color: #ededed;
  :disabled {
    color: #000000;
    background-color: #ededed;
    opacity: 0.7;
  }
  :focus {
    outline: none;
    background-color: #ffffff;
  }
  :hover {
    background-color: #ffffff;
  }
`;

export const StyledSelect = styled.select`
  font-size: 1em;
  margin-bottom: 1em;
  width: fit-content;
  padding-right: 0.5em;
  border: none;
  background-color: #ededed;
  padding-top: 2px;
  padding-bottom: 2px;
  :disabled {
    color: #000000;
    background-color: #ededed;
    opacity: 0.7;
  }
  :focus {
    outline: none;
    background-color: #ffffff;
  }
  :hover {
    background-color: #ffffff;
  }
`;

export const StyledSubmit = styled.input`
  margin-top: 1em;
  width: fit-content;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-left: 1em;
  padding-right: 1em;
`;

export const StyledButton = styled.button`
  border: none;
  border-radius: 0.2em;
  cursor: pointer;
  width: fit-content;
  font-size: 1em;
  font-weight: bold;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 0.6em;
  padding-right: 0.6em;
  background-color: #828282;
  :disabled {
    color: #000000;
    background-color: #828282;
    opacity: 0.7;
  }
  :hover {
    background-color: #b9b9b9;
  }
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

export const StyledButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 5em;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.5em;
  align-items: center;
  justify-content: flex-end;
`;

export const PatternsBlock = styled.div`
  display: flex;
`;

export const StyledButtonAdd = styled(StyledButton)`
  margin-left: 0.5em;
`;

export const StyledButtonApply = styled(StyledButton)`
  margin-left: 0.5em;
  padding-bottom: 4px;
`;

export const StyledButtonGo = styled(StyledButton)`
  font-size: 1.5em;
  font-weight: bold;
  background-color: #028c3a;
  border: 2px solid black;
  :hover {
    background-color: #00ae46;
  }
  color: black;
`;

export const StyledButtonStop = styled(StyledButton)`
  font-size: 1.5em;
  font-weight: bold;
  background-color: #c31414;
  border: 2px solid black;
  color: black;
  :hover {
    background-color: #fb0000;
  }
`;
