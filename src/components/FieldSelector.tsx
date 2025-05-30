import React from "react";
import type { FieldSchemas } from "../lib/fieldUtils";
import { getFieldsByCategory } from "../lib/fieldUtils";

interface FieldSelectorProps {
  value: string;
  onChange: (field: string) => void;
  fields: FieldSchemas;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  value,
  onChange,
  fields,
}) => {
  const fieldOptions = fields ? getFieldsByCategory(fields) : null;

  return (
    <div className="field-selector">
      <label
        htmlFor="field"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Field
      </label>
      <select
        id="field"
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Select a field...
        </option>
        {fieldOptions
          ? // Schema-driven approach with categories
            Object.entries(fieldOptions)
              .sort(([, a], [, b]) => (a.meta.order || 0) - (b.meta.order || 0))
              .map(([categoryKey, categoryData]) => (
                <optgroup key={categoryKey} label={categoryData.meta.label}>
                  {Object.entries(categoryData.fields).map(
                    ([fieldKey, fieldData]: [string, any]) => (
                      <option
                        key={fieldKey}
                        value={fieldKey}
                        data-type={fieldData.type}
                      >
                        {fieldData.label}
                      </option>
                    )
                  )}
                </optgroup>
              ))
          : null}
      </select>
    </div>
  );
};
