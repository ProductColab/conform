"use client";

import React from "react";
import { SchemaField } from "./SchemaField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { z } from "zod/v4";
import type { FieldConfig } from "../hooks/useFormRules";
import { useRuleContext } from "../contexts/RuleContext";

interface RuleBasedSchemaFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required?: boolean;
  description?: string;
  disabled?: boolean;

  // Rule-based enhancements (optional)
  ruleConfig?: FieldConfig;

  // Enhanced labels and styling
  label?: string;
  className?: string;

  // Context support (for context-driven configuration)
  useContext?: boolean;
}

function applyRuleEnhancements(
  props: Pick<
    RuleBasedSchemaFieldProps,
    "property" | "required" | "disabled" | "description" | "label"
  >,
  ruleConfig?: FieldConfig
): Pick<
  RuleBasedSchemaFieldProps,
  "property" | "required" | "disabled" | "description"
> {
  if (!ruleConfig) return props;

  return {
    ...props,
    required: props.required || ruleConfig.required,
    disabled: props.disabled || ruleConfig.disabled,
  };
}

export function RuleBasedSchemaField({
  name,
  property,
  required = false,
  description,
  disabled = false,
  ruleConfig,
  label,
  className,
  useContext = false,
}: RuleBasedSchemaFieldProps) {
  // Always call the hook, but only use the result if useContext is true
  const contextConfig = useRuleContext(name);
  const finalRuleConfig =
    ruleConfig ?? (useContext ? contextConfig : undefined);

  // Apply rule-based enhancements to props
  const enhancedProps = applyRuleEnhancements(
    { property, required, disabled, description, label },
    finalRuleConfig
  );

  // Enhanced property with dynamic options from rules
  const enhancedProperty = React.useMemo(() => {
    if (!finalRuleConfig?.options || finalRuleConfig.options.length === 0) {
      return property;
    }

    // If we have dynamic options from rules, apply them to enum properties
    if (property.type === "string" || "enum" in property) {
      return {
        ...property,
        enum: finalRuleConfig.options as (string | number | boolean | null)[],
      } as z.core.JSONSchema.Schema;
    }

    return property;
  }, [property, finalRuleConfig?.options]);

  // If field is hidden by rules, don't render anything
  if (finalRuleConfig && finalRuleConfig.visible === false) {
    return null;
  }

  // Combine CSS classes from rules with component className
  const combinedClassName = [className, ...(finalRuleConfig?.classes || [])]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClassName}>
      <SchemaField
        name={name}
        property={enhancedProperty}
        required={enhancedProps.required ?? false}
        description={enhancedProps.description}
        disabled={enhancedProps.disabled ?? false}
      />

      {/* Rule-based warnings */}
      {finalRuleConfig?.warnings && finalRuleConfig.warnings.length > 0 && (
        <div className="mt-1 space-y-1">
          {finalRuleConfig.warnings.map((warning: string, index: number) => (
            <Alert key={`warning-${index}`} variant="default" className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">{warning}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Rule-based errors */}
      {finalRuleConfig?.errors && finalRuleConfig.errors.length > 0 && (
        <div className="mt-1 space-y-1">
          {finalRuleConfig.errors.map((error: string, index: number) => (
            <Alert
              key={`error-${index}`}
              variant="destructive"
              className="py-2"
            >
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
