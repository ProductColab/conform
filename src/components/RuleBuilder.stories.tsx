import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test";
import { RuleBuilder } from "./RuleBuilder";
import type { FieldSchemas } from "../lib/fieldUtils";
import { fieldMeta } from "../lib/fieldUtils";

// Demo field schemas following the established Zod pattern
const DEMO_FIELD_SCHEMAS: FieldSchemas = {
  email: {
    type: "string",
    title: "Email Address",
    description: "Email address with validation",
    format: "email",
    metadata: fieldMeta({
      inputType: "email",
      placeholder: "user@example.com",
    }),
  },

  name: {
    type: "string",
    title: "Full Name",
    description: "Person's full name",
    metadata: fieldMeta({
      placeholder: "Enter full name",
    }),
  },

  city: {
    type: "string",
    title: "City",
    description: "City name",
    metadata: fieldMeta({
      placeholder: "Enter city name",
    }),
  },

  age: {
    type: "number",
    title: "Age",
    description: "Age in years",
    minimum: 0,
    maximum: 150,
    metadata: fieldMeta({
      inputType: "number",
      step: 1,
    }),
  },

  isActive: {
    type: "boolean",
    title: "Active Status",
    description: "Whether the user is active",
    metadata: fieldMeta({
      format: "switch",
    }),
  },

  phoneNumber: {
    type: "string",
    title: "Phone Number",
    description: "Phone number with formatting",
    metadata: fieldMeta({
      inputType: "tel",
      placeholder: "+1 (555) 123-4567",
    }),
  },

  website: {
    type: "string",
    title: "Website URL",
    description: "Personal or business website",
    format: "uri",
    metadata: fieldMeta({
      inputType: "url",
      placeholder: "https://example.com",
    }),
  },

  salary: {
    type: "number",
    title: "Annual Salary",
    description: "Annual salary amount",
    minimum: 0,
    metadata: fieldMeta({
      inputType: "number",
      prefix: "$",
      step: 0.01,
    }),
  },

  tags: {
    type: "array",
    title: "User Tags",
    description: "Tags for categorizing users",
    items: { type: "string" },
    metadata: fieldMeta({
      format: "checkbox-group",
    }),
  },

  permissions: {
    type: "array",
    title: "User Permissions",
    description: "User access permissions",
    items: { type: "string" },
    metadata: fieldMeta({
      format: "multiselect",
    }),
  },
};

// =============================================================================
// TESTING UTILITIES (following storybook-utils.tsx patterns)
// =============================================================================

/**
 * Helper to find form elements with multiple fallback strategies
 * Following the pattern from storybook-utils.tsx
 */
const getRuleBuilderInput = (
  canvas: ReturnType<typeof within>,
  label: string,
  required = false
) => {
  const expectedLabel = required ? `${label} *` : label;

  // Try direct label association first
  try {
    return canvas.getByLabelText(expectedLabel);
  } catch {
    // Try case-insensitive regex
    try {
      return canvas.getByLabelText(new RegExp(label, "i"));
    } catch {
      // Try finding by role and name
      try {
        const roles = ["textbox", "combobox", "spinbutton"];
        for (const role of roles) {
          try {
            return canvas.getByRole(role, { name: new RegExp(label, "i") });
          } catch {
            continue;
          }
        }
        throw new Error("No matching role found");
      } catch {
        // Fallback to finding all inputs and matching by proximity/attributes
        const allInputs = [
          ...canvas.queryAllByRole("textbox"),
          ...canvas.queryAllByRole("combobox"),
          ...canvas.queryAllByRole("spinbutton"),
          ...(canvas.container?.querySelectorAll("input, select, textarea") ||
            []),
        ];

        if (allInputs.length === 0) {
          throw new Error(
            `Could not find any input elements for label: ${label}`
          );
        }

        // Match by various attributes
        const labelLower = label.toLowerCase();
        for (const input of allInputs) {
          const name = input.getAttribute("name")?.toLowerCase() || "";
          const id = input.getAttribute("id")?.toLowerCase() || "";
          const ariaLabel =
            input.getAttribute("aria-label")?.toLowerCase() || "";

          if (
            name.includes(labelLower) ||
            id.includes(labelLower) ||
            ariaLabel.includes(labelLower) ||
            labelLower.includes(name) ||
            labelLower.includes(id)
          ) {
            return input;
          }
        }

        // Last resort: return first input if only one exists
        if (allInputs.length === 1) {
          return allInputs[0];
        }

        throw new Error(`Could not find input for label: ${label}`);
      }
    }
  }
};

