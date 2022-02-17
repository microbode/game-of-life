import React from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { PatternsBlock, Column, CustomStyledSelect, StyledButtonApply } from "../styles/styles";
import SETUPS from "../setups";

const SetupsForm = ({ cells, setCells, running }) => {
  const { register, handleSubmit } = useForm();

  const handleApplySetup = (values) => {
    const emptyCells = Array.from({ length: cells.length }, () => Array(cells[0].length).fill(0));
    const newState = SETUPS[values.setup](emptyCells);
    setCells(newState);
  };

  return (
    <section>
      <h3>Setups</h3>
      <form className={"setup-form"} onSubmit={handleSubmit(handleApplySetup)}>
        <PatternsBlock>
          <Column>
            <CustomStyledSelect {...register("setup")} defaultValue={"block"} disabled={running}>
              {Object.keys(SETUPS).map((setup) => (
                <option key={setup} value={setup}>
                  {`${setup.charAt(0) + setup.slice(1).toLowerCase()}`}
                </option>
              ))}
            </CustomStyledSelect>
          </Column>

          <Column>
            <StyledButtonApply type="submit" disabled={running}>
              Apply
            </StyledButtonApply>
          </Column>
        </PatternsBlock>
      </form>
    </section>
  );
};

SetupsForm.displayName = "SetupsForm";
SetupsForm.propTypes = {
  cells: PropTypes.array,
  setCells: PropTypes.func,
  running: PropTypes.bool,
};

export default SetupsForm;
