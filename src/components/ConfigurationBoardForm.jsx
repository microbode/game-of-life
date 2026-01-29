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
    setRefreshRate(Number(event.target.value));
  };

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
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
              ${
                cellSize === 10
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            10px
          </button>
          <button
            type="button"
            onClick={() => !running && setCellSize(20)}
            disabled={running}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
              ${
                cellSize === 20
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            20px
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="refreshRate" className="label-scientific">
          Speed (ms)
        </label>
        <div className="flex items-center gap-3">
          <input
            {...register("refreshRate", { setValueAs: (v) => parseInt(v) })}
            type="range"
            min={0}
            max={500}
            step={50}
            defaultValue={refreshRate}
            onChange={handleChangeRate}
            disabled={running}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span
            className="w-16 text-right text-sm text-gray-900"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {refreshRate}ms
          </span>
        </div>
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
