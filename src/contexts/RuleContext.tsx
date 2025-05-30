"use client";

import { createContext, useContext, useMemo } from "react";
import type { FieldConfig } from "../hooks/useFormRules";
import type { FieldValues } from "react-hook-form";

interface RuleContextType<T extends FieldValues = FieldValues> {
  getFieldConfig: (fieldName: string) => FieldConfig | undefined;
  // We can add more context data here as needed
  formData?: T;
}

// Rule context for advanced composition scenarios
const RuleContext = createContext<RuleContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useRuleContext = (fieldName?: string): FieldConfig | undefined => {
  const context = useContext(RuleContext);
  if (!context || !fieldName) return undefined;
  return context.getFieldConfig(fieldName);
};

export const RuleContextProvider = <T extends FieldValues = FieldValues>({
  children,
  getFieldConfig,
  formData,
}: {
  children: React.ReactNode;
  getFieldConfig: (fieldName: string) => FieldConfig | undefined;
  formData?: T;
}) => {
  const value = useMemo(
    () => ({ getFieldConfig, formData }),
    [getFieldConfig, formData]
  );

  return <RuleContext.Provider value={value}>{children}</RuleContext.Provider>;
};
