import React, { useState } from "react";
import { FieldSelector } from "./FieldSelector";
import { OperatorSelector } from "./OperatorSelector";
import { ValueInput } from "./ValueInput";
import { ActionSelector } from "./ActionSelector";
import { ActionValueInput } from "./ActionValueInput";
import { CodePreview } from "./CodePreview";
import type { FieldSchemas } from "../lib/fieldUtils";
import type { BaseCondition, RuleAction, Rule } from "../schemas/rule.schema";

interface RuleBuilderProps {
  fields: FieldSchemas;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ fields }) => {
  const [condition, setCondition] = useState<BaseCondition>({
    field: "",
    operator: "equals" as const,
    value: "",
  });

  const [action, setAction] = useState<RuleAction>({
    type: "" as RuleAction["type"],
    value: "",
  });

  const updateCondition = (updates: Partial<BaseCondition>) => {
    setCondition((prev) => ({ ...prev, ...updates }));
  };

  const updateValue = (value: string | number | boolean) => {
    let convertedValue: string | number | boolean = value;

    if (typeof value === "string") {
      // Try to convert boolean strings
      if (value === "true") {
        convertedValue = true;
      } else if (value === "false") {
        convertedValue = false;
      }
      // Try to convert numeric strings to numbers
      else if (/^\d+$/.test(value)) {
        convertedValue = parseInt(value, 10);
      } else if (/^\d*\.\d+$/.test(value)) {
        convertedValue = parseFloat(value);
      }
    }

    updateCondition({ value: convertedValue });
  };

  const updateAction = (updates: Partial<RuleAction>) => {
    setAction((prev) => ({ ...prev, ...updates }));
  };

  const rule: Rule = {
    condition,
    actions: action.type ? [action] : [],
    enabled: true,
  };

  return (
    <div className="rule-builder p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Visual Rule Builder</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Builder Panel */}
        <div className="builder-panel bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Build Your Rule</h2>

          <div className="space-y-4">
            {/* Condition Section */}
            <div className="condition-section">
              <h3 className="text-md font-medium text-gray-800 mb-3">
                When...
              </h3>
              <div className="space-y-3">
                <FieldSelector
                  value={condition.field}
                  onChange={(field) => updateCondition({ field })}
                  fields={fields}
                />
                <OperatorSelector
                  value={condition.operator}
                  onChange={(operator) => updateCondition({ operator })}
                />
                <ValueInput
                  value={condition.value as string | number | boolean}
                  onChange={(value) => updateValue(value)}
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="action-section border-t pt-4">
              <h3 className="text-md font-medium text-gray-800 mb-3">
                Then...
              </h3>
              <div className="space-y-3">
                <ActionSelector
                  value={action.type}
                  onChange={(type) => updateAction({ type, value: "" })}
                />
                {action.type && (
                  <ActionValueInput
                    actionType={action.type}
                    value={action.value as string}
                    onChange={(value) => updateAction({ value })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Code Preview Panel */}
        <div className="code-panel bg-gray-50 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Generated Code</h2>
          <CodePreview rule={rule} />
        </div>
      </div>
    </div>
  );
};
