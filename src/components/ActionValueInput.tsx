import React from "react";

interface ActionValueInputProps {
  actionType: string;
  value: string;
  onChange: (value: string) => void;
}

export const ActionValueInput: React.FC<ActionValueInputProps> = ({
  actionType,
  value,
  onChange,
}) => {
  if (!actionType) {
    return null;
  }

  const getPlaceholder = () => {
    switch (actionType) {
      case "showMessage":
        return "Enter message text...";
      case "redirect":
        return "Enter URL...";
      case "setFieldValue":
        return "Enter value to set...";
      case "preventDefault":
        return "No configuration needed";
      default:
        return "Enter value...";
    }
  };

  const getLabel = () => {
    switch (actionType) {
      case "showMessage":
        return "Message";
      case "redirect":
        return "URL";
      case "setFieldValue":
        return "Value";
      case "preventDefault":
        return "Configuration";
      default:
        return "Value";
    }
  };

  const isDisabled = actionType === "preventDefault";

  return (
    <div className="action-value-input">
      <label
        htmlFor="action-value"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {getLabel()}
      </label>
      <input
        id="action-value"
        type="text"
        placeholder={getPlaceholder()}
        value={isDisabled ? "No configuration required" : value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
          isDisabled ? "bg-gray-100 text-gray-500" : ""
        }`}
      />
    </div>
  );
};
