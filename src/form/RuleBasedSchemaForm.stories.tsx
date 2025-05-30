import type { Meta, StoryObj } from "@storybook/react-vite";
import { z } from "zod/v4";
import { expect, userEvent, within } from "@storybook/test";
import { RuleBasedSchemaForm } from "./RuleBasedSchemaForm";
import { RuleBuilder, CommonRules } from "../utils/rule-builder";
import {
  ruleFormUtils,
  rulePlayFunctions,
  ruleDebugUtils,
  getFormInput,
} from "../lib/storybook-utils";

// Create a Zod schema for our stories
const UserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  maritalStatus: z
    .enum(["single", "married", "divorced", "widowed"])
    .default("single"),
  spouseName: z.string().optional(),
  spouseIncome: z.number().optional(),
  contactPreference: z.enum(["email", "phone", "mail"]).default("email"),
  annualIncome: z.number().min(0, "Income must be positive"),
  additionalIncomeSource: z.string().optional(),
  investmentIncome: z.number().optional(),
  spouseTaxInfo: z.string().optional(),
});

// Common field labels for all stories
const fieldLabels = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  maritalStatus: "Marital Status",
  spouseName: "Spouse Name",
  spouseIncome: "Spouse Income",
  contactPreference: "Contact Preference",
  annualIncome: "Annual Income",
  additionalIncomeSource: "Additional Income Source",
  investmentIncome: "Investment Income",
  spouseTaxInfo: "Spouse Tax Info",
};

const meta: Meta<typeof RuleBasedSchemaForm> = {
  title: "Forms/RuleBasedSchemaForm",
  component: RuleBasedSchemaForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A form component that dynamically shows/hides fields and modifies validation based on business rules.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    schema: {
      control: false,
      description: "Zod schema defining the form structure",
    },
    rules: {
      control: { type: "object" },
      description: "Array of rule definitions that control form behavior",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RuleBasedSchemaForm>;

// Base story with no rules
export const BasicForm: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [],
    fieldLabels,
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
      alert(`Form submitted! Check console for details.`);
    },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "",
      lastName: "",
      email: "",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    }),
  ],
};

// Story showing spouse fields when married
export const SpouseFieldsWhenMarried: Story = {
  args: {
    schema: UserProfileSchema,
    rules: CommonRules.spouseFieldsWhenMarried(["spouseName", "spouseIncome"]),
    fieldLabels,
    onSubmit: async (values) => console.log("Submitted:", values),
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 75000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider(
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        maritalStatus: "single",
        contactPreference: "email",
        annualIncome: 75000,
      },
      []
    ),
  ],
  play: rulePlayFunctions.testFieldVisibility(
    "Marital Status",
    "married",
    "Spouse Name"
  ),
};

// Story with contact preference rules
export const ContactPreferenceRules: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [
      RuleBuilder.when("contactPreference")
        .equals("phone")
        .show("phone")
        .build()[0],
      RuleBuilder.when("contactPreference")
        .equals("mail")
        .require("lastName")
        .build()[0],
    ],
    fieldLabels,
    onSubmit: async (values) => console.log("Submitted:", values),
    defaultValues: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 60000,
    },
    excludeFields: ["phone"],
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 60000,
    }),
  ],
  play: rulePlayFunctions.testFieldVisibility(
    "Contact Preference",
    "phone",
    "Phone"
  ),
};

// Story with income-based rules
export const IncomeBasedRules: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [
      ...CommonRules.additionalIncomeForHighEarners(100000),
      RuleBuilder.when("annualIncome")
        .greaterThan(150000)
        .show("investmentIncome")
        .build()[0],
    ],
    fieldLabels,
    onSubmit: async (values) => console.log("Submitted:", values),
    defaultValues: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    }),
  ],
  play: async ({ canvasElement }) => {
    // Test by changing income to high amount
    const canvas = within(canvasElement);
    const incomeInput = getFormInput(canvas, "Annual Income");

    // Select all text and replace it instead of clearing (which can affect other fields)
    await userEvent.click(incomeInput);
    await userEvent.keyboard("{Control>}a{/Control}");
    await userEvent.type(incomeInput, "120000");

    // Wait for rule evaluation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Additional income source should now be visible
    const additionalIncomeInput = getFormInput(
      canvas,
      "Additional Income Source"
    );
    expect(additionalIncomeInput).toBeVisible();
  },
};

