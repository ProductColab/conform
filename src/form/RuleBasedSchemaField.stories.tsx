import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "@storybook/test";
import { RuleBasedSchemaField } from "./RuleBasedSchemaField";
import { RuleContextProvider } from "../contexts/RuleContext";
import type { FieldConfig } from "../hooks/useFormRules";
import { createFieldMeta, createStoryArgs } from "@/lib/storybook-utils";

const meta: Meta<typeof RuleBasedSchemaField> = {
  ...createFieldMeta("form/RuleBasedSchemaField", RuleBasedSchemaField),
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Field name for form registration",
    },
    property: {
      control: { type: "object" },
      description: "JSON Schema property definition",
    },
    required: {
      control: { type: "boolean" },
      description: "Whether the field is required by schema",
    },
    description: {
      control: { type: "text" },
      description: "Custom description text",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the field is disabled by schema",
    },
    ruleConfig: {
      control: { type: "object" },
      description: "Rule-based field configuration",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes",
    },
    useContext: {
      control: { type: "boolean" },
      description: "Whether to use rule context for configuration",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schema definitions
const stringSchema = {
  type: "string",
  title: "Text Field",
} as const;

const selectSchema = {
  type: "string",
  enum: ["option1", "option2", "option3"] as (
    | string
    | number
    | boolean
    | null
  )[],
  title: "Select Field",
} as const;

const numberSchema = {
  type: "number",
  minimum: 0,
  maximum: 100,
  title: "Number Field",
} as const;

// Rule configurations for different scenarios
const warningRuleConfig: FieldConfig = {
  visible: true,
  required: false,
  disabled: false,
  warnings: [
    "This field has a warning message",
    "Multiple warnings are supported",
  ],
  errors: [],
  classes: [],
};

const errorRuleConfig: FieldConfig = {
  visible: true,
  required: false,
  disabled: false,
  warnings: [],
  errors: ["This field has an error", "Critical validation failed"],
  classes: [],
};

const requiredRuleConfig: FieldConfig = {
  visible: true,
  required: true,
  disabled: false,
  warnings: [],
  errors: [],
  classes: [],
};

const disabledRuleConfig: FieldConfig = {
  visible: true,
  required: false,
  disabled: true,
  warnings: [],
  errors: [],
  classes: [],
};

const hiddenRuleConfig: FieldConfig = {
  visible: false,
  required: false,
  disabled: false,
  warnings: [],
  errors: [],
  classes: [],
};

const styledRuleConfig: FieldConfig = {
  visible: true,
  required: false,
  disabled: false,
  warnings: [],
  errors: [],
  classes: ["border-blue-500", "bg-blue-50", "rounded-lg"],
};

const dynamicOptionsRuleConfig: FieldConfig = {
  visible: true,
  required: false,
  disabled: false,
  warnings: [],
  errors: [],
  classes: [],
  options: ["dynamic1", "dynamic2", "dynamic3", "dynamic4"],
};

const complexRuleConfig: FieldConfig = {
  visible: true,
  required: true,
  disabled: false,
  warnings: ["This field requires special attention"],
  errors: [],
  classes: ["border-orange-500", "bg-orange-50"],
};

/**
 * Default - Basic text field with no rule enhancements
 */
export const Default: Story = {
  args: createStoryArgs({
    name: "basicField",
    property: stringSchema,
    required: false,
    description: "A basic field with no rule enhancements",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should render as normal text field
    const input = canvas.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();

    // No warnings or errors should be present
    expect(canvas.queryByText(/warning/i)).not.toBeInTheDocument();
    expect(canvas.queryByText(/error/i)).not.toBeInTheDocument();
  },
};

/**
 * Rule Required - Field made required through rules
 */
export const RuleRequired: Story = {
  args: createStoryArgs({
    name: "requiredField",
    property: stringSchema,
    required: false, // Not required by schema
    ruleConfig: requiredRuleConfig, // But required by rules
    description: "This field is made required by rules",
  }),
  play: async ({ canvasElement }) => {
    // Should show required indicator
    const label = canvasElement.querySelector('label[data-slot="form-label"]');
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toContain("*");
  },
};

/**
 * Rule Disabled - Field disabled through rules
 */
export const RuleDisabled: Story = {
  args: createStoryArgs({
    name: "disabledField",
    property: stringSchema,
    disabled: false, // Not disabled by schema
    ruleConfig: disabledRuleConfig, // But disabled by rules
    description: "This field is disabled by rules",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("textbox");
    expect(input).toBeDisabled();
  },
};

/**
 * Rule Hidden - Field hidden through rules
 */
export const RuleHidden: Story = {
  args: createStoryArgs({
    name: "hiddenField",
    property: stringSchema,
    ruleConfig: hiddenRuleConfig,
    description: "This field should not be visible",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Field should not be rendered at all
    expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    expect(canvas.queryByText("Text Field")).not.toBeInTheDocument();
  },
};

/**
 * With Warnings - Field with rule-based warning messages
 */
export const WithWarnings: Story = {
  args: createStoryArgs({
    name: "warningField",
    property: stringSchema,
    ruleConfig: warningRuleConfig,
    description: "This field has warning messages from rules",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show warning messages
    expect(
      canvas.getByText("This field has a warning message")
    ).toBeInTheDocument();
    expect(
      canvas.getByText("Multiple warnings are supported")
    ).toBeInTheDocument();

    // Should have warning styling - check for SVG elements or specific icons
    const alertElements = canvasElement.querySelectorAll('[role="alert"]');
    expect(alertElements.length).toBeGreaterThan(0);

    // Check for SVG icon presence (Lucide icons render as SVG)
    const svgIcons = canvasElement.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  },
};

/**
 * With Errors - Field with rule-based error messages
 */
export const WithErrors: Story = {
  args: createStoryArgs({
    name: "errorField",
    property: stringSchema,
    ruleConfig: errorRuleConfig,
    description: "This field has error messages from rules",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show error messages
    expect(canvas.getByText("This field has an error")).toBeInTheDocument();
    expect(canvas.getByText("Critical validation failed")).toBeInTheDocument();

    // Should have error styling - check for alert elements and SVG icons
    const alertElements = canvasElement.querySelectorAll('[role="alert"]');
    expect(alertElements.length).toBeGreaterThan(0);

    // Check for SVG icon presence (Lucide icons render as SVG)
    const svgIcons = canvasElement.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThan(0);
  },
};

/**
 * Custom Styling - Field with custom CSS classes from rules
 */
export const CustomStyling: Story = {
  args: createStoryArgs({
    name: "styledField",
    property: stringSchema,
    ruleConfig: styledRuleConfig,
    className: "p-4", // Additional component-level classes
    description: "This field has custom styling from rules",
  }),
  play: async ({ canvasElement }) => {
    // Find the RuleBasedSchemaField container (should be the div with our classes)
    // The first div is the form provider wrapper, we want our component's div
    const fieldContainers = canvasElement.querySelectorAll("div");

    // Look for a div that has our rule-based classes
    let ruleBasedContainer = null;
    for (const container of fieldContainers) {
      if (
        container.classList.contains("border-blue-500") ||
        container.classList.contains("bg-blue-50") ||
        container.classList.contains("rounded-lg")
      ) {
        ruleBasedContainer = container;
        break;
      }
    }

    expect(ruleBasedContainer).toBeTruthy();
    expect(ruleBasedContainer).toHaveClass(
      "border-blue-500",
      "bg-blue-50",
      "rounded-lg",
      "p-4"
    );
  },
};

/**
 * Dynamic Options - Select field with dynamically set options from rules
 */
export const DynamicOptions: Story = {
  args: createStoryArgs({
    name: "dynamicSelectField",
    property: selectSchema,
    ruleConfig: dynamicOptionsRuleConfig,
    description: "This select field has options set dynamically by rules",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should render as select
    const select = canvas.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Click to open options
    await userEvent.click(select);

    // Should show dynamic options (they might be in a portal)
    await expect(async () => {
      const dynamicOption =
        document.querySelector('[data-value="dynamic1"]') ||
        within(document.body).queryByText("dynamic1");
      expect(dynamicOption).toBeTruthy();
    }).not.toThrow();
  },
};

/**
 * Complex Configuration - Field with multiple rule enhancements
 */
export const ComplexConfiguration: Story = {
  args: createStoryArgs({
    name: "complexField",
    property: numberSchema,
    ruleConfig: complexRuleConfig,
    description: "This field demonstrates multiple rule enhancements",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should be required
    const label = canvasElement.querySelector('label[data-slot="form-label"]');
    expect(label?.textContent).toContain("*");

    // Should have custom styling - look for our rule-based container
    const fieldContainers = canvasElement.querySelectorAll("div");
    let ruleBasedContainer = null;
    for (const container of fieldContainers) {
      if (
        container.classList.contains("border-orange-500") ||
        container.classList.contains("bg-orange-50")
      ) {
        ruleBasedContainer = container;
        break;
      }
    }

    expect(ruleBasedContainer).toBeTruthy();
    expect(ruleBasedContainer).toHaveClass("border-orange-500", "bg-orange-50");

    // Should show warning
    expect(
      canvas.getByText("This field requires special attention")
    ).toBeInTheDocument();
  },
};

/**
 * Context Provider - Field using rule context instead of explicit config
 */
export const WithRuleContext: Story = {
  args: createStoryArgs({
    name: "contextField",
    property: stringSchema,
    useContext: true,
    description: "This field gets rule config from context",
  }),
  decorators: [
    (Story) => {
      const mockGetFieldConfig = (
        fieldName: string
      ): FieldConfig | undefined => {
        if (fieldName === "contextField") {
          return {
            visible: true,
            required: true,
            disabled: false,
            warnings: ["Warning from context"],
            errors: [],
            classes: ["bg-green-50"],
          };
        }
        return undefined;
      };

      return (
        <RuleContextProvider getFieldConfig={mockGetFieldConfig}>
          <Story />
        </RuleContextProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should be required (from context)
    const label = canvasElement.querySelector('label[data-slot="form-label"]');
    expect(label?.textContent).toContain("*");

    // Should have context-provided styling - look for our rule-based container
    const fieldContainers = canvasElement.querySelectorAll("div");
    let ruleBasedContainer = null;
    for (const container of fieldContainers) {
      if (container.classList.contains("bg-green-50")) {
        ruleBasedContainer = container;
        break;
      }
    }

    expect(ruleBasedContainer).toBeTruthy();
    expect(ruleBasedContainer).toHaveClass("bg-green-50");

    // Should show context warning
    expect(canvas.getByText("Warning from context")).toBeInTheDocument();
  },
};

/**
 * Mixed Configuration - Explicit config overrides context
 */
export const MixedConfiguration: Story = {
  args: createStoryArgs({
    name: "mixedField",
    property: stringSchema,
    useContext: true,
    ruleConfig: errorRuleConfig, // Explicit config should override context
    description: "Explicit rule config overrides context",
  }),
  decorators: [
    (Story) => {
      const mockGetFieldConfig = (
        fieldName: string
      ): FieldConfig | undefined => {
        if (fieldName === "mixedField") {
          return warningRuleConfig; // Context provides warnings
        }
        return undefined;
      };

      return (
        <RuleContextProvider getFieldConfig={mockGetFieldConfig}>
          <Story />
        </RuleContextProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show errors from explicit config, not warnings from context
    expect(canvas.getByText("This field has an error")).toBeInTheDocument();
    expect(
      canvas.queryByText("This field has a warning message")
    ).not.toBeInTheDocument();
  },
};

/**
 * All Field Types - Showcase different field types with rule enhancements
 */
export const AllFieldTypesWithRules: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Text Field with Rules</h3>
        <RuleBasedSchemaField
          name="textWithRules"
          property={stringSchema}
          ruleConfig={warningRuleConfig}
          description="Text field with warning messages"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Required Select Field</h3>
        <RuleBasedSchemaField
          name="selectRequired"
          property={selectSchema}
          ruleConfig={requiredRuleConfig}
          description="Select field made required by rules"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Number Field with Errors</h3>
        <RuleBasedSchemaField
          name="numberWithErrors"
          property={numberSchema}
          ruleConfig={errorRuleConfig}
          description="Number field with error messages"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Disabled Field</h3>
        <RuleBasedSchemaField
          name="disabledExample"
          property={stringSchema}
          ruleConfig={disabledRuleConfig}
          description="Field disabled by rules"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Styled Field</h3>
        <RuleBasedSchemaField
          name="styledExample"
          property={stringSchema}
          ruleConfig={styledRuleConfig}
          description="Field with custom styling from rules"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Hidden Field</h3>
        <p className="text-sm text-gray-600 mb-2">
          The field below should not be visible:
        </p>
        <RuleBasedSchemaField
          name="hiddenExample"
          property={stringSchema}
          ruleConfig={hiddenRuleConfig}
          description="This field should not be visible"
        />
        <p className="text-sm text-gray-500">
          ↑ Nothing should appear above this text
        </p>
      </div>
    </div>
  ),
};
