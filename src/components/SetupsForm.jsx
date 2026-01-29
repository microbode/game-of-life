import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import SETUPS from "../setups";

const SetupsForm = ({ cells, setCells, running }) => {
  const { register, handleSubmit } = useForm();

  const handleApplySetup = (values) => {
    const emptyCells = Array.from({ length: cells.length }, () => Array(cells[0].length).fill(0));
    const newState = SETUPS[values.setup](emptyCells);
    setCells(newState);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleApplySetup)}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="setup" className="label-scientific">
          Preset
        </label>
        <select
          {...register("setup")}
          defaultValue={Object.keys(SETUPS)[0]}
          disabled={running}
          className="input-scientific"
        >
          {Object.keys(SETUPS).map((setup) => (
            <option key={setup} value={setup}>
              {setup.charAt(0) + setup.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={running} className="btn-primary">
        Apply Setup
      </button>
    </form>
  );
};

SetupsForm.displayName = "SetupsForm";
SetupsForm.propTypes = {
  cells: PropTypes.array,
  setCells: PropTypes.func,
  running: PropTypes.bool,
};

export default SetupsForm;