// Complex rules story
export const ComplexRulesDemo: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [
      // Show spouse fields when married
      ...CommonRules.spouseFieldsWhenMarried(["spouseName", "spouseIncome"]),

      // Require phone for phone contact
      CommonRules.requirePhoneForPhoneContact(),

      // Show additional income fields for high earners
      ...CommonRules.additionalIncomeForHighEarners(75000),

      // Complex rule: Show spouse tax info if married AND high income
      RuleBuilder.when("maritalStatus")
        .equals("married")
        .show("spouseTaxInfo")
        .when("annualIncome")
        .greaterThan(100000)
        .require("spouseTaxInfo")
        .build()[1], // Get the second rule from the builder
    ],
    fieldLabels,
    onSubmit: async (values) => console.log("Complex form submitted:", values),
    defaultValues: {
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    }),
  ],
  play: rulePlayFunctions.testComplexRules([
    {
      field: "Marital Status",
      value: "married",
      expectedVisible: ["Spouse Name", "Spouse Income"],
      expectedRequired: [],
    },
    {
      field: "Annual Income",
      value: "120000",
      expectedVisible: ["Additional Income Source"],
      expectedRequired: [],
    },
  ]),
};

// Performance testing story
export const PerformanceTest: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [
      // Create many rules to test performance
      ...CommonRules.spouseFieldsWhenMarried(["spouseName", "spouseIncome"]),
      CommonRules.requirePhoneForPhoneContact(),
      ...CommonRules.additionalIncomeForHighEarners(50000),
      ...CommonRules.additionalIncomeForHighEarners(75000),
      ...CommonRules.additionalIncomeForHighEarners(100000),
      RuleBuilder.when("firstName").isNotEmpty().require("lastName").build()[0],
      RuleBuilder.when("email").contains("@").show("phone").build()[0],
    ],
    fieldLabels,
    onSubmit: async (values) =>
      console.log("Performance test submitted:", values),
    defaultValues: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 60000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 60000,
    }),
  ],
  play: rulePlayFunctions.testRulePerformance(15),
};

// Story with custom functions
export const WithCustomFunctions: Story = {
  args: {
    schema: UserProfileSchema,
    rules: [
      {
        id: "weekend-special",
        condition: {
          field: "isWeekend",
          operator: "equals",
          value: {
            type: "function",
            name: "isWeekend",
            args: [],
          },
        },
        actions: [
          {
            type: "show",
            target: "spouseName",
          },
        ],
        enabled: true,
      },
    ],
    fieldLabels,
    customFunctions: {
      isWeekend: () => {
        const day = new Date().getDay();
        return day === 0 || day === 6;
      },
      calculateDiscount: (...args: unknown[]) => {
        const income = args[0] as number;
        return income > 100000 ? 0.1 : 0.05;
      },
    },
    onSubmit: async (values) => console.log("Custom functions form:", values),
    defaultValues: {
      firstName: "Custom",
      lastName: "Function",
      email: "custom@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 80000,
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Custom",
      lastName: "Function",
      email: "custom@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 80000,
    }),
  ],
};

// Story with debug logging
export const WithDebugLogging: Story = {
  args: {
    ...ComplexRulesDemo.args,
    onRuleEvaluation: (ruleResults) => {
      ruleDebugUtils.logRuleEvaluation(ComplexRulesDemo.args?.rules || [], {
        formData: ruleResults.form.getValues(),
      });
    },
  },
  decorators: [
    ruleFormUtils.withRuleFormProvider({
      firstName: "Debug",
      lastName: "Mode",
      email: "debug@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 50000,
    }),
  ],
};

// Accessibility testing story
export const AccessibilityTest: Story = {
  args: {
    schema: UserProfileSchema,
    rules: CommonRules.spouseFieldsWhenMarried(["spouseName", "spouseIncome"]),
    fieldLabels,
    onSubmit: async (values) => console.log("A11y test:", values),
    defaultValues: {
      firstName: "Accessible",
      lastName: "User",
      email: "a11y@example.com",
      maritalStatus: "single",
      contactPreference: "email",
      annualIncome: 60000,
    },
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: "color-contrast",
            enabled: true,
          },
          {
            id: "keyboard-navigation",
            enabled: true,
          },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test keyboard navigation
    await userEvent.tab();
    const firstInput = canvas.getByDisplayValue("Accessible");
    expect(firstInput).toHaveFocus();

    // Test field visibility change with Radix UI select
    const maritalStatusSelect = canvas.getByRole("combobox", {
      name: /marital status/i,
    });

    // Click to open the dropdown
    await userEvent.click(maritalStatusSelect);

    // Wait for dropdown to open
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Look for the "married" option in the document (Radix portals outside canvas)
    const marriedOption = within(document.body).getByRole("option", {
      name: "married",
    });
    await userEvent.click(marriedOption);

    // Wait for transition and check aria-hidden
    await new Promise((resolve) => setTimeout(resolve, 400));

    const spouseNameContainer = canvas
      .getByLabelText(/spouse name/i)
      .closest("div");
    expect(spouseNameContainer).not.toHaveAttribute("aria-hidden", "true");
  },
};
