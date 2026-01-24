import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import React from "react";
import { applyPattern } from "../helpers";
import * as PATTERNS from "../patterns";

const PatternsForm = ({ cells, setCells, running }) => {
  const { register, handleSubmit } = useForm();
  const handleAddPattern = (values) => {
    const newState = applyPattern({
      pattern: PATTERNS[values.pattern],
      state: cells,
      initialX: values.x,
      initialY: values.y,
    });
    setCells(newState);
  };

  return (
    <section className={"patterns"}>
      <h3>Patterns</h3>
      <form className={"patterns-form"} onSubmit={handleSubmit(handleAddPattern)}>
        <div className={"patterns-form__column"}>
          <label htmlFor="pattern">Pattern</label>
          <select {...register("pattern")} defaultValue={"block"} disabled={running}>
            {Object.keys(PATTERNS).map((pattern) => (
              <option key={pattern} value={pattern}>
                {`${pattern.charAt(0) + pattern.slice(1).toLowerCase()}`}
              </option>
            ))}
          </select>
        </div>

        <div className={"patterns-form__column"}>
          <label htmlFor="x">X</label>
          <input
            {...register("x", { setValueAs: (v) => parseInt(v) })}
            type="text"
            defaultValue={0}
            disabled={running}
          />
        </div>

        <div className={"patterns-form__column"}>
          <label htmlFor="y">Y</label>
          <input
            {...register("y", { setValueAs: (v) => parseInt(v) })}
            type="text"
            defaultValue={0}
            disabled={running}
          />
        </div>

        <div className={"patterns-form__column"}>
          <button type="submit" disabled={running}>
            Add
          </button>
        </div>
      </form>
    </section>
  );
};

PatternsForm.displayName = "PatternsForm";
PatternsForm.propTypes = {
  cells: PropTypes.array,
  setCells: PropTypes.func,
  running: PropTypes.bool,
};

export default PatternsForm;
