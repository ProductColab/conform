import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "@storybook/test";
import { CheckboxGroupField } from "./CheckboxGroupField";
import {
  createFieldMeta,
  createStoryArgs,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof CheckboxGroupField> = {
  ...createFieldMeta("text/CheckboxGroupField", CheckboxGroupField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema with enum values for checkbox options",
    },
    metadata: {
      control: { type: "object" },
      description: "Field metadata with format: 'checkbox-group'",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for checkbox group stories
const skillsSchema = {
  type: "string",
  enum: ["javascript", "typescript", "react", "vue", "angular", "svelte"],
} as const;

const featuresSchema = {
  type: "string",
  enum: ["dark-mode", "notifications", "auto-save", "offline-mode"],
} as const;

const daysSchema = {
  type: "string",
  enum: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ],
} as const;

const interestsSchema = {
  type: "string",
  enum: ["sports", "music", "reading", "travel", "cooking", "gaming", "art"],
} as const;

/**
 * Basic checkbox group with multiple selectable options
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Technical Skills",
    name: "skills",
    property: skillsSchema,
    metadata: FieldPresets.multiChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Technical Skills", false);

    // Check that all checkbox options are present
    const checkboxes = canvas.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(6);

    // Check checkbox labels
    expect(canvas.getByLabelText("javascript")).toBeInTheDocument();
    expect(canvas.getByLabelText("typescript")).toBeInTheDocument();
    expect(canvas.getByLabelText("react")).toBeInTheDocument();
    expect(canvas.getByLabelText("vue")).toBeInTheDocument();
    expect(canvas.getByLabelText("angular")).toBeInTheDocument();
    expect(canvas.getByLabelText("svelte")).toBeInTheDocument();

    // Test selecting multiple options
    const jsCheckbox = canvas.getByLabelText("javascript");
    const reactCheckbox = canvas.getByLabelText("react");
    const tsCheckbox = canvas.getByLabelText("typescript");

    await userEvent.click(jsCheckbox);
    await userEvent.click(reactCheckbox);
    await userEvent.click(tsCheckbox);

    expect(jsCheckbox).toBeChecked();
    expect(reactCheckbox).toBeChecked();
    expect(tsCheckbox).toBeChecked();

    // Ensure other options remain unchecked
    expect(canvas.getByLabelText("vue")).not.toBeChecked();
    expect(canvas.getByLabelText("angular")).not.toBeChecked();
    expect(canvas.getByLabelText("svelte")).not.toBeChecked();
  },
};

/**
 * Required checkbox group with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Available Days",
    name: "availableDays",
    required: true,
    property: daysSchema,
    metadata: FieldPresets.multiChoice,
    description: "Select at least one day you're available",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Available Days", true);
    fieldAssertions.hasDescription(
      canvas,
      "Select at least one day you're available"
    );

    const checkboxes = canvas.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(7);

    // Test selecting multiple days
    const mondayCheckbox = canvas.getByLabelText("monday");
    const fridayCheckbox = canvas.getByLabelText("friday");

    await userEvent.click(mondayCheckbox);
    await userEvent.click(fridayCheckbox);

    expect(mondayCheckbox).toBeChecked();
    expect(fridayCheckbox).toBeChecked();
  },
};

/**
 * Checkbox group with helpful description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Feature Preferences",
    name: "features",
    description: "Select the features you'd like to enable in your account",
    property: featuresSchema,
    metadata: FieldPresets.multiChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Select the features you'd like to enable in your account"
    );

    const checkboxes = canvas.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);

    // Test toggling options
    const darkModeCheckbox = canvas.getByLabelText("dark-mode");
    const notificationsCheckbox = canvas.getByLabelText("notifications");

    await userEvent.click(darkModeCheckbox);
    expect(darkModeCheckbox).toBeChecked();

    await userEvent.click(notificationsCheckbox);
    expect(notificationsCheckbox).toBeChecked();

    // Test unchecking
    await userEvent.click(darkModeCheckbox);
    expect(darkModeCheckbox).not.toBeChecked();
    expect(notificationsCheckbox).toBeChecked(); // Should remain checked
  },
};

/**
 * Checkbox group with limited selections
 */
export const LimitedSelections: Story = {
  args: createStoryArgs({
    label: "Interests",
    name: "interests",
    property: interestsSchema,
    metadata: FieldPresets.multiChoice,
    description: "Select up to 3 interests (max: 3)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(canvas, "Select up to 3 interests (max: 3)");

    const checkboxes = canvas.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(7);

    // Test selecting multiple options
    const sportsCheckbox = canvas.getByLabelText("sports");
    const musicCheckbox = canvas.getByLabelText("music");
    const readingCheckbox = canvas.getByLabelText("reading");
    const travelCheckbox = canvas.getByLabelText("travel");

    await userEvent.click(sportsCheckbox);
    await userEvent.click(musicCheckbox);
    await userEvent.click(readingCheckbox);

    expect(sportsCheckbox).toBeChecked();
    expect(musicCheckbox).toBeChecked();
    expect(readingCheckbox).toBeChecked();

    // Test selecting a 4th option (should still work in UI, validation would be on form level)
    await userEvent.click(travelCheckbox);
    expect(travelCheckbox).toBeChecked();
  },
};

/**
 * Checkbox group select all/none functionality
 */
export const SelectAllBehavior: Story = {
  args: createStoryArgs({
    label: "Select All Test",
    name: "selectAllTest",
    property: featuresSchema,
    metadata: FieldPresets.multiChoice,
    description: "Test selecting and unselecting all options",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkboxes = canvas.getAllByRole("checkbox");

    // Initially all should be unchecked
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });

    // Select all checkboxes
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox);
    }

    // All should now be checked
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    // Unselect all checkboxes
    for (const checkbox of checkboxes) {
      await userEvent.click(checkbox);
    }

    // All should be unchecked again
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  },
};

