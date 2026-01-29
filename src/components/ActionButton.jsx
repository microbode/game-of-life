import PropTypes from "prop-types";

export function ActionButton({ onClick, disabled, icon, label, variant = "default" }) {
  const baseStyles = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid #e5e7eb",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
    transition: "all 200ms ease",
  };

  const variants = {
    default: {
      backgroundColor: "#f9fafb",
      color: "#6b7280",
    },
    danger: {
      backgroundColor: "#f9fafb",
      color: "#6b7280",
    },
  };

  const hoverVariants = {
    default: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
      borderColor: "#d1d5db",
    },
    danger: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      borderColor: "#fecaca",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{ ...baseStyles, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverVariants[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variants[variant]);
          e.currentTarget.style.borderColor = "#e5e7eb";
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
      {icon}
    </button>
  );
}

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["default", "danger"]),
};

ActionButton.defaultProps = {
  disabled: false,
  variant: "default",
};
