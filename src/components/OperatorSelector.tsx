import React from "react";
import type { ComparisonOperatorType } from "../schemas/rule.schema";
import {
  getOperatorsByCategory,
  operatorSupportsType,
  getOperatorLabel,
} from "../lib/ruleUtils";

interface OperatorSelectorProps {
  value: ComparisonOperatorType | "";
  onChange: (operator: ComparisonOperatorType) => void;
  fieldType?: string; // Optional field type for filtering relevant operators
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  value,
  onChange,
  fieldType,
}) => {
  // Get all operators organized by category
  const operatorsByCategory = getOperatorsByCategory();

  // Filter operators based on field type for better UX
  const getRelevantCategories = () => {
    if (!fieldType) return operatorsByCategory;

    const filteredCategories: typeof operatorsByCategory = {};

    Object.entries(operatorsByCategory).forEach(
      ([categoryKey, categoryData]) => {
        const filteredOperators: Record<string, any> = {};

        Object.entries(categoryData.operators).forEach(
          ([operatorKey, operatorMeta]) => {
            if (operatorSupportsType(operatorKey, fieldType)) {
              filteredOperators[operatorKey] = operatorMeta;
            }
          }
        );

        // Only include categories that have relevant operators
        if (Object.keys(filteredOperators).length > 0) {
          filteredCategories[categoryKey] = {
            ...categoryData,
            operators: filteredOperators,
          };
        }
      }
    );

    return filteredCategories;
  };

  const relevantCategories = getRelevantCategories();

  return (
    <div className="operator-selector">
      <label
        htmlFor="operator"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Operator
        {fieldType && (
          <span className="text-xs text-gray-500 ml-1">({fieldType})</span>
        )}
      </label>
      <select
        id="operator"
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value as ComparisonOperatorType)}
      >
        <option value="" disabled>
          Select an operator...
        </option>
        {Object.entries(relevantCategories)
          .sort(([, a], [, b]) => (a.meta.order || 0) - (b.meta.order || 0))
          .map(([categoryKey, categoryData]) => (
            <optgroup key={categoryKey} label={categoryData.meta.label}>
              {Object.entries(categoryData.operators).map(
                ([operatorKey, operatorMeta]) => (
                  <option key={operatorKey} value={operatorKey}>
                    {operatorMeta.icon ? `${operatorMeta.icon} ` : ""}
                    {getOperatorLabel(operatorKey)}
                  </option>
                )
              )}
            </optgroup>
          ))}
      </select>
    </div>
  );
};
