import { useEffect } from "react";
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
  }, [setBoardWidth, setBoardHeight, setValue]);

  const handleChangeWidth = (event) => {
    setBoardWidth(Number(event.target.value));
  };

  const handleChangeHeight = (event) => {
    setBoardHeight(Number(event.target.value));
  };

  const handleChangeRate = (event) => {
    const genPerSecond = Number(event.target.value);
    setRefreshRate(Math.round(1000 / genPerSecond));
  };

  const genPerSecond = Math.round(1000 / refreshRate);

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="boardWidth" className="label-scientific">
            Width
          </label>
          <select
            {...register("boardWidth", { setValueAs: (v) => parseInt(v) })}
            defaultValue={boardWidth}
            onChange={handleChangeWidth}
            disabled={running}
            className="input-scientific"
          >
            {getSizes().map((opt) => (
              <option key={opt} value={opt}>
                {opt}px
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="boardHeight" className="label-scientific">
            Height
          </label>
          <select
            {...register("boardHeight", { setValueAs: (v) => parseInt(v) })}
            defaultValue={boardHeight}
            onChange={handleChangeHeight}
            disabled={running}
            className="input-scientific"
          >
            {getSizes().map((opt) => (
              <option key={opt} value={opt}>
                {opt}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="label-scientific">Cell Size</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => !running && setCellSize(10)}
            disabled={running}
            data-selected={cellSize === 10}
            className="cell-size-btn flex-1 py-2 rounded-lg text-sm font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            10px
          </button>
          <button
            type="button"
            onClick={() => !running && setCellSize(20)}
            disabled={running}
            data-selected={cellSize === 20}
            className="cell-size-btn flex-1 py-2 rounded-lg text-sm font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            20px
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="refreshRate" className="label-scientific">
            Speed
          </label>
          <span className="text-xs text-gray-500" style={{ fontFamily: "var(--font-mono)" }}>
            {genPerSecond}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={genPerSecond}
          onChange={handleChangeRate}
          disabled={running}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </form>
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
