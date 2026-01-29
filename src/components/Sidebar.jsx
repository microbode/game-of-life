import PropTypes from "prop-types";

export function Sidebar({ children }) {
  return (
    <aside className="h-screen w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">{children}</div>
    </aside>
  );
}

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
};
