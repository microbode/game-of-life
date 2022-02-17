import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import React from "react";
import {
  PatternsBlock,
  Column,
  CustomStyledSelect,
  CustomStyledInput,
  StyledButtonAdd,
} from "../styles/styles";
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
    <section>
      <h3>Patterns</h3>
      <form className={"patterns-form"} onSubmit={handleSubmit(handleAddPattern)}>
        <PatternsBlock>
          <Column>
            <label htmlFor="pattern">Pattern</label>
            <CustomStyledSelect {...register("pattern")} defaultValue={"block"} disabled={running}>
              {Object.keys(PATTERNS).map((pattern) => (
                <option key={pattern} value={pattern}>
                  {`${pattern.charAt(0) + pattern.slice(1).toLowerCase()}`}
                </option>
              ))}
            </CustomStyledSelect>
          </Column>

          <Column>
            <label htmlFor="x">X</label>
            <CustomStyledInput
              {...register("x", { setValueAs: (v) => parseInt(v) })}
              type="text"
              defaultValue={0}
              disabled={running}
            />
          </Column>

          <Column>
            <label htmlFor="y">Y</label>
            <CustomStyledInput
              {...register("y", { setValueAs: (v) => parseInt(v) })}
              type="text"
              defaultValue={0}
              disabled={running}
            />
          </Column>

          <Column>
            <StyledButtonAdd type="submit" disabled={running}>
              Add
            </StyledButtonAdd>
          </Column>
        </PatternsBlock>
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
