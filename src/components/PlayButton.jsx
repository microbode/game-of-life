import PropTypes from "prop-types";

const PlayIcon = ({ size }) => (
  <svg
    style={{ width: size, height: size, marginLeft: "2px" }}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

PlayIcon.propTypes = {
  size: PropTypes.number.isRequired,
};

const StopIcon = ({ size }) => (
  <svg
    style={{ width: size, height: size }}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M6 6h12v12H6z" />
  </svg>
);

StopIcon.propTypes = {
  size: PropTypes.number.isRequired,
};

export function PlayButton({ running, onClick, disabled, size = "medium" }) {
  const sizes = {
    small: { button: 40, icon: 16, shadow: "0 2px 8px rgba(0, 0, 0, 0.15)" },
    medium: { button: 56, icon: 20, shadow: "0 4px 14px rgba(0, 0, 0, 0.25)" },
    large: { button: 64, icon: 24, shadow: "0 4px 14px rgba(0, 0, 0, 0.25)" },
  };

  const { button: buttonSize, icon: iconSize, shadow } = sizes[size];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={running ? "Stop simulation" : "Start simulation"}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: "50%",
        backgroundColor: running ? "#ef4444" : "#3b82f6",
        color: "#ffffff",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: shadow,
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 200ms ease, transform 100ms ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = running ? "#dc2626" : "#2563eb";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = running ? "#ef4444" : "#3b82f6";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(0.95)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      {running ? <StopIcon size={iconSize} /> : <PlayIcon size={iconSize} />}
    </button>
  );
}

PlayButton.propTypes = {
  running: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

PlayButton.defaultProps = {
  disabled: false,
  size: "medium",
};