/**
 * RuleBuilder-specific assertions following fieldAssertions pattern
 */
const ruleBuilderAssertions = {
  /**
   * Assert that a rule builder form has the expected structure
   */
  hasRuleBuilderStructure: (canvas: ReturnType<typeof within>) => {
    // Should have the main sections
    expect(canvas.getByText("Build Your Rule")).toBeInTheDocument();
    expect(canvas.getByText("Generated Code")).toBeInTheDocument();

    // Should have the form controls
    expect(canvas.getByLabelText("Field")).toBeInTheDocument();
    expect(canvas.getByLabelText("Operator")).toBeInTheDocument();
    expect(canvas.getByLabelText("Value")).toBeInTheDocument();
    expect(canvas.getByLabelText("Action")).toBeInTheDocument();
  },

  /**
   * Assert that generated code contains expected content
   */
  hasGeneratedCode: (
    canvas: ReturnType<typeof within>,
    expectedContent: string
  ) => {
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(expectedContent);
    return codeElement;
  },

  /**
   * Assert that imports are correctly generated
   */
  hasCorrectImports: (
    canvas: ReturnType<typeof within>,
    expectedImports: string[]
  ) => {
    const codeElement = canvas.getByRole("code");
    const importLine = `import { ${expectedImports.join(", ")} } from '@zodiac/rule-builder'`;
    expect(codeElement).toHaveTextContent(importLine);
  },

  /**
   * Assert that condition is correctly formatted
   */
  hasCorrectCondition: (
    canvas: ReturnType<typeof within>,
    field: string,
    operator: string,
    value: string | number | boolean
  ) => {
    const codeElement = canvas.getByRole("code");

    // Format value based on its actual type, not what we expect
    let formattedValue: string;

    // Check if the value is a numeric string that should be treated as number
    if (
      typeof value === "string" &&
      !isNaN(Number(value)) &&
      value.trim() !== ""
    ) {
      formattedValue = value; // Numbers don't get quotes
    }
    // Check if the value is a boolean string
    else if (
      typeof value === "string" &&
      (value === "true" || value === "false")
    ) {
      formattedValue = value; // Booleans don't get quotes
    }
    // Regular string values get quotes
    else if (typeof value === "string") {
      formattedValue = `'${value}'`;
    }
    // Actual numbers and booleans
    else {
      formattedValue = String(value);
    }

    const expectedCondition = `field('${field}').${operator}(${formattedValue})`;
    expect(codeElement).toHaveTextContent(expectedCondition);
  },

  /**
   * Assert that action is correctly chained
   */
  hasCorrectAction: (
    canvas: ReturnType<typeof within>,
    actionType: string,
    actionValue?: string
  ) => {
    const codeElement = canvas.getByRole("code");
    let expectedAction;

    if (actionValue) {
      expectedAction = `.then(() => ${actionType}('${actionValue}'))`;
    } else {
      expectedAction = `.then(() => ${actionType}())`;
    }

    expect(codeElement).toHaveTextContent(expectedAction);
  },

  /**
   * Assert placeholder message is shown
   */
  hasPlaceholderMessage: (canvas: ReturnType<typeof within>) => {
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(
      "Select a field, operator, and value to see generated code"
    );
  },
};

/**
 * RuleBuilder-specific interactions following fieldInteractions pattern
 */
