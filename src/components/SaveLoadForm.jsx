import { useState } from "react";
import PropTypes from "prop-types";

export function SaveLoadForm({
  cells,
  liveCells,
  savedBoards,
  isRunning,
  onSave,
  onLoad,
  onDelete,
}) {
  const [saveName, setSaveName] = useState("");
  const [error, setError] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);

  const handleSave = () => {
    const name = saveName.trim();
    if (!name || liveCells === 0) return;
    if (savedBoards[name]) {
      setError(`"${name}" already exists. Choose a different name.`);
      return;
    }
    setError("");
    onSave(name, cells);
    setSaveName("");
  };

  const boardNames = Object.keys(savedBoards);

  return (
    <div data-testid="save-load-panel" className="space-y-3">
      <div className="flex gap-2">
        <input
          data-testid="save-name-input"
          disabled={isRunning}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Board name..."
          value={saveName}
          onChange={(e) => {
            setSaveName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <button
          data-testid="save-button"
          disabled={liveCells === 0 || !saveName.trim() || isRunning}
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Save
        </button>
      </div>

      {error && (
        <p data-testid="save-error-message" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div
        data-testid="saved-boards-list"
        aria-disabled={isRunning ? "true" : undefined}
        className="space-y-1"
      >
        {boardNames.length === 0 ? (
          <p data-testid="empty-state-message" className="text-xs text-gray-400 italic">
            No saved boards yet.
          </p>
        ) : (
          boardNames.map((name) => (
            <div
              key={name}
              data-testid="saved-board-item"
              className="flex items-center justify-between gap-2 rounded text-sm overflow-hidden"
            >
              <button
                data-testid={`load-button-${name}`}
                aria-pressed={selectedBoard === name ? "true" : "false"}
                onClick={() => {
                  setSelectedBoard(name);
                  onLoad(name);
                }}
                disabled={isRunning}
                className={`truncate flex-1 text-left py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-l transition-colors ${
                  selectedBoard === name
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {name}
              </button>
              <button
                data-testid={`delete-button-${name}`}
                onClick={() => onDelete(name)}
                disabled={isRunning}
                className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r transition-colors"
              >
                Del
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

SaveLoadForm.propTypes = {
  cells: PropTypes.array.isRequired,
  liveCells: PropTypes.number.isRequired,
  savedBoards: PropTypes.object.isRequired,
  isRunning: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onLoad: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

SaveLoadForm.defaultProps = {
  isRunning: false,
};
