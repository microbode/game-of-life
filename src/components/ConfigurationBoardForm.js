import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { getSizes, getMaxValidSize } from "../helpers";

const ConfigurationBoardForm = ({
  boardWidth,
  boardHeight,
  setBoardWidth,
  setBoardHeight,
  cellSize,
  setCellSize,
  refreshRate,
  setRefreshRate,
  running,
}) => {
  const { register, setValue } = useForm();

  useEffect(() => {
    const setBoardDimension = () => {
      const size = getMaxValidSize();
      setBoardWidth(size);
      setBoardHeight(size);
      setValue("boardWidth", size);
      setValue("boardHeight", size);
    };

    window.addEventListener("resize", setBoardDimension);

    return () => {
      window.removeEventListener("resize", setBoardDimension);
    };
  }, []);

  const handleChangeWidth = (event) => {
    setBoardWidth(Number(event.target.value));
  };

  const handleChangeHeight = (event) => {
    setBoardHeight(Number(event.target.value));
  };

  const handleChangeCells = (event) => {
    setCellSize(Number(event.target.value));
  };

  const handleChangeRate = (event) => {
    setRefreshRate(Number(event.target.value));
  };

  return (
    <section className={"configuraion-board"}>
      <h3>Board configuration</h3>
      <form className={"board-configuration-form"}>
        <label htmlFor="boardWidth">Width</label>
        <select
          {...register("boardWidth", { setValueAs: (v) => parseInt(v) })}
          defaultValue={boardWidth}
          onChange={handleChangeWidth}
          disabled={running}
        >
          {getSizes().map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label htmlFor="boardHeight">Height</label>
        <select
          {...register("boardHeight", { setValueAs: (v) => parseInt(v) })}
          defaultValue={boardHeight}
          onChange={handleChangeHeight}
          disabled={running}
        >
          {getSizes().map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label htmlFor="cellSize">Cell size</label>
        <select
          {...register("cellSize", { setValueAs: (v) => parseInt(v) })}
          type="number"
          defaultValue={cellSize}
          onChange={handleChangeCells}
          disabled={running}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <label htmlFor="refreshRate">Refresh</label>
        <input
          {...register("refreshRate", { setValueAs: (v) => parseInt(v) })}
          type="number"
          step={100}
          min={0}
          defaultValue={refreshRate}
          onChange={handleChangeRate}
          disabled={running}
        />
      </form>
    </section>
  );
};

ConfigurationBoardForm.displayName = "ConfigurationBoardForm";
ConfigurationBoardForm.propTypes = {
  boardWidth: PropTypes.number,
  boardHeight: PropTypes.number,
  setBoardWidth: PropTypes.func,
  setBoardHeight: PropTypes.func,
  cellSize: PropTypes.number,
  setCellSize: PropTypes.func,
  refreshRate: PropTypes.number,
  setRefreshRate: PropTypes.func,
  running: PropTypes.bool,
};

export default ConfigurationBoardForm;