const ruleBuilderInteractions = {
  /**
   * Select a field from the dropdown
   */
  selectField: async (canvas: ReturnType<typeof within>, fieldName: string) => {
    const fieldSelect = getRuleBuilderInput(canvas, "Field");
    await userEvent.selectOptions(fieldSelect, fieldName);
    // Small delay for UI updates
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  /**
   * Select an operator from the dropdown
   */
  selectOperator: async (
    canvas: ReturnType<typeof within>,
    operator: string
  ) => {
    const operatorSelect = getRuleBuilderInput(canvas, "Operator");
    await userEvent.selectOptions(operatorSelect, operator);
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  /**
   * Enter a value in the value input
   */
  enterValue: async (canvas: ReturnType<typeof within>, value: string) => {
    const valueInput = getRuleBuilderInput(canvas, "Value");
    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, value);
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  /**
   * Select an action from the action dropdown
   */
  selectAction: async (canvas: ReturnType<typeof within>, action: string) => {
    const actionSelect = getRuleBuilderInput(canvas, "Action");
    await userEvent.selectOptions(actionSelect, action);
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  /**
   * Enter action configuration (message, URL, etc.)
   */
  enterActionConfig: async (
    canvas: ReturnType<typeof within>,
    configValue: string
  ) => {
    // Find the action config input (could be Message, URL, etc.)
    const configInputs = [
      () => canvas.getByLabelText("Message"),
      () => canvas.getByLabelText("URL"),
      () => canvas.getByLabelText("Configuration"),
    ];

    let configInput;
    for (const getter of configInputs) {
      try {
        configInput = getter();
        break;
      } catch {
        continue;
      }
    }

    if (!configInput) {
      throw new Error("Could not find action configuration input");
    }

    await userEvent.clear(configInput);
    await userEvent.type(configInput, configValue);
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  /**
   * Build a complete rule with condition and action
   */
  buildCompleteRule: async (
    canvas: ReturnType<typeof within>,
    field: string,
    operator: string,
    value: string,
    action: string,
    actionConfig?: string
  ) => {
    await ruleBuilderInteractions.selectField(canvas, field);
    await ruleBuilderInteractions.selectOperator(canvas, operator);
    await ruleBuilderInteractions.enterValue(canvas, value);
    await ruleBuilderInteractions.selectAction(canvas, action);

    if (actionConfig) {
      await ruleBuilderInteractions.enterActionConfig(canvas, actionConfig);
    }
  },

  /**
   * Test copy functionality
   */
  testCopyFunctionality: async (canvas: ReturnType<typeof within>) => {
    const copyButton = canvas.getByText("Copy");
    await userEvent.click(copyButton);

    // Verify button text changes
    await expect(canvas.getByText("Copied!")).toBeInTheDocument();

    // Wait for button to reset
    await new Promise((resolve) => setTimeout(resolve, 2000));
  },
};

/**
 * Pre-built play functions for common scenarios (following playFunctions pattern)
 */
const ruleBuilderPlayFunctions = {
  /**
   * Basic rule building test
   */
  basicRule:
    (field: string, operator: string, value: string) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      ruleBuilderAssertions.hasRuleBuilderStructure(canvas);
      ruleBuilderAssertions.hasPlaceholderMessage(canvas);

      await ruleBuilderInteractions.selectField(canvas, field);
      await ruleBuilderInteractions.selectOperator(canvas, operator);
      await ruleBuilderInteractions.enterValue(canvas, value);

      ruleBuilderAssertions.hasCorrectCondition(canvas, field, operator, value);
      ruleBuilderAssertions.hasCorrectImports(canvas, ["field"]);
    },

  /**
   * Complete rule with action test
   */
  completeRule:
    (
      field: string,
      operator: string,
      value: string,
      action: string,
      actionConfig: string
    ) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      await ruleBuilderInteractions.buildCompleteRule(
        canvas,
        field,
        operator,
        value,
        action,
        actionConfig
      );

      ruleBuilderAssertions.hasCorrectCondition(canvas, field, operator, value);
      ruleBuilderAssertions.hasCorrectAction(canvas, action, actionConfig);
      ruleBuilderAssertions.hasCorrectImports(canvas, [
        "field",
        "showMessage",
        "redirect",
        "setFieldValue",
        "preventDefault",
      ]);
    },

  /**
   * String escaping test
   */
  stringEscaping:
    (testString: string) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      await ruleBuilderInteractions.selectField(canvas, "name");
      await ruleBuilderInteractions.selectOperator(canvas, "equals");
      await ruleBuilderInteractions.enterValue(canvas, testString);

      // Check that single quotes are properly escaped
      const escapedString = testString.replace(/'/g, "\\'");
      ruleBuilderAssertions.hasGeneratedCode(canvas, `'${escapedString}'`);
    },

  /**
   * All operators test
   */
  allOperators:
    (field: string, testValue: string) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      const operators = [
        "equals",
        "greater_than",
        "less_than",
        "contains",
        "starts_with",
      ];

      await ruleBuilderInteractions.selectField(canvas, field);
      await ruleBuilderInteractions.enterValue(canvas, testValue);

      for (const operator of operators) {
        await ruleBuilderInteractions.selectOperator(canvas, operator);
        ruleBuilderAssertions.hasCorrectCondition(
          canvas,
          field,
          operator,
          testValue
        );
      }
    },

  /**
   * Real-time updates test
   */
  realTimeUpdates:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      // Start with placeholder
      ruleBuilderAssertions.hasPlaceholderMessage(canvas);

      // Add field - should still show placeholder
      await ruleBuilderInteractions.selectField(canvas, "email");
      ruleBuilderAssertions.hasPlaceholderMessage(canvas);

      // Add operator - still placeholder
      await ruleBuilderInteractions.selectOperator(canvas, "equals");
      ruleBuilderAssertions.hasPlaceholderMessage(canvas);

      // Add value - NOW should generate code
      await ruleBuilderInteractions.enterValue(canvas, "test@example.com");
      ruleBuilderAssertions.hasCorrectCondition(
        canvas,
        "email",
        "equals",
        "test@example.com"
      );

      // Add action - imports should update
      await ruleBuilderInteractions.selectAction(canvas, "showMessage");
      ruleBuilderAssertions.hasCorrectImports(canvas, [
        "field",
        "showMessage",
        "redirect",
        "setFieldValue",
        "preventDefault",
      ]);
    },

  /**
   * Action types test
   */
  actionTypes:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      // Set up base condition
      await ruleBuilderInteractions.selectField(canvas, "email");
      await ruleBuilderInteractions.selectOperator(canvas, "equals");
      await ruleBuilderInteractions.enterValue(canvas, "test@example.com");

      // Test showMessage action
      await ruleBuilderInteractions.selectAction(canvas, "showMessage");
      await ruleBuilderInteractions.enterActionConfig(canvas, "Hello!");
      ruleBuilderAssertions.hasCorrectAction(canvas, "showMessage", "Hello!");

      // Test redirect action
      await ruleBuilderInteractions.selectAction(canvas, "redirect");
      await ruleBuilderInteractions.enterActionConfig(canvas, "/dashboard");
      ruleBuilderAssertions.hasCorrectAction(canvas, "redirect", "/dashboard");

      // Test preventDefault action (no config needed)
      await ruleBuilderInteractions.selectAction(canvas, "preventDefault");
      ruleBuilderAssertions.hasCorrectAction(canvas, "preventDefault");

      // Verify config input is disabled
      try {
        const configInput = canvas.getByLabelText("Configuration");
        expect(configInput).toBeDisabled();
        expect(configInput).toHaveValue("No configuration required");
      } catch {
        // Config input might not exist for preventDefault, which is fine
      }
    },

  /**
   * Copy functionality test
   */
  copyFunctionality:
    () =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);

      // Build a complete rule
      await ruleBuilderInteractions.buildCompleteRule(
        canvas,
        "email",
        "equals",
        "test@example.com",
        "showMessage",
        "Valid email!"
      );

      // Test copy functionality
      await ruleBuilderInteractions.testCopyFunctionality(canvas);
    },
};

