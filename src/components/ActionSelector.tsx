import React from "react";
import { RuleAction } from "../schemas/rule.schema";
import {
  getActionsByCategory,
  getActionLabel,
  getActionIcon,
} from "../lib/ruleUtils";

interface ActionSelectorProps {
  value: RuleAction["type"];
  onChange: (action: RuleAction["type"]) => void;
}

export const ActionSelector: React.FC<ActionSelectorProps> = ({
  value,
  onChange,
}) => {
  // Get all actions organized by category
  const actionsByCategory = getActionsByCategory();

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
        onChange={(e) => onChange(e.target.value as RuleAction["type"])}
      >
        <option value="" disabled>
          Select an action...
        </option>
        {Object.entries(actionsByCategory)
          .sort(([, a], [, b]) => (a.meta.order || 0) - (b.meta.order || 0))
          .map(([categoryKey, categoryData]) => (
            <optgroup key={categoryKey} label={categoryData.meta.label}>
              {Object.entries(categoryData.actions).map(([actionKey]) => (
                <option key={actionKey} value={actionKey}>
                  {getActionIcon(actionKey)
                    ? `${getActionIcon(actionKey)} `
                    : ""}
                  {getActionLabel(actionKey)}
                </option>
              ))}
            </optgroup>
          ))}
      </select>
    </div>
  );
};
