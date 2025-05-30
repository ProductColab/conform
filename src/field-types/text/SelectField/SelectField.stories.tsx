import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { SelectField } from "./SelectField";
import {
  createFieldMeta,
  createStoryArgs,
  withFormProvider,
  fieldAssertions,
} from "@/lib/storybook-utils";

const meta: Meta<typeof SelectField> = {
  ...createFieldMeta("text/SelectField", SelectField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema with enum property defining available options",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common enum schemas for stories
const colorOptions = {
  type: "string",
  enum: ["red", "green", "blue", "yellow", "purple"],
} as const;

const priorityOptions = {
  type: "string",
  enum: ["low", "medium", "high", "critical"],
} as const;

const sizeOptions = {
  type: "string",
  enum: ["xs", "sm", "md", "lg", "xl", "2xl"],
} as const;

const countryOptions = {
  type: "string",
  enum: [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
  ],
} as const;

const statusOptions = {
  type: "string",
  enum: ["draft", "pending", "approved", "rejected", "archived"],
} as const;

/**
 * Basic select field with simple options
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Favorite Color",
    name: "favoriteColor",
    property: colorOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    // Find the select trigger button
    const selectTrigger = canvas.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");

    // Check placeholder
    expect(canvas.getByText("Select Favorite Color")).toBeInTheDocument();

    // Open the select
    await userEvent.click(selectTrigger);
    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");

    // Check that options are visible (in document, not canvas)
    const redOption = documentQuery.getByRole("option", { name: "red" });
    expect(redOption).toBeInTheDocument();

    // Select an option
    await userEvent.click(redOption);
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    expect(selectTrigger).toHaveTextContent("red");
  },
};

/**
 * Required field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Priority Level",
    name: "priority",
    required: true,
    property: priorityOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    // Check for required indicator
    fieldAssertions.hasLabel(canvas, "Priority Level", true);

    const selectTrigger = canvas.getByRole("combobox");

    // Open and select an option
    await userEvent.click(selectTrigger);
    const highOption = documentQuery.getByRole("option", { name: "high" });
    await userEvent.click(highOption);

    expect(selectTrigger).toHaveTextContent("high");
  },
};

/**
 * Field with helpful description text
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "T-Shirt Size",
    name: "size",
    description: "Select your preferred t-shirt size for the event",
    property: sizeOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    fieldAssertions.hasDescription(
      canvas,
      "Select your preferred t-shirt size for the event"
    );

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    const mdOption = documentQuery.getByRole("option", { name: "md" });
    await userEvent.click(mdOption);

    expect(selectTrigger).toHaveTextContent("md");
  },
};

/**
 * Field with custom placeholder
 */
export const CustomPlaceholder: Story = {
  args: createStoryArgs({
    label: "Country",
    name: "country",
    property: countryOptions,
    metadata: {
      placeholder: "Choose your country...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    expect(canvas.getByText("Choose your country...")).toBeInTheDocument();

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    const usOption = documentQuery.getByRole("option", {
      name: "United States",
    });
    await userEvent.click(usOption);

    expect(selectTrigger).toHaveTextContent("United States");
  },
};

/**
 * Field with many options
 */
export const ManyOptions: Story = {
  args: createStoryArgs({
    label: "Department",
    name: "department",
    property: {
      type: "string",
      enum: [
        "Engineering",
        "Product Management",
        "Design",
        "Marketing",
        "Sales",
        "Customer Success",
        "Human Resources",
        "Finance",
        "Operations",
        "Legal",
        "Security",
        "Data Science",
      ],
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    // Check that multiple options are available (in document)
    expect(
      documentQuery.getByRole("option", { name: "Engineering" })
    ).toBeInTheDocument();
    expect(
      documentQuery.getByRole("option", { name: "Design" })
    ).toBeInTheDocument();
    expect(
      documentQuery.getByRole("option", { name: "Data Science" })
    ).toBeInTheDocument();

    const engineeringOption = documentQuery.getByRole("option", {
      name: "Engineering",
    });
    await userEvent.click(engineeringOption);

    expect(selectTrigger).toHaveTextContent("Engineering");
  },
};

/**
 * Field with numeric enum values
 */
export const NumericOptions: Story = {
  args: createStoryArgs({
    label: "Rating",
    name: "rating",
    description: "Rate your experience from 1 to 5",
    property: {
      type: "number",
      enum: [1, 2, 3, 4, 5],
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    const fiveOption = documentQuery.getByRole("option", { name: "5" });
    await userEvent.click(fiveOption);

    expect(selectTrigger).toHaveTextContent("5");
  },
};

/**
 * Field with mixed type options
 */
export const MixedTypeOptions: Story = {
  args: createStoryArgs({
    label: "Mixed Values",
    name: "mixedValues",
    description: "Select from different value types",
    property: {
      type: "string",
      enum: ["text", 42, true, "false", 0],
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    // Check that all values are converted to strings for display
    expect(
      documentQuery.getByRole("option", { name: "text" })
    ).toBeInTheDocument();
    expect(
      documentQuery.getByRole("option", { name: "42" })
    ).toBeInTheDocument();
    expect(
      documentQuery.getByRole("option", { name: "true" })
    ).toBeInTheDocument();

    const numberOption = documentQuery.getByRole("option", { name: "42" });
    await userEvent.click(numberOption);

    expect(selectTrigger).toHaveTextContent("42");
  },
};

/**
 * Field with status/state options
 */
export const StatusField: Story = {
  args: createStoryArgs({
    label: "Document Status",
    name: "status",
    required: true,
    description: "Current status of the document",
    property: statusOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    fieldAssertions.hasLabel(canvas, "Document Status", true);
    fieldAssertions.hasDescription(canvas, "Current status of the document");

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    const approvedOption = documentQuery.getByRole("option", {
      name: "approved",
    });
    await userEvent.click(approvedOption);

    expect(selectTrigger).toHaveTextContent("approved");
  },
};

/**
 * Field with pre-selected value
 */
export const WithDefaultValue: Story = {
  args: createStoryArgs({
    label: "Theme",
    name: "theme",
    property: {
      type: "string",
      enum: ["light", "dark", "auto"],
    },
  }),
  decorators: [
    withFormProvider({
      theme: "dark",
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    // Should show the pre-selected value
    const selectTrigger = canvas.getByRole("combobox");
    expect(selectTrigger).toHaveTextContent("dark");

    await userEvent.click(selectTrigger);

    // Change to a different option
    const lightOption = documentQuery.getByRole("option", { name: "light" });
    await userEvent.click(lightOption);

    expect(selectTrigger).toHaveTextContent("light");
  },
};

/**
 * Disabled field state
 */
export const Disabled: Story = {
  args: createStoryArgs({
    label: "Account Type",
    name: "accountType",
    property: {
      type: "string",
      enum: ["basic", "premium", "enterprise"],
    },
    metadata: {
      placeholder: "Cannot be changed",
    },
  }),
  decorators: [
    withFormProvider({
      accountType: "premium",
    }),
  ],
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <SelectField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectTrigger = canvas.getByRole("combobox");
    expect(selectTrigger).toHaveTextContent("premium");

    // Note: When a value is selected, the placeholder is not shown
    // The disabled styling is handled by the wrapper div
    expect(canvas.getByText("Account Type")).toBeInTheDocument();
  },
};

/**
 * Interactive example for testing keyboard navigation
 */
export const KeyboardNavigation: Story = {
  args: createStoryArgs({
    label: "Navigation Test",
    name: "keyboardTest",
    property: colorOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectTrigger = canvas.getByRole("combobox");

    // Test keyboard navigation
    await userEvent.tab();
    expect(selectTrigger).toHaveFocus();

    // Open with Enter
    await userEvent.keyboard("{Enter}");
    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");

    // Navigate with arrow keys and select with Enter
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
  },
};

/**
 * Complete interaction testing
 */
export const InteractionTesting: Story = {
  args: createStoryArgs({
    label: "Interaction Test",
    name: "interactionTest",
    property: priorityOptions,
    metadata: {
      placeholder: "Test all interactions...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    const selectTrigger = canvas.getByRole("combobox");

    // Test focus behavior - initially not focused
    expect(selectTrigger).not.toHaveFocus();

    // Click to open and focus
    await userEvent.click(selectTrigger);

    // Test opening and closing
    expect(selectTrigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");

    // Test selection
    await userEvent.click(selectTrigger);
    const mediumOption = documentQuery.getByRole("option", { name: "medium" });
    await userEvent.click(mediumOption);

    expect(selectTrigger).toHaveTextContent("medium");

    // Test changing selection
    await userEvent.click(selectTrigger);
    const criticalOption = documentQuery.getByRole("option", {
      name: "critical",
    });
    await userEvent.click(criticalOption);

    expect(selectTrigger).toHaveTextContent("critical");
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessible Select",
    name: "accessible",
    required: true,
    description: "This select has proper accessibility attributes",
    property: statusOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectTrigger = canvas.getByRole("combobox");

    // Test ARIA attributes
    expect(selectTrigger).toHaveAttribute("aria-expanded", "false");
    // Note: Radix UI Select uses aria-autocomplete and role="combobox" instead of aria-haspopup="listbox"
    expect(selectTrigger).toHaveAttribute("aria-autocomplete", "none");

    // Test keyboard accessibility
    await userEvent.tab();
    expect(selectTrigger).toHaveFocus();

    // Test screen reader friendly labels
    fieldAssertions.hasLabel(canvas, "Accessible Select", true);
    fieldAssertions.hasDescription(
      canvas,
      "This select has proper accessibility attributes"
    );

    // Test option selection with keyboard
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    // Arrow down from first option goes to second option
    // statusOptions = ["draft", "pending", "approved", "rejected", "archived"]
    // So ArrowDown from "draft" goes to "pending"
    expect(selectTrigger).toHaveTextContent("pending");
  },
};

/**
 * All select variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Select</h3>
        <SelectField
          {...createStoryArgs({
            label: "Color",
            name: "color1",
            property: colorOptions,
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Required Select</h3>
        <SelectField
          {...createStoryArgs({
            label: "Priority",
            name: "priority1",
            required: true,
            property: priorityOptions,
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">With Description</h3>
        <SelectField
          {...createStoryArgs({
            label: "Size",
            name: "size1",
            description: "Choose your preferred size",
            property: sizeOptions,
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Placeholder</h3>
        <SelectField
          {...createStoryArgs({
            label: "Country",
            name: "country1",
            property: countryOptions,
            metadata: {
              placeholder: "Pick a country...",
            },
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Numeric Options</h3>
        <SelectField
          {...createStoryArgs({
            label: "Rating",
            name: "rating1",
            property: {
              type: "number",
              enum: [1, 2, 3, 4, 5],
            },
          })}
        />
      </div>
    </div>
  ),
  decorators: [withFormProvider()],
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of different SelectField configurations and use cases.",
      },
    },
  },
};

/**
 * Playground for testing custom configurations
 */
export const Playground: Story = {
  args: createStoryArgs({
    label: "Playground Select",
    name: "playground",
    description: "Use the controls below to customize this select field",
    property: colorOptions,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentQuery = within(document.body);

    const selectTrigger = canvas.getByRole("combobox");
    await userEvent.click(selectTrigger);

    const blueOption = documentQuery.getByRole("option", { name: "blue" });
    await userEvent.click(blueOption);

    expect(selectTrigger).toHaveTextContent("blue");
  },
};