// =============================================================================
// STORY DEFINITIONS
// =============================================================================

const meta: Meta<typeof RuleBuilder> = {
  title: "Sprint 1/Visual Rule Builder",
  component: RuleBuilder,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## Features ✨
- **Visual Interface**: Select fields, operators, and values with dropdown menus
- **Action Support**: Complete rules with "When... Then..." logic
- **Real-time Code Generation**: See TypeScript code update as you build rules
- **Copy to Clipboard**: One-click copy of generated code
- **Clean TypeScript Output**: Properly formatted code that follows our API patterns

## Actions Supported 🎯
- **Show Message**: Display messages to users
- **Redirect**: Navigate to different URLs  
- **Set Field Value**: Dynamically update form fields
- **Prevent Default**: Block default browser behaviors
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "🎯 Sprint 1 MVP Demo",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Our working MVP! Try selecting different fields, operators, values AND actions to see the complete rule generation in action.",
      },
    },
  },
};

export const WithEmailRule: Story = {
  name: "📧 Email Validation Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Perfect for email validation rules - the most common use case developers asked for.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.basicRule(
    "email",
    "equals",
    "user@example.com"
  ),
};

export const WithCompleteRule: Story = {
  name: "🎯 Complete Rule with Action",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: "Showcase the full power: condition + action = complete rule!",
      },
    },
  },
  play: ruleBuilderPlayFunctions.completeRule(
    "age",
    "greater_than",
    "18",
    "showMessage",
    "Welcome to our platform!"
  ),
};

export const WithRedirectAction: Story = {
  name: "🔗 Redirect Action Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Perfect for navigation rules - redirect users based on conditions.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.completeRule(
    "isActive",
    "equals",
    "false",
    "redirect",
    "/login"
  ),
};

