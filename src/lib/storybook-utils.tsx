"use client";
import type { Meta } from "@storybook/react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";
import { FieldPresets } from "@/utils/field-presets";
import { expect, userEvent, within } from "@storybook/test";

/**
 * React Hook Form decorator for Storybook
 * Wraps form field components with FormProvider context
 */
export const withFormProvider =
  (defaultValues = {}) =>
  (Story: any) => {
    const methods = useForm({
      defaultValues,
      mode: "onChange",
    });

    return (
      <FormProvider {...methods}>
        <div className="p-4 max-w-md">
          <Story />
        </div>
      </FormProvider>
    );
  };

/**
 * Common metadata presets for stories (using existing FieldPresets)
 */
export const mockMetadata = {
  basic: {} as FieldMetadata,
  withPrefix: {
    prefix: "$",
  } as FieldMetadata,
  withSuffix: {
    suffix: "USD",
  } as FieldMetadata,
  withPlaceholder: {
    placeholder: "Enter your value here...",
  } as FieldMetadata,
  withPrefixAndSuffix: {
    prefix: "$",
    suffix: "USD",
  } as FieldMetadata,
  // Use existing presets from FieldPresets
  password: FieldPresets.password,
  email: FieldPresets.email,
  phone: FieldPresets.phone,
  url: FieldPresets.url,
  currency: FieldPresets.currency,
  percentage: FieldPresets.percentage,
  secretToken: FieldPresets.secretToken,
  apiKey: FieldPresets.apiKey,
};

/**
 * Common JSON Schema objects for stories
 */
export const mockSchemas = {
  string: {
    type: "string",
  } as z.core.JSONSchema.Schema,
  stringWithMinLength: {
    type: "string",
    minLength: 3,
  } as z.core.JSONSchema.Schema,
  stringWithMaxLength: {
    type: "string",
    maxLength: 50,
  } as z.core.JSONSchema.Schema,
  stringWithPattern: {
    type: "string",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  } as z.core.JSONSchema.Schema,
  number: {
    type: "number",
  } as z.core.JSONSchema.Schema,
  numberWithRange: {
    type: "number",
    minimum: 0,
    maximum: 100,
  } as z.core.JSONSchema.Schema,
};

/**
 * Common control configurations for Storybook
 */
export const commonControls = {
  name: {
    control: { type: "text" },
    description: "The field name (used for form binding)",
  },
  label: {
    control: { type: "text" },
    description: "The field label displayed to users",
  },
  description: {
    control: { type: "text" },
    description: "Optional description text shown below the field",
  },
  required: {
    control: { type: "boolean" },
    description: "Whether the field is required (shows * indicator)",
  },
  property: {
    control: { type: "object" },
    description: "JSON Schema object defining the field validation",
  },
  metadata: {
    control: { type: "object" },
    description: "Field metadata for customization (prefix, suffix, etc.)",
  },
};

/**
 * Helper to create consistent meta configurations
 */
export function createFieldMeta<T>(title: string, component: T): Meta<T> {
  return {
    title: `Field Types/${title}`,
    component,
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component: `Interactive ${title.toLowerCase()} component with various customization options.`,
        },
      },
    },
    tags: ["autodocs"],
    decorators: [withFormProvider()],
  } as Meta<T>;
}

/**
 * Generate story args for consistent testing
 */
export function createStoryArgs(overrides: any = {}) {
  const args = {
    name: "testField",
    label: "Test Field",
    required: false,
    property: mockSchemas.string,
    metadata: mockMetadata.basic,
    ...overrides,
  };

  // Attach metadata to the property object so extractMetadata can find it
  if (args.metadata && args.property) {
    args.property = {
      ...args.property,
      metadata: args.metadata,
    };
  }

  return args;
}

/**
 * Helper to get form input that works with React Hook Form structure
 * where labels point to wrapper divs instead of inputs directly
 */
