import * as PATTERNS from "./patterns";
import { applyPattern } from "./helpers";

const getSetup1 = (state) => {
  let newState = applyPattern({
    pattern: PATTERNS.BLINKER,
    state,
    initialX: 20,
    initialY: 20,
  });
  newState = applyPattern({
    pattern: PATTERNS.BLINKER,
    state: newState,
    initialX: 24,
    initialY: 20,
  });
  newState = applyPattern({
    pattern: PATTERNS.GLIDER,
    state: newState,
    initialX: 9,
    initialY: 10,
  });
  return newState;
};

const getSetup2 = (state) => {
  let newState = applyPattern({
    pattern: PATTERNS.PULSAR,
    state: state,
    initialX: 40,
    initialY: 10,
  });
  newState = applyPattern({
    pattern: PATTERNS.HWSS,
    state: newState,
    initialX: 10,
    initialY: 10,
  });
  newState = applyPattern({
    pattern: PATTERNS.PENTADECATHLON,
    state: newState,
    initialX: 60,
    initialY: 55,
  });
  newState = applyPattern({
    pattern: PATTERNS.GLIDER,
    state: newState,
    initialX: 30,
    initialY: 35,
  });
  return newState;
};

const setups = {
  "Setup 1": getSetup1,
  "Setup 2": getSetup2,
};

export default setups;
