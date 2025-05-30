import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { DateField } from "./DateField";
import {
  createFieldMeta,
  createStoryArgs,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof DateField> = {
  ...createFieldMeta("date/DateField", DateField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema for date constraints",
    },
    metadata: {
      control: { type: "object" },
      description: "Date field metadata with inputType: 'date'",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for date field stories
const basicDateSchema = {
  type: "string",
  format: "date",
} as const;

const birthDateSchema = {
  type: "string",
  format: "date",
} as const;

const futureEventSchema = {
  type: "string",
  format: "date",
} as const;

const recentDateSchema = {
  type: "string",
  format: "date",
} as const;

/**
 * Basic date picker field
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Event Date",
    name: "eventDate",
    property: basicDateSchema,
    metadata: FieldPresets.birthDate,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Event Date", false);

    // Check that date input is rendered
    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveAttribute("type", "date");

    // Test entering a date
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2024-12-25");
    expect(dateInput).toHaveValue("2024-12-25");
  },
};

/**
 * Required date field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Birth Date",
    name: "birthDate",
    required: true,
    property: birthDateSchema,
    metadata: FieldPresets.birthDate,
    description: "Please enter your date of birth",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Birth Date", true);
    fieldAssertions.hasDescription(canvas, "Please enter your date of birth");

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");

    // Test entering a birth date
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "1990-05-15");
    expect(dateInput).toHaveValue("1990-05-15");
  },
};

/**
 * Date field with helpful description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Project Deadline",
    name: "deadline",
    description: "Select the final deadline for this project",
    property: futureEventSchema,
    metadata: {
      inputType: "date",
      placeholder: "Choose a date",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Select the final deadline for this project"
    );

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");

    // Test selecting a future date
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-06-30");
    expect(dateInput).toHaveValue("2025-06-30");
  },
};

/**
 * Date field with minimum date constraint
 */
export const WithMinDate: Story = {
  args: createStoryArgs({
    label: "Appointment Date",
    name: "appointmentDate",
    property: futureEventSchema,
    metadata: {
      inputType: "date",
      minDate: new Date().toISOString().split("T")[0], // Today
      placeholder: "Select appointment date",
    },
    description: "Choose an appointment date (today or later)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Choose an appointment date (today or later)"
    );

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("min");

    // Test entering a future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, tomorrowStr);
    expect(dateInput).toHaveValue(tomorrowStr);
  },
};

/**
 * Date field with maximum date constraint
 */
export const WithMaxDate: Story = {
  args: createStoryArgs({
    label: "Birth Date",
    name: "birthDate",
    required: true,
    property: birthDateSchema,
    metadata: {
      inputType: "date",
      maxDate: new Date().toISOString().split("T")[0], // Today
      placeholder: "Enter birth date",
    },
    description: "Birth date must be today or earlier",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Birth date must be today or earlier"
    );

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("max");

    // Test entering a past date
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "1995-08-20");
    expect(dateInput).toHaveValue("1995-08-20");
  },
};

/**
 * Date field with both min and max constraints
 */
export const WithDateRange: Story = {
  args: createStoryArgs({
    label: "Conference Date",
    name: "conferenceDate",
    property: recentDateSchema,
    metadata: {
      inputType: "date",
      minDate: "2024-01-01",
      maxDate: "2024-12-31",
      placeholder: "Select conference date",
    },
    description: "Select a date within 2024",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(canvas, "Select a date within 2024");

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("min", "2024-01-01");
    expect(dateInput).toHaveAttribute("max", "2024-12-31");

    // Test entering a date within range
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2024-07-15");
    expect(dateInput).toHaveValue("2024-07-15");
  },
};

/**
 * Date field with custom placeholder
 */
export const WithPlaceholder: Story = {
  args: createStoryArgs({
    label: "Start Date",
    name: "startDate",
    property: basicDateSchema,
    metadata: {
      inputType: "date",
      placeholder: "When do you want to start?",
    },
    description: "Select your preferred start date",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");

    // Test date input functionality
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2024-09-01");
    expect(dateInput).toHaveValue("2024-09-01");
  },
};

/**
 * Birthday date field (historical dates)
 */
export const BirthdayField: Story = {
  args: createStoryArgs({
    label: "Date of Birth",
    name: "dateOfBirth",
    required: true,
    property: birthDateSchema,
    metadata: {
      inputType: "date",
      maxDate: new Date().toISOString().split("T")[0],
      placeholder: "MM/DD/YYYY",
    },
    description: "Enter your date of birth (must be 18 or older)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Date of Birth", true);
    fieldAssertions.hasDescription(
      canvas,
      "Enter your date of birth (must be 18 or older)"
    );

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateInput).toHaveAttribute("type", "date");

    // Test entering an adult birth date
    const adultBirthDate = new Date();
    adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 25);
    const adultDateStr = adultBirthDate.toISOString().split("T")[0];

    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, adultDateStr);
    expect(dateInput).toHaveValue(adultDateStr);
  },
};

/**
 * Date field accessibility test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessibility Test",
    name: "accessibilityTest",
    property: basicDateSchema,
    metadata: {
      inputType: "date",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dateInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");

    // Test that the input has proper attributes
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("id");
    expect(dateInput).toHaveAttribute("name", "accessibilityTest");

    // Test keyboard navigation
    dateInput.focus();
    expect(dateInput).toHaveFocus();

    // Test that the input is properly labeled
    const label = canvas.getByText("Accessibility Test");
    expect(label).toBeInTheDocument();

    // Test date input with keyboard
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2024-03-15");
    expect(dateInput).toHaveValue("2024-03-15");
  },
};
