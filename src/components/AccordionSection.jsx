import { useState } from "react";
import PropTypes from "prop-types";

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
  </svg>
);

ChevronIcon.propTypes = {
  open: PropTypes.bool.isRequired,
};

export function AccordionSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <ChevronIcon open={isOpen} />
      </button>

      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[60vh] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}
        `}
      >
        <div className="p-4 bg-white max-h-[calc(60vh-3rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

AccordionSection.propTypes = {
  title: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