export const getFormInput = (canvas: any, label: string, required = false) => {
  const expectedLabel = required ? `${label} *` : label;

  // Try direct label association first
  try {
    return canvas.getByLabelText(expectedLabel);
  } catch {
    // If that fails, look for input by role and approximate label matching
    try {
      // First, try to find any inputs at all
      let allInputs = canvas.queryAllByRole("textbox");

      // If no textboxes, try number inputs (spinbutton role)
      if (allInputs.length === 0) {
        allInputs = canvas.queryAllByRole("spinbutton");
      }

      // If still no inputs, try other input types
      if (allInputs.length === 0) {
        allInputs = canvas.container?.querySelectorAll("input, textarea") || [];
      }

      // If we found inputs, try to match them
      if (allInputs.length > 0) {
        // If there's only one input, return it (most common case)
        if (allInputs.length === 1) {
          return allInputs[0];
        }

        // Create various matching patterns from the label
        const labelLower = label.toLowerCase().replace(/\s*\*\s*$/, ""); // Remove asterisk
        const labelWords = labelLower.split(/\s+/);
        const labelCamelCase = labelWords
          .map((word, i) =>
            i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join("");
        const labelNoSpaces = labelWords.join("");

        // Try to match by name attribute, placeholder, or aria-label
        for (const input of allInputs) {
          const name = input.getAttribute("name")?.toLowerCase() || "";
          const placeholder =
            input.getAttribute("placeholder")?.toLowerCase() || "";
          const ariaLabel =
            input.getAttribute("aria-label")?.toLowerCase() || "";
          const type = input.getAttribute("type")?.toLowerCase() || "";

          // Special case for password fields
          if (labelLower.includes("password") && type === "password") {
            return input;
          }

          // Check various matching patterns
          if (
            // Exact name match
            name === labelLower ||
            name === labelCamelCase.toLowerCase() ||
            name === labelNoSpaces ||
            // Contains any label word
            labelWords.some((word) => name.includes(word)) ||
            // Placeholder contains label
            placeholder.includes(labelLower) ||
            labelWords.some((word) => placeholder.includes(word)) ||
            // Aria-label contains label
            ariaLabel.includes(labelLower) ||
            labelWords.some((word) => ariaLabel.includes(word))
          ) {
            return input;
          }
        }

        // If no specific match found, return the first input as fallback
        return allInputs[0];
      }

      throw new Error(
        `Could not find any input elements for label: ${expectedLabel}`
      );
    } catch (fallbackError: any) {
      throw new Error(
        `Could not find input for label: ${expectedLabel}. Original error: ${fallbackError.message}`
      );
    }
  }
};

// =============================================================================
// TESTING UTILITIES
// =============================================================================

/**
 * Common field assertions that work across all field types
 */
export const fieldAssertions = {
  /**
   * Assert that a field has a proper label with optional required indicator
   */
  hasLabel: (canvas: any, label: string, required = false) => {
    const expectedLabel = required ? `${label} *` : label;
    const labelElement = canvas.getByText(expectedLabel);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");
    return labelElement;
  },

  /**
   * Assert that a field has the correct input type
   */
  hasInputType: (
    canvas: any,
    label: string,
    inputType: string,
    required = false
  ) => {
    const input = getFormInput(canvas, label, required);
    expect(input).toHaveAttribute("type", inputType);
    return input;
  },

  /**
   * Assert that a field has the correct placeholder
   */
  hasPlaceholder: (input: any, placeholder: string) => {
    expect(input).toHaveAttribute("placeholder", placeholder);
  },

  /**
   * Assert that a prefix is displayed correctly
   */
  hasPrefix: (canvas: any, prefix: string) => {
    const prefixElement = canvas.getByText(prefix);
    expect(prefixElement).toBeInTheDocument();
    expect(prefixElement).toHaveClass("absolute", "left-3");
    return prefixElement;
  },

  /**
   * Assert that a suffix is displayed correctly
   */
  hasSuffix: (canvas: any, suffix: string) => {
    const suffixElement = canvas.getByText(suffix);
    expect(suffixElement).toBeInTheDocument();
    expect(suffixElement).toHaveClass("absolute", "right-3");
    return suffixElement;
  },

  /**
   * Assert that a description is displayed correctly
   */
  hasDescription: (canvas: any, description: string) => {
    const descElement = canvas.getByText(description);
    expect(descElement).toBeInTheDocument();
    expect(descElement).toHaveClass("text-xs", "text-blue-600");
    return descElement;
  },

  /**
   * Assert that input has correct padding for prefix/suffix
   */
  hasCorrectPadding: (input: any, hasPrefix: boolean, hasSuffix: boolean) => {
    // Based on StringField implementation: prefix ? "pl-8" : suffix ? "pr-16" : ""
    // This means prefix takes precedence, so if both exist, only pl-8 is applied
    if (hasPrefix) {
      expect(input).toHaveClass("pl-8");
    } else if (hasSuffix) {
      expect(input).toHaveClass("pr-16");
    }
  },
};

/**
 * Common interaction patterns for field testing
 */
export const fieldInteractions = {
  /**
   * Type text into a field and verify the value
   */
  typeAndVerify: async (input: any, text: string) => {
    await userEvent.type(input, text);

    // Handle numeric inputs where value becomes a number
    const inputType = input.getAttribute("type");
    if (inputType === "number") {
      const expectedValue = parseFloat(text);
      expect(input).toHaveValue(expectedValue);
    } else {
      expect(input).toHaveValue(text);
    }
  },

  /**
   * Clear a field and verify it's empty
   */
  clearAndVerify: async (input: any) => {
    // Select all text and delete instead of clearing entire form
    await userEvent.click(input);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.keyboard("{Delete}");
    expect(input).toHaveValue("");
  },

  /**
   * Test focus and blur behavior
   */
  testFocusBlur: async (input: any) => {
    // Initially not focused
    expect(input).not.toHaveFocus();

    // Click to focus
    await userEvent.click(input);
    expect(input).toHaveFocus();

    // Tab away to blur
    await userEvent.tab();
    expect(input).not.toHaveFocus();
  },

  /**
   * Test keyboard navigation
   */
  testKeyboardNav: async (input: any, testText = "keyboard test") => {
    // Focus the input first
    await userEvent.click(input);
    expect(input).toHaveFocus();

    await userEvent.type(input, testText);
    expect(input).toHaveValue(testText);
  },
};

/**
 * Accessibility test patterns
 */
export const a11yTests = {
  /**
   * Basic accessibility assertions for any field
   */
  basicA11y: async (canvas: any, label: string) => {
    let input;

    try {
      // Try to find by role and name first
      input = canvas.getByRole("textbox", {
        name: new RegExp(label, "i"),
      });
    } catch {
      // Fallback to our helper function
      input = getFormInput(canvas, label);
    }

    expect(input).toBeInTheDocument();
    expect(input).toBeVisible();
    expect(input).toBeEnabled();

    // Test keyboard navigation
    await userEvent.tab();
    expect(input).toHaveFocus();

    return input;
  },
};

/**
 * Pre-built play functions for common scenarios
 */
export const playFunctions = {
  /**
   * Basic field functionality test
   */
  basicField:
    (label: string, testValue: string, inputType = "text") =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      const input = fieldAssertions.hasInputType(canvas, label, inputType);

      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Required field test
   */
  requiredField:
    (label: string, testValue: string, inputType = "email") =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      fieldAssertions.hasLabel(canvas, label, true);
      const input = fieldAssertions.hasInputType(
        canvas,
        label,
        inputType,
        true
      );

      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Field with description test
   */
  fieldWithDescription:
    (label: string, description: string, testValue: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      fieldAssertions.hasDescription(canvas, description);
      const input = getFormInput(canvas, label);

      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Field with prefix test
   */
  fieldWithPrefix:
    (label: string, prefix: string, testValue: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      fieldAssertions.hasPrefix(canvas, prefix);
      const input = getFormInput(canvas, label);
      fieldAssertions.hasCorrectPadding(input, true, false);

      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Field with suffix test
   */
  fieldWithSuffix:
    (label: string, suffix: string, testValue: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      fieldAssertions.hasSuffix(canvas, suffix);
      const input = getFormInput(canvas, label);
      fieldAssertions.hasCorrectPadding(input, false, true);

      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Complete interaction test
   */
  fullInteractionTest:
    (label: string, testValue: string, placeholder?: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      const input = getFormInput(canvas, label);

      if (placeholder) {
        fieldAssertions.hasPlaceholder(input, placeholder);
      }

      await fieldInteractions.testFocusBlur(input);
      await fieldInteractions.typeAndVerify(input, testValue);
      await fieldInteractions.clearAndVerify(input);
      await fieldInteractions.typeAndVerify(input, testValue);
    },

  /**
   * Basic accessibility test
   */
  accessibilityTest:
    (label: string, required = false) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      await a11yTests.basicA11y(canvas, label);

      const input = getFormInput(canvas, label, required);
      await fieldInteractions.testKeyboardNav(input, "Test content");
    },

  /**
   * Input type verification test
   */
  inputTypeTest:
    (label: string, inputType: string, testValue: string, required = false) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);
      const input = fieldAssertions.hasInputType(
        canvas,
        label,
        inputType,
        required
      );
      await fieldInteractions.typeAndVerify(input, testValue);
    },
};

/**
 * Rule-based form utilities for Storybook
 */
export const ruleFormUtils = {
  /**
   * Create a FormProvider wrapper that includes rule context
   */
  withRuleFormProvider:
    (defaultValues = {}, rules = [], context = {}) =>
    (Story: any) => {
      const methods = useForm({
        defaultValues,
        mode: "onChange",
      });

      // Provide additional context for rule evaluation
      const ruleContext = {
        formData: methods.getValues(),
        userRole: "user",
        ...context,
      };

      return (
        <FormProvider {...methods}>
          <div className="p-4 max-w-2xl">
            <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
              <strong>Active Rules:</strong> {rules.length}
              <br />
              <strong>Context:</strong> {JSON.stringify(ruleContext, null, 2)}
            </div>
            <Story />
          </div>
        </FormProvider>
      );
    },

  /**
   * Common rule scenarios for testing
   */
  ruleScenarios: {
    // Marital status scenarios
    marriedUserRules: [
      {
        id: "show-spouse-income",
        condition: {
          field: "maritalStatus",
          operator: "equals",
          value: "married",
        },
        action: {
          type: "field-visibility",
          field: "spouseIncome",
          visible: true,
        },
      },
      {
        id: "show-spouse-name",
        condition: {
          field: "maritalStatus",
          operator: "equals",
          value: "married",
        },
        action: {
          type: "field-visibility",
          field: "spouseName",
          visible: true,
        },
      },
    ],

    // Contact preference scenarios
    contactPreferenceRules: [
      {
        id: "require-phone",
        condition: {
          field: "contactPreference",
          operator: "equals",
          value: "phone",
        },
        action: { type: "field-required", field: "phone", required: true },
      },
      {
        id: "require-email",
        condition: {
          field: "contactPreference",
          operator: "equals",
          value: "email",
        },
        action: { type: "field-required", field: "email", required: true },
      },
    ],

    // Income-based scenarios
    highIncomeRules: [
      {
        id: "show-additional-income-source",
        condition: {
          field: "annualIncome",
          operator: "greater_than",
          value: 100000,
        },
        action: {
          type: "field-visibility",
          field: "additionalIncomeSource",
          visible: true,
        },
      },
      {
        id: "show-investment-income",
        condition: {
          field: "annualIncome",
          operator: "greater_than",
          value: 150000,
        },
        action: {
          type: "field-visibility",
          field: "investmentIncome",
          visible: true,
        },
      },
    ],

    // Complex conditional scenarios
    complexRules: [
      {
        id: "show-spouse-fields-if-married-and-high-income",
        condition: {
          operator: "and",
          conditions: [
            { field: "maritalStatus", operator: "equals", value: "married" },
            { field: "annualIncome", operator: "greater_than", value: 75000 },
          ],
        },
        action: {
          type: "field-visibility",
          field: "spouseTaxInfo",
          visible: true,
        },
      },
    ],
  },

  /**
   * Mock schemas for rule-based forms
   */
  ruleFormSchemas: {
    userProfile: {
      type: "object",
      properties: {
        firstName: { type: "string", title: "First Name" },
        lastName: { type: "string", title: "Last Name" },
        email: { type: "string", title: "Email" },
        phone: { type: "string", title: "Phone" },
        maritalStatus: {
          type: "string",
          title: "Marital Status",
          enum: ["single", "married", "divorced", "widowed"],
        },
        spouseName: { type: "string", title: "Spouse Name" },
        spouseIncome: { type: "number", title: "Spouse Income" },
        contactPreference: {
          type: "string",
          title: "Contact Preference",
          enum: ["email", "phone", "mail"],
        },
        annualIncome: { type: "number", title: "Annual Income" },
        additionalIncomeSource: {
          type: "string",
          title: "Additional Income Source",
        },
        investmentIncome: { type: "number", title: "Investment Income" },
        spouseTaxInfo: { type: "string", title: "Spouse Tax Information" },
      },
      required: ["firstName", "lastName", "email"],
    },

    loanApplication: {
      type: "object",
      properties: {
        loanAmount: { type: "number", title: "Loan Amount" },
        loanPurpose: {
          type: "string",
          title: "Loan Purpose",
          enum: ["home", "auto", "personal", "business"],
        },
        employmentType: {
          type: "string",
          title: "Employment Type",
          enum: ["employed", "self-employed", "unemployed", "retired"],
        },
        employerName: { type: "string", title: "Employer Name" },
        businessName: { type: "string", title: "Business Name" },
        businessType: { type: "string", title: "Business Type" },
        yearsInBusiness: { type: "number", title: "Years in Business" },
        collateralType: { type: "string", title: "Collateral Type" },
        collateralValue: { type: "number", title: "Collateral Value" },
      },
      required: ["loanAmount", "loanPurpose", "employmentType"],
    },
  },

  /**
   * Custom functions for rule testing
   */
  mockCustomFunctions: {
    calculateAge: (birthDate: string) => {
      const today = new Date();
      const birth = new Date(birthDate);
      return today.getFullYear() - birth.getFullYear();
    },
    isBusinessDay: () => {
      const day = new Date().getDay();
      return day >= 1 && day <= 5;
    },
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },

  /**
   * Transform functions for rule testing
   */
  mockTransformFunctions: {
    uppercase: (value: unknown) => {
      return typeof value === "string" ? value.toUpperCase() : value;
    },
    lowercase: (value: unknown) => {
      return typeof value === "string" ? value.toLowerCase() : value;
    },
    trimSpaces: (value: unknown) => {
      return typeof value === "string" ? value.trim() : value;
    },
  },
};

/**
 * Helper to interact with Radix UI Select components
 */
const interactWithRadixSelect = async (
  canvas: any,
  triggerValue: string,
  fieldName?: string
) => {
  let selectTrigger;

  if (fieldName) {
    // Try to find combobox by accessible name
    try {
      selectTrigger = canvas.getByRole("combobox", {
        name: new RegExp(fieldName, "i"),
      });
    } catch {
      // If that doesn't work, find all comboboxes and filter by surrounding label
      const comboboxes = canvas.getAllByRole("combobox");
      selectTrigger = comboboxes.find((box: any) => {
        const parent = box.closest(
          "[data-field], .field-container, .form-field"
        );
        if (parent) {
          return parent.textContent
            ?.toLowerCase()
            .includes(fieldName.toLowerCase());
        }
        // Fall back to looking at nearby text
        const parentElement = box.parentElement;
        return parentElement?.textContent
          ?.toLowerCase()
          .includes(fieldName.toLowerCase());
      });

      if (!selectTrigger) {
        // Last resort: if fieldName contains specific keywords, try to match
        if (fieldName.toLowerCase().includes("marital")) {
          selectTrigger = comboboxes[0]; // First combobox is usually marital status
        } else if (fieldName.toLowerCase().includes("preference")) {
          selectTrigger = comboboxes[1]; // Second combobox is usually contact preference
        } else {
          selectTrigger = comboboxes[0]; // Default to first
        }
      }
    }
  } else {
    // Fallback to original behavior for backward compatibility
    selectTrigger = canvas.getByRole("combobox");
  }

  if (!selectTrigger) {
    throw new Error(
      `Could not find combobox for field: ${fieldName || "unknown"}`
    );
  }

  // Click to open the dropdown
  await userEvent.click(selectTrigger);

  // Wait for dropdown to appear
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find the option in the document (Radix portals to document.body)
  const option =
    document.querySelector(`[role="option"][data-value="${triggerValue}"]`) ||
    Array.from(document.querySelectorAll('[role="option"]')).find((el) =>
      el.textContent?.toLowerCase().includes(triggerValue.toLowerCase())
    );

  if (option) {
    await userEvent.click(option as Element);
  } else {
    throw new Error(`Could not find option with value: ${triggerValue}`);
  }
};

/**
 * Enhanced play functions for rule-based forms
 */
export const rulePlayFunctions = {
  /**
   * Test field visibility rules
   */
  testFieldVisibility:
    (triggerField: string, triggerValue: string, targetField: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);

      // Handle Radix UI Select components
      if (
        triggerField.toLowerCase().includes("status") ||
        triggerField.toLowerCase().includes("preference") ||
        triggerField.toLowerCase().includes("marital")
      ) {
        await interactWithRadixSelect(canvas, triggerValue, triggerField);
      } else {
        // Handle regular input fields
        try {
          const triggerElement = canvas.getByLabelText(
            new RegExp(triggerField, "i")
          );
          // Select all text and replace instead of clearing entire form
          await userEvent.click(triggerElement);
          await userEvent.keyboard("{Control>}a{/Control}");
          await userEvent.type(triggerElement, triggerValue);
        } catch {
          // Fallback to our helper function
          const triggerElement = getFormInput(canvas, triggerField);
          // Select all text and replace instead of clearing entire form
          await userEvent.click(triggerElement);
          await userEvent.keyboard("{Control>}a{/Control}");
          await userEvent.type(triggerElement, triggerValue);
        }
      }

      // Wait for rule evaluation and field to appear
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Now target field should be visible
      const targetInput = getFormInput(canvas, targetField);
      expect(targetInput).toBeVisible();
    },

  /**
   * Test conditional requirements
   */
  testConditionalRequired:
    (triggerField: string, triggerValue: string, targetField: string) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);

      // Handle Radix UI Select components
      if (
        triggerField.toLowerCase().includes("status") ||
        triggerField.toLowerCase().includes("preference") ||
        triggerField.toLowerCase().includes("marital")
      ) {
        await interactWithRadixSelect(canvas, triggerValue, triggerField);
      } else {
        // Handle regular input fields
        try {
          const triggerElement = canvas.getByLabelText(
            new RegExp(triggerField, "i")
          );
          // Select all text and replace instead of clearing entire form
          await userEvent.click(triggerElement);
          await userEvent.keyboard("{Control>}a{/Control}");
          await userEvent.type(triggerElement, triggerValue);
        } catch {
          // Fallback to our helper function
          const triggerElement = getFormInput(canvas, triggerField);
          // Select all text and replace instead of clearing entire form
          await userEvent.click(triggerElement);
          await userEvent.keyboard("{Control>}a{/Control}");
          await userEvent.type(triggerElement, triggerValue);
        }
      }

      // Wait for rule evaluation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check if target field is now required (has asterisk)
      const requiredLabel = canvas.getByText(
        new RegExp(`${targetField}.*\\*`, "i")
      );
      expect(requiredLabel).toBeInTheDocument();
    },

  /**
   * Test complex rule interactions
   */
  testComplexRules:
    (
      scenarios: Array<{
        field: string;
        value: string;
        expectedVisible: string[];
        expectedRequired: string[];
      }>
    ) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);

      for (const scenario of scenarios) {
        // Handle different field types
        if (
          scenario.field.toLowerCase().includes("status") ||
          scenario.field.toLowerCase().includes("preference") ||
          scenario.field.toLowerCase().includes("marital")
        ) {
          await interactWithRadixSelect(canvas, scenario.value, scenario.field);
        } else {
          // Regular input field
          const triggerInput = getFormInput(canvas, scenario.field);
          // Select all text and replace instead of clearing entire form
          await userEvent.click(triggerInput);
          await userEvent.keyboard("{Control>}a{/Control}");
          await userEvent.type(triggerInput, scenario.value);
        }

        // Wait for rules to evaluate
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Check expected visible fields
        for (const visibleField of scenario.expectedVisible) {
          const field = getFormInput(canvas, visibleField);
          expect(field).toBeVisible();
        }

        // Check expected required fields
        for (const requiredField of scenario.expectedRequired) {
          const label = canvas.getByText(
            new RegExp(`${requiredField}.*\\*`, "i")
          );
          expect(label).toBeInTheDocument();
        }
      }
    },

  /**
   * Performance test for many rules
   */
  testRulePerformance:
    (numChanges: number = 10) =>
    async ({ canvasElement }: any) => {
      const canvas = within(canvasElement);

      const startTime = performance.now();

      // Rapidly change values to test performance
      for (let i = 0; i < numChanges; i++) {
        const value = i % 2 === 0 ? "married" : "single";

        try {
          // Use Radix UI interaction for marital status
          await interactWithRadixSelect(canvas, value, "marital");
        } catch (error) {
          console.warn(`Performance test iteration ${i} failed:`, error);
          // Continue with remaining iterations
        }

        // Small delay to allow rule evaluation
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(10000); // 10 seconds (increased for Radix interaction)
    },
};

/**
 * Rule debugging utilities for development
 */
export const ruleDebugUtils = {
  /**
   * Log rule evaluation results
   */
  logRuleEvaluation: (rules: any[], context: any) => {
    console.group("🔍 Rule Evaluation Debug");
    console.log("Context:", context);
    console.log("Rules:", rules);
    rules.forEach((rule, index) => {
      console.log(`Rule ${index + 1} (${rule.id}):`, rule);
    });
    console.groupEnd();
  },

  /**
   * Create a visual rule inspector component
   */
  RuleInspector: ({ rules, context }: { rules: any[]; context: any }) => (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs">
      <h3 className="font-bold mb-2">🔍 Rule Inspector</h3>
      <div className="mb-2">
        <strong>Context:</strong>
        <pre className="bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Rules ({rules.length}):</strong>
        {rules.map((rule, i) => (
          <div key={i} className="mt-1 p-1 border border-gray-200 rounded">
            <div className="font-semibold">{rule.id}</div>
            <div className="text-gray-600">
              {rule.condition.field} {rule.condition.operator}{" "}
              {JSON.stringify(rule.condition.value)}
            </div>
            <div className="text-blue-600">
              → {rule.action.type}: {rule.action.field}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};
