import PropTypes from "prop-types";
import { PlayButton } from "./PlayButton";
import { ActionButton } from "./ActionButton";

const GridIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="5" height="5" rx="1" />
    <rect x="10" y="3" width="5" height="5" rx="1" />
    <rect x="17" y="3" width="5" height="5" rx="1" opacity="0.3" />
    <rect x="3" y="10" width="5" height="5" rx="1" opacity="0.3" />
    <rect x="10" y="10" width="5" height="5" rx="1" />
    <rect x="17" y="10" width="5" height="5" rx="1" />
    <rect x="3" y="17" width="5" height="5" rx="1" />
    <rect x="10" y="17" width="5" height="5" rx="1" opacity="0.3" />
    <rect x="17" y="17" width="5" height="5" rx="1" />
  </svg>
);

GridIcon.propTypes = {
  size: PropTypes.number,
};

const DiceIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="8" cy="8" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="16" cy="16" r="1.5" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export function Header({ generation, liveCells, running, onToggleRunning, onRandomize, onClear }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2.5">
        <GridIcon size={24} />
        <h1
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "#1d1d1f",
          }}
        >
          Game of Life
        </h1>
      </div>

      {/* Control Group - Center */}
      <div className="flex items-center gap-2">
        <ActionButton onClick={onRandomize} disabled={running} icon={<DiceIcon />} label="Random" />
        <PlayButton running={running} onClick={onToggleRunning} size="small" />
        <ActionButton
          onClick={onClear}
          disabled={running}
          icon={<TrashIcon />}
          label="Clear"
          variant="danger"
        />
      </div>

      {/* Stats - Right */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-400 hidden sm:inline">
            Gen
          </span>
          <span
            className="text-sm lg:text-base font-medium text-gray-900 tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {String(generation).padStart(4, "0")}
          </span>
        </div>

        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-400 hidden sm:inline">
            Cells
          </span>
          <span
            className="text-sm lg:text-base font-medium text-gray-900 tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {String(liveCells).padStart(4, "0")}
          </span>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  generation: PropTypes.number.isRequired,
  liveCells: PropTypes.number.isRequired,
  running: PropTypes.bool.isRequired,
  onToggleRunning: PropTypes.func.isRequired,
  onRandomize: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