/**
 * Two-option checkbox group (like a multi-select yes/no)
 */
export const BinaryOptions: Story = {
  args: createStoryArgs({
    label: "Communication Preferences",
    name: "communication",
    property: {
      type: "string",
      enum: ["email", "sms"],
    },
    metadata: FieldPresets.multiChoice,
    description: "How would you like us to contact you?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkboxes = canvas.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    const emailCheckbox = canvas.getByLabelText("email");
    const smsCheckbox = canvas.getByLabelText("sms");

    // Test that both can be selected independently
    await userEvent.click(emailCheckbox);
    expect(emailCheckbox).toBeChecked();
    expect(smsCheckbox).not.toBeChecked();

    await userEvent.click(smsCheckbox);
    expect(emailCheckbox).toBeChecked();
    expect(smsCheckbox).toBeChecked();

    // Test that both can be unselected
    await userEvent.click(emailCheckbox);
    expect(emailCheckbox).not.toBeChecked();
    expect(smsCheckbox).toBeChecked();
  },
};

/**
 * Checkbox group accessibility test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessibility Test",
    name: "accessibilityTest",
    property: skillsSchema,
    metadata: FieldPresets.multiChoice,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkboxes = canvas.getAllByRole("checkbox");

    // Test keyboard navigation
    const firstCheckbox = checkboxes[0];
    firstCheckbox.focus();
    expect(firstCheckbox).toHaveFocus();

    // Test that each checkbox has proper attributes
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("id");
      expect(checkbox).toHaveAttribute("name", "accessibilityTest");
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    // Test label association
    const labels = checkboxes.map((checkbox) =>
      canvas.getByLabelText((checkbox as HTMLInputElement).value)
    );
    expect(labels).toHaveLength(6);

    // Test space key to toggle (keyboard interaction)
    const secondCheckbox = checkboxes[1];
    secondCheckbox.focus();

    // Simulate spacebar press (userEvent doesn't support it well for checkboxes)
    expect(secondCheckbox).not.toBeChecked();
    await userEvent.click(secondCheckbox); // Click as proxy for space
    expect(secondCheckbox).toBeChecked();
  },
};
