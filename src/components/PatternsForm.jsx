import { useState } from "react";
import PropTypes from "prop-types";
import * as PATTERNS from "../patterns";

const PatternThumbnail = ({ pattern, cellSize = 4 }) => {
  const width = pattern.length;
  const height = pattern[0]?.length || 0;
  const maxSize = Math.max(width, height);
  const scale = maxSize > 7 ? 3 : cellSize;

  return (
    <div
      className="grid grid-flow-col"
      style={{
        gridTemplateColumns: `repeat(${width}, ${scale}px)`,
        gridTemplateRows: `repeat(${height}, ${scale}px)`,
        gap: "1px",
      }}
    >
      {pattern.map((col, x) =>
        col.map((cell, y) => (
          <div key={`${x}-${y}`} className={`rounded-sm ${cell ? "bg-gray-900" : "bg-gray-200"}`} />
        )),
      )}
    </div>
  );
};

PatternThumbnail.propTypes = {
  pattern: PropTypes.array.isRequired,
  cellSize: PropTypes.number,
};

const PATTERN_CATEGORIES = {
  "Still Lifes": ["BLOCK", "BEEHIVE", "LOAF", "BOAT", "TUB"],
  Oscillators: ["BLINKER", "TOAD", "BEACON", "PULSAR", "PENTADECATHLON"],
  Spaceships: ["GLIDER", "LWSS", "MWSS", "HWSS"],
};

const formatPatternName = (name) => {
  return name.charAt(0) + name.slice(1).toLowerCase();
};

const PatternsForm = ({ running, selectedPattern, onPatternSelect }) => {
  const [hoveredPattern, setHoveredPattern] = useState(null);

  const handlePatternClick = (patternKey) => {
    if (running) return;

    if (selectedPattern?.key === patternKey) {
      onPatternSelect(null);
    } else {
      onPatternSelect({
        key: patternKey,
        pattern: PATTERNS[patternKey],
      });
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(PATTERN_CATEGORIES).map(([category, patternKeys]) => (
        <div key={category}>
          <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">{category}</h4>
          <div className="grid grid-cols-3 gap-2">
            {patternKeys.map((patternKey) => {
              const pattern = PATTERNS[patternKey];
              if (!pattern) return null;

              const isSelected = selectedPattern?.key === patternKey;
              const isHovered = hoveredPattern === patternKey;

              return (
                <div key={patternKey} className="relative">
                  <button
                    type="button"
                    onClick={() => handlePatternClick(patternKey)}
                    onMouseEnter={() => setHoveredPattern(patternKey)}
                    onMouseLeave={() => setHoveredPattern(null)}
                    disabled={running}
                    className={`
                      w-full flex flex-col items-center gap-1.5 p-2 rounded-lg
                      transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    <div className="flex items-center justify-center min-h-[28px]">
                      <PatternThumbnail pattern={pattern} />
                    </div>
                    <span
                      className={`text-[10px] truncate w-full text-center font-medium ${isSelected ? "text-blue-700" : "text-gray-500"}`}
                    >
                      {formatPatternName(patternKey)}
                    </span>
                  </button>

                  {/* Tooltip on hover */}
                  {isHovered && !running && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-10">
                      {isSelected ? "Click to deselect" : "Click to place on board"}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

PatternsForm.displayName = "PatternsForm";
PatternsForm.propTypes = {
  cells: PropTypes.array,
  setCells: PropTypes.func,
  running: PropTypes.bool,
  toogleRunning: PropTypes.func,
  selectedPattern: PropTypes.object,
  onPatternSelect: PropTypes.func,
};

export default PatternsForm;
