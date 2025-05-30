import React from "react";

interface ValueInputProps {
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

export const ValueInput: React.FC<ValueInputProps> = ({ value, onChange }) => {
  return (
    <div className="value-input">
      <label
        htmlFor="value"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Value
      </label>
      <input
        id="value"
        type="text"
        placeholder="Enter value..."
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};
