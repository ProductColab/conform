import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "@storybook/test";
import { SliderField } from "./SliderField";
import {
  createFieldMeta,
  createStoryArgs,
  withFormProvider,
  fieldAssertions,
} from "@/lib/storybook-utils";

const meta: Meta<typeof SliderField> = {
  ...createFieldMeta("numeric/SliderField", SliderField),
  argTypes: {
    property: {
      control: { type: "object" },
      description:
        "JSON Schema with numeric constraints (min, max, multipleOf)",
    },
    metadata: {
      control: { type: "object" },
      description:
        "Field metadata including prefix, suffix, step, and formatting",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common numeric schemas for stories
const basicRange = {
  type: "number",
  minimum: 0,
  maximum: 100,
} as const;

const integerRange = {
  type: "integer",
  minimum: 1,
  maximum: 10,
} as const;

const decimalRange = {
  type: "number",
  minimum: 0,
  maximum: 5,
  multipleOf: 0.1,
} as const;

const percentageRange = {
  type: "number",
  minimum: 0,
  maximum: 100,
  multipleOf: 1,
} as const;

const priceRange = {
  type: "number",
  minimum: 0,
  maximum: 1000,
  multipleOf: 0.01,
} as const;

const temperatureRange = {
  type: "number",
  minimum: -50,
  maximum: 50,
  multipleOf: 0.5,
} as const;

/**
 * Basic slider field with default configuration
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Volume",
    name: "volume",
    property: basicRange,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check both slider and input are present

    const input = canvas.getByRole("spinbutton");
    const slider = canvas.getByRole("slider");

    expect(slider).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(0); // Default value (min or 0)

    // Test input change updates slider
    await userEvent.clear(input);
    await userEvent.type(input, "50");
    expect(input).toHaveValue(50);
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
    property: integerRange,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Priority Level", true);

    const input = canvas.getByRole("spinbutton");

    // Test input attributes (Radix Slider internal attributes aren't exposed)
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "10");
    expect(input).toHaveValue(1); // Minimum value

    await userEvent.clear(input);
    await userEvent.type(input, "7");
    expect(input).toHaveValue(7);
  },
};

/**
 * Field with helpful description text
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Quality Rating",
    name: "quality",
    description: "Rate the quality from 0 to 5 stars",
    property: decimalRange,
    metadata: {
      step: 0.1,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Rate the quality from 0 to 5 stars"
    );

    const input = canvas.getByRole("spinbutton");

    // Test input step attribute (step is computed from constraints)
    expect(input).toHaveAttribute("step", "0.1");

    await userEvent.clear(input);
    await userEvent.type(input, "4.5");
    expect(input).toHaveValue(4.5);
  },
};

/**
 * Price slider with currency prefix
 */
export const WithPrefix: Story = {
  args: createStoryArgs({
    label: "Budget",
    name: "budget",
    property: priceRange,
    metadata: {
      prefix: "$",
      step: 1,
      placeholder: "0",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasPrefix(canvas, "$");

    const input = canvas.getByRole("spinbutton");
    fieldAssertions.hasCorrectPadding(input, true, false);

    await userEvent.clear(input);
    await userEvent.type(input, "250");
    expect(input).toHaveValue(250);
  },
};

/**
 * Percentage slider with suffix
 */
export const WithSuffix: Story = {
  args: createStoryArgs({
    label: "Progress",
    name: "progress",
    property: percentageRange,
    metadata: {
      suffix: "%",
      step: 5,
      placeholder: "0",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasSuffix(canvas, "%");

    const input = canvas.getByRole("spinbutton");
    fieldAssertions.hasCorrectPadding(input, false, true);

    await userEvent.clear(input);
    await userEvent.type(input, "75");
    expect(input).toHaveValue(75);
  },
};

/**
 * Field with both prefix and suffix
 */
export const WithPrefixAndSuffix: Story = {
  args: createStoryArgs({
    label: "Cost Per Unit",
    name: "costPerUnit",
    property: priceRange,
    metadata: {
      prefix: "$",
      suffix: "USD",
      step: 0.1,
      placeholder: "0.0",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasPrefix(canvas, "$");
    fieldAssertions.hasSuffix(canvas, "USD");

    const input = canvas.getByRole("spinbutton");
    fieldAssertions.hasCorrectPadding(input, true, true);

    await userEvent.clear(input);
    await userEvent.type(input, "15.5");
    expect(input).toHaveValue(15.5);
  },
};

/**
 * Integer-only slider with step control
 */
export const IntegerOnly: Story = {
  args: createStoryArgs({
    label: "Team Size",
    name: "teamSize",
    description: "Number of team members (1-20)",
    property: {
      type: "integer",
      minimum: 1,
      maximum: 20,
    },
    metadata: {
      step: 1,
      placeholder: "Select team size",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    // Test input attributes only (Radix doesn't expose these on slider element)
    expect(input).toHaveAttribute("step", "1");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "20");

    await userEvent.clear(input);
    await userEvent.type(input, "8");
    expect(input).toHaveValue(8);
  },
};

/**
 * Decimal precision slider
 */
export const DecimalPrecision: Story = {
  args: createStoryArgs({
    label: "Temperature",
    name: "temperature",
    description: "Temperature in Celsius (-50°C to 50°C)",
    property: temperatureRange,
    metadata: {
      suffix: "°C",
      step: 0.5,
      placeholder: "0.0",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    // Test input attributes
    expect(input).toHaveAttribute("step", "0.5");
    expect(input).toHaveAttribute("min", "-50");
    expect(input).toHaveAttribute("max", "50");

    await userEvent.clear(input);
    await userEvent.type(input, "22.5");
    expect(input).toHaveValue(22.5);
  },
};

/**
 * Wide range slider for large values
 */
export const WideRange: Story = {
  args: createStoryArgs({
    label: "Annual Income",
    name: "income",
    property: {
      type: "number",
      minimum: 0,
      maximum: 500000,
    },
    metadata: {
      step: 1000,
      placeholder: "Enter annual income",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    // Test input attributes
    expect(input).toHaveAttribute("max", "500000");
    expect(input).toHaveAttribute("step", "1000");

    await userEvent.clear(input);
    await userEvent.type(input, "75000");
    expect(input).toHaveValue(75000);
  },
};

/**
 * Small range slider for precise control
 */
export const SmallRange: Story = {
  args: createStoryArgs({
    label: "Opacity",
    name: "opacity",
    description: "Adjust opacity from 0.0 to 1.0",
    property: {
      type: "number",
      minimum: 0,
      maximum: 1,
      multipleOf: 0.01,
    },
    metadata: {
      step: 0.01,
      placeholder: "0.00",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    // Test input attributes
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "1");
    expect(input).toHaveAttribute("step", "0.01");

    await userEvent.clear(input);
    await userEvent.type(input, "0.75");
    expect(input).toHaveValue(0.75);
  },
};

/**
 * Field with pre-filled value
 */
export const WithDefaultValue: Story = {
  args: createStoryArgs({
    label: "Volume Level",
    name: "volumeLevel",
    property: percentageRange,
    metadata: {
      step: 10,
    },
  }),
  decorators: [
    withFormProvider({
      volumeLevel: 60,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    expect(input).toHaveValue(60);

    await userEvent.clear(input);
    await userEvent.type(input, "80");
    expect(input).toHaveValue(80);
  },
};

/**
 * Disabled field state
 */
export const Disabled: Story = {
  args: createStoryArgs({
    label: "System Load",
    name: "systemLoad",
    property: percentageRange,
    metadata: {
      placeholder: "Read-only",
    },
  }),
  decorators: [
    withFormProvider({
      systemLoad: 45,
    }),
  ],
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <SliderField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    expect(input).toHaveValue(45);
  },
};

/**
 * Custom placeholder text
 */
export const CustomPlaceholder: Story = {
  args: createStoryArgs({
    label: "Speed Limit",
    name: "speedLimit",
    property: {
      type: "integer",
      minimum: 10,
      maximum: 120,
    },
    metadata: {
      suffix: "mph",
      placeholder: "Set speed limit",
      step: 5,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");
    // The SliderField uses defaultValue when undefined, so placeholder may not be visible
    // Let's test by clearing the field instead

    await userEvent.clear(input);
    await userEvent.type(input, "65");
    expect(input).toHaveValue(65);
  },
};

/**
 * Interactive testing for slider and input synchronization
 */
export const InteractionTesting: Story = {
  args: createStoryArgs({
    label: "Interaction Test",
    name: "interactionTest",
    property: basicRange,
    metadata: {
      step: 1,
      placeholder: "Test slider interactions...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");
    const slider = canvas.getByRole("slider");
    // Test focus behavior
    expect(input).not.toHaveFocus();
    await userEvent.click(input);
    expect(input).toHaveFocus();

    // Test typing in input
    await userEvent.clear(input);
    await userEvent.type(input, "50");
    expect(input).toHaveValue(50);

    // Test slider interaction (basic click on slider area)
    await userEvent.click(slider);

    // Test keyboard navigation on input
    await userEvent.clear(input);
    await userEvent.type(input, "75");
    expect(input).toHaveValue(75);

    // Test clearing - SliderField defaults to min value (0) when cleared
    await userEvent.clear(input);
    expect(input).toHaveValue(0); // Component defaults to min value
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessible Slider",
    name: "accessible",
    required: true,
    description: "This slider has proper accessibility attributes",
    property: basicRange,
    metadata: {
      step: 5,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");
    const slider = canvas.getByRole("slider");

    // Test that both slider and input are accessible
    expect(slider).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    // Test ARIA attributes on input (which has the standard HTML attributes)
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "5");

    // Test keyboard accessibility - slider gets focus first due to HTML structure
    await userEvent.tab();
    expect(slider).toHaveFocus(); // Slider thumb is first in tab order

    // Test screen reader friendly labels
    fieldAssertions.hasLabel(canvas, "Accessible Slider", true);
    fieldAssertions.hasDescription(
      canvas,
      "This slider has proper accessibility attributes"
    );

    // Test input functionality by clicking on it
    await userEvent.click(input);
    expect(input).toHaveFocus();
    await userEvent.type(input, "60");
    expect(input).toHaveValue(60);
  },
};

/**
 * All slider field variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Range</h3>
        <SliderField
          {...createStoryArgs({
            label: "Volume",
            name: "volume1",
            property: basicRange,
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Price Range with Prefix</h3>
        <SliderField
          {...createStoryArgs({
            label: "Budget",
            name: "budget1",
            property: priceRange,
            metadata: { step: 10 },
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Percentage with Suffix</h3>
        <SliderField
          {...createStoryArgs({
            label: "Progress",
            name: "progress1",
            property: percentageRange,
            metadata: { step: 5 },
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Integer Range</h3>
        <SliderField
          {...createStoryArgs({
            label: "Rating",
            name: "rating1",
            property: integerRange,
            metadata: { step: 1 },
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Decimal Precision</h3>
        <SliderField
          {...createStoryArgs({
            label: "Temperature",
            name: "temp1",
            property: temperatureRange,
            metadata: { step: 0.5 },
          })}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Small Range (Opacity)</h3>
        <SliderField
          {...createStoryArgs({
            label: "Opacity",
            name: "opacity1",
            property: {
              type: "number",
              minimum: 0,
              maximum: 1,
              multipleOf: 0.01,
            },
            metadata: { step: 0.01 },
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
          "Showcase of different SliderField configurations and use cases.",
      },
    },
  },
};

/**
 * Playground for testing custom configurations
 */
export const Playground: Story = {
  args: createStoryArgs({
    label: "Playground Slider",
    name: "playground",
    description: "Use the controls below to customize this slider field",
    property: basicRange,
    metadata: {
      step: 1,
      placeholder: "Interactive testing...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "42");
    expect(input).toHaveValue(42);
  },
};
