import React from "react";

const ACTION_OPTIONS = [
  { value: "showMessage", label: "Show Message" },
  { value: "redirect", label: "Redirect to URL" },
  { value: "setFieldValue", label: "Set Field Value" },
  { value: "preventDefault", label: "Prevent Default" },
];

interface ActionSelectorProps {
  value: string;
  onChange: (action: string) => void;
}

export const ActionSelector: React.FC<ActionSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="action-selector">
      <label
        htmlFor="action"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Action
      </label>
      <select
        id="action"
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select an action...
        </option>
        {ACTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
