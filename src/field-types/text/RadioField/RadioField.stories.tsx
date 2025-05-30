import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { RadioField } from "./RadioField";
import {
  createFieldMeta,
  createStoryArgs,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof RadioField> = {
  ...createFieldMeta("text/RadioField", RadioField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema with enum values for radio options",
    },
    metadata: {
      control: { type: "object" },
      description: "Field metadata with format: 'radio'",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for radio field stories
const prioritySchema = {
  type: "string",
  enum: ["low", "medium", "high", "critical"],
} as const;

const sizeSchema = {
  type: "string",
  enum: ["small", "medium", "large"],
} as const;

const yesNoSchema = {
  type: "string",
  enum: ["yes", "no"],
} as const;

const colorSchema = {
  type: "string",
  enum: ["red", "blue", "green", "yellow", "purple"],
} as const;

const ratingSchema = {
  type: "string",
  enum: ["poor", "fair", "good", "excellent"],
} as const;

/**
 * Basic radio field with multiple options
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Priority Level",
    name: "priority",
    property: prioritySchema,
    metadata: FieldPresets.singleChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Priority Level", false);

    // Check that all radio options are present
    const radioButtons = canvas.getAllByRole("radio");
    expect(radioButtons).toHaveLength(4);

    // Check radio button labels
    expect(canvas.getByLabelText("low")).toBeInTheDocument();
    expect(canvas.getByLabelText("medium")).toBeInTheDocument();
    expect(canvas.getByLabelText("high")).toBeInTheDocument();
    expect(canvas.getByLabelText("critical")).toBeInTheDocument();

    // Test selecting an option
    const mediumOption = canvas.getByLabelText("medium");
    await userEvent.click(mediumOption);
    expect(mediumOption).toBeChecked();

    // Ensure other options are not checked
    expect(canvas.getByLabelText("low")).not.toBeChecked();
    expect(canvas.getByLabelText("high")).not.toBeChecked();
    expect(canvas.getByLabelText("critical")).not.toBeChecked();
  },
};

/**
 * Required radio field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "T-Shirt Size",
    name: "size",
    required: true,
    property: sizeSchema,
    metadata: FieldPresets.singleChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "T-Shirt Size", true);

    const radioButtons = canvas.getAllByRole("radio");
    expect(radioButtons).toHaveLength(3);

    // Test all options are selectable
    for (const option of ["small", "medium", "large"]) {
      const radioOption = canvas.getByLabelText(option);
      await userEvent.click(radioOption);
      expect(radioOption).toBeChecked();
    }
  },
};

/**
 * Radio field with helpful description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Newsletter Subscription",
    name: "newsletter",
    description: "Would you like to receive our weekly newsletter?",
    property: yesNoSchema,
    metadata: FieldPresets.singleChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Would you like to receive our weekly newsletter?"
    );

    const yesOption = canvas.getByLabelText("yes");
    const noOption = canvas.getByLabelText("no");

    await userEvent.click(yesOption);
    expect(yesOption).toBeChecked();
    expect(noOption).not.toBeChecked();

    await userEvent.click(noOption);
    expect(noOption).toBeChecked();
    expect(yesOption).not.toBeChecked();
  },
};

/**
 * Radio field with many options
 */
export const ManyOptions: Story = {
  args: createStoryArgs({
    label: "Favorite Color",
    name: "color",
    property: colorSchema,
    metadata: FieldPresets.singleChoice,
    description: "Choose your favorite color from the options below",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const radioButtons = canvas.getAllByRole("radio");
    expect(radioButtons).toHaveLength(5);

    // Test selecting the last option
    const purpleOption = canvas.getByLabelText("purple");
    await userEvent.click(purpleOption);
    expect(purpleOption).toBeChecked();

    // Verify it's a single-choice field (only one can be selected)
    const checkedRadios = canvas
      .getAllByRole("radio")
      .filter((radio) => (radio as HTMLInputElement).checked);
    expect(checkedRadios).toHaveLength(1);
  },
};

/**
 * Radio field for ratings/feedback
 */
export const RatingOptions: Story = {
  args: createStoryArgs({
    label: "Service Rating",
    name: "serviceRating",
    required: true,
    property: ratingSchema,
    metadata: FieldPresets.singleChoice,
    description: "How would you rate our service?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Service Rating", true);
    fieldAssertions.hasDescription(canvas, "How would you rate our service?");

    const radioButtons = canvas.getAllByRole("radio");
    expect(radioButtons).toHaveLength(4);

    // Test selecting "excellent" rating
    const excellentOption = canvas.getByLabelText("excellent");
    await userEvent.click(excellentOption);
    expect(excellentOption).toBeChecked();
  },
};

/**
 * Binary choice radio field
 */
export const BinaryChoice: Story = {
  args: createStoryArgs({
    label: "Terms and Conditions",
    name: "terms",
    required: true,
    property: {
      type: "string",
      enum: ["accept", "decline"],
    },
    metadata: FieldPresets.singleChoice,
    description: "Do you accept our terms and conditions?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const radioButtons = canvas.getAllByRole("radio");
    expect(radioButtons).toHaveLength(2);

    const acceptOption = canvas.getByLabelText("accept");
    const declineOption = canvas.getByLabelText("decline");

    // Test exclusive selection
    await userEvent.click(acceptOption);
    expect(acceptOption).toBeChecked();
    expect(declineOption).not.toBeChecked();

    await userEvent.click(declineOption);
    expect(declineOption).toBeChecked();
    expect(acceptOption).not.toBeChecked();
  },
};

/**
 * Radio field accessibility test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessibility Test",
    name: "accessibilityTest",
    property: prioritySchema,
    metadata: FieldPresets.singleChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const radioButtons = canvas.getAllByRole("radio");

    // Test keyboard navigation
    const firstRadio = radioButtons[0];
    firstRadio.focus();
    expect(firstRadio).toHaveFocus();

    // Test that each radio has proper labels and ids
    radioButtons.forEach((radio) => {
      expect(radio).toHaveAttribute("id");
      expect(radio).toHaveAttribute("name", "accessibilityTest");
      expect(radio).toHaveAttribute("type", "radio");
    });

    // Test label association
    const labels = canvas
      .getAllByRole("radio")
      .map((radio) => canvas.getByLabelText((radio as HTMLInputElement).value));
    expect(labels).toHaveLength(4);
  },
};