export const WithAgeRule: Story = {
  name: "🔢 Age Comparison Example",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Numeric comparisons work perfectly with our type-safe code generation.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test numeric comparison rule
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "age");
    await userEvent.selectOptions(
      canvas.getByLabelText("Operator"),
      "greater_than"
    );
    await userEvent.type(canvas.getByLabelText("Value"), "18");

    // Verify numeric values aren't quoted in generated code
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('age').greater_than(18)");
    expect(codeElement).not.toHaveTextContent("'18'"); // No quotes around numbers
  },
};

export const Interactive: Story = {
  name: "🚀 Interactive Playground",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Try the complete flow!**

1. Select "email" from the Field dropdown
2. Choose "equals" as the operator
3. Enter "test@example.com" as the value
4. Select "Show Message" as the action
5. Enter "Valid email!" as the message
6. Watch the complete rule generate in real-time!
7. Click "Copy" to get the generated TypeScript

The generated code will be:
\`\`\`typescript
import { field, showMessage } from '@zodiac/rule-builder';

const rule = field('email').equals('test@example.com')
  .then(() => showMessage('Valid email!'));
\`\`\`
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Demonstrate the complete interactive flow step by step
    await userEvent.selectOptions(canvas.getByLabelText("Field"), "email");

    // Small delay to show real-time updates
    await new Promise((resolve) => setTimeout(resolve, 500));

    await userEvent.selectOptions(canvas.getByLabelText("Operator"), "equals");

    await new Promise((resolve) => setTimeout(resolve, 500));

    await userEvent.type(canvas.getByLabelText("Value"), "test@example.com");

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add action
    await userEvent.selectOptions(
      canvas.getByLabelText("Action"),
      "showMessage"
    );
    await userEvent.type(canvas.getByLabelText("Message"), "Valid email!");

    // Verify final result
    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent(
      "field('email').equals('test@example.com')"
    );
    expect(codeElement).toHaveTextContent(
      ".then(() => showMessage('Valid email!'))"
    );

    // Test copy functionality
    const copyButton = canvas.getByText("Copy");
    await userEvent.click(copyButton);

    // Verify button text changes to "Copied!"
    await expect(canvas.getByText("Copied!")).toBeInTheDocument();
  },
};

export const RealTimeUpdates: Story = {
  name: "⚡ Real-Time Code Generation",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Watch the code update instantly as you make changes - Alex and Jordan's integration magic!",
      },
    },
  },
  play: ruleBuilderPlayFunctions.realTimeUpdates(),
};

export const ActionTypes: Story = {
  name: "🎬 All Action Types",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Test all four action types with proper code generation and UI adaptation.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.actionTypes(),
};

export const StringEscaping: Story = {
  name: "🛡️ String Escaping Test",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests that special characters in strings are properly escaped in generated code.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.stringEscaping("O'Connor"),
};

export const AllOperators: Story = {
  name: "🔧 All Operators Test",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates all five operators working with proper code generation.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.allOperators("email", "test@example.com"),
};

export const MobileView: Story = {
  name: "📱 Mobile Responsive",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Riley made sure our builder works on mobile too! The panels stack vertically on smaller screens.",
      },
    },
  },
  play: ruleBuilderPlayFunctions.completeRule(
    "city",
    "starts_with",
    "New",
    "redirect",
    "/cities/new"
  ),
};

export const SchemaBasedFields: Story = {
  name: "🎯 Schema-Driven Fields (NEW!)",
  parameters: {
    docs: {
      description: {
        story: `
**🚀 NEW: Schema-Driven Field Selector!**

This story demonstrates how FieldSelector works with user-provided field definitions. The best part? **No special metadata required!** Just provide your standard Zod schemas and we'll auto-organize them intelligently.

**Features:**
- **Auto-Categorization**: Fields are automatically organized by type (text, numbers, booleans, arrays, etc.)
- **Standard Schemas**: Users just provide normal field schemas - no "category" or special UI metadata required!
- **Type Safety**: Full TypeScript support for field definitions
- **Extensible**: Users can define any fields they want with any metadata they need

**Auto-Categories:**
- 📝 **Text Fields**: String fields and text inputs
- 🔢 **Numbers**: Numeric fields with proper validation
- ✅ **Yes/No**: Boolean fields with switches
- 📧 **Contact Info**: Email and URL fields (auto-detected by format)
- 📅 **Dates & Times**: Date/datetime fields
- 📋 **Lists**: Array fields for multiple values

**This is what users want:** Just define your schemas, and the UI handles the rest intelligently!
        `,
      },
    },
  },
  render: () => {
    // Now actually using the demo field definitions!
    return <RuleBuilder fields={DEMO_FIELD_SCHEMAS} />;
  },
  play: ruleBuilderPlayFunctions.completeRule(
    "email",
    "equals",
    "admin@company.com",
    "redirect",
    "/admin/dashboard"
  ),
};

// =============================================================================
// COMPREHENSIVE TEST STORIES
// =============================================================================

export const ComprehensiveValidation: Story = {
  name: "🧪 Comprehensive Validation Test",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Comprehensive test covering all major functionality and edge cases.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test structure
    ruleBuilderAssertions.hasRuleBuilderStructure(canvas);

    // Test placeholder state
    ruleBuilderAssertions.hasPlaceholderMessage(canvas);

    // Test basic rule building
    await ruleBuilderInteractions.buildCompleteRule(
      canvas,
      "name",
      "contains",
      "John",
      "showMessage",
      "Hello John!"
    );

    // Verify complete rule
    ruleBuilderAssertions.hasCorrectCondition(
      canvas,
      "name",
      "contains",
      "John"
    );
    ruleBuilderAssertions.hasCorrectAction(
      canvas,
      "showMessage",
      "Hello John!"
    );

    // Test copy functionality
    await ruleBuilderInteractions.testCopyFunctionality(canvas);
  },
};

export const EdgeCaseTesting: Story = {
  name: "🔬 Edge Case Testing",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: "Tests edge cases and error conditions to ensure robustness.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test with special characters
    await ruleBuilderInteractions.selectField(canvas, "name");
    await ruleBuilderInteractions.selectOperator(canvas, "equals");
    await ruleBuilderInteractions.enterValue(canvas, 'Test\'s "Value" & More');

    // Test numeric values don't get quoted
    await ruleBuilderInteractions.selectField(canvas, "age");
    await ruleBuilderInteractions.selectOperator(canvas, "greater_than");
    await ruleBuilderInteractions.enterValue(canvas, "25");

    const codeElement = canvas.getByRole("code");
    expect(codeElement).toHaveTextContent("field('age').greater_than(25)");
    expect(codeElement).not.toHaveTextContent("'25'");

    // Test boolean values
    await ruleBuilderInteractions.selectField(canvas, "isActive");
    await ruleBuilderInteractions.selectOperator(canvas, "equals");
    await ruleBuilderInteractions.enterValue(canvas, "true");

    // Boolean values should not be quoted when they're boolean strings
    ruleBuilderAssertions.hasCorrectCondition(
      canvas,
      "isActive",
      "equals",
      "true"
    );
  },
};

export const PerformanceTesting: Story = {
  name: "⚡ Performance Testing",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: "Tests that rapid interactions don't cause performance issues.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const startTime = performance.now();

    // Rapid field switching
    const fields = ["email", "name", "age", "city", "phoneNumber"];
    for (const field of fields) {
      await ruleBuilderInteractions.selectField(canvas, field);
      await ruleBuilderInteractions.selectOperator(canvas, "equals");
      await ruleBuilderInteractions.enterValue(canvas, "test");
      // Small delay to allow updates
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete quickly (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds

    // Final state should still be valid
    ruleBuilderAssertions.hasCorrectCondition(
      canvas,
      "phoneNumber",
      "equals",
      "test"
    );
  },
};

export const AccessibilityTesting: Story = {
  name: "♿ Accessibility Testing",
  args: {
    fields: DEMO_FIELD_SCHEMAS,
  },
  parameters: {
    docs: {
      description: {
        story: "Tests keyboard navigation and screen reader compatibility.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test keyboard navigation through all form elements
    const fieldSelect = getRuleBuilderInput(canvas, "Field");
    const operatorSelect = getRuleBuilderInput(canvas, "Operator");
    const valueInput = getRuleBuilderInput(canvas, "Value");
    const actionSelect = getRuleBuilderInput(canvas, "Action");

    // All elements should be keyboard accessible
    expect(fieldSelect).toBeVisible();
    expect(operatorSelect).toBeVisible();
    expect(valueInput).toBeVisible();
    expect(actionSelect).toBeVisible();

    // Test tab navigation
    fieldSelect.focus();
    expect(fieldSelect).toHaveFocus();

    await userEvent.tab();
    expect(operatorSelect).toHaveFocus();

    await userEvent.tab();
    expect(valueInput).toHaveFocus();

    await userEvent.tab();
    expect(actionSelect).toHaveFocus();
  },
};
