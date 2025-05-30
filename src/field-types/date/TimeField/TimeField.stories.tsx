import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "@storybook/test";
import { TimeField } from "./TimeField";
import {
  createFieldMeta,
  createStoryArgs,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof TimeField> = {
  ...createFieldMeta("date/TimeField", TimeField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema for time constraints",
    },
    metadata: {
      control: { type: "object" },
      description: "Time field metadata with inputType: 'time'",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for time field stories
const basicTimeSchema = {
  type: "string",
  format: "time",
} as const;

const workingHoursSchema = {
  type: "string",
  format: "time",
} as const;

const appointmentTimeSchema = {
  type: "string",
  format: "time",
} as const;

const reminderTimeSchema = {
  type: "string",
  format: "time",
} as const;

/**
 * Basic time picker field
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Meeting Time",
    name: "meetingTime",
    property: basicTimeSchema,
    metadata: FieldPresets.workingHours,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Meeting Time", false);

    // Check that time input is rendered
    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toBeInTheDocument();
    expect(timeInput).toHaveAttribute("type", "time");

    // Test entering a time
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "14:30");
    expect(timeInput).toHaveValue("14:30");
  },
};

/**
 * Required time field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Work Start Time",
    name: "workStartTime",
    required: true,
    property: workingHoursSchema,
    metadata: FieldPresets.workingHours,
    description: "What time do you start work?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Work Start Time", true);
    fieldAssertions.hasDescription(canvas, "What time do you start work?");

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test entering a work start time
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "09:00");
    expect(timeInput).toHaveValue("09:00");
  },
};

/**
 * Time field with helpful description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Lunch Break",
    name: "lunchTime",
    description: "When do you usually take your lunch break?",
    property: basicTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "12:00",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "When do you usually take your lunch break?"
    );

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test selecting lunch time
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "12:30");
    expect(timeInput).toHaveValue("12:30");
  },
};

/**
 * Time field for business hours
 */
export const BusinessHours: Story = {
  args: createStoryArgs({
    label: "Office Hours Start",
    name: "officeStart",
    property: workingHoursSchema,
    metadata: {
      inputType: "time",
      placeholder: "9:00 AM",
    },
    description: "Standard business hours (9 AM - 5 PM)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Standard business hours (9 AM - 5 PM)"
    );

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test entering business hours
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "09:00");
    expect(timeInput).toHaveValue("09:00");
  },
};

/**
 * Time field for appointment scheduling
 */
export const AppointmentTime: Story = {
  args: createStoryArgs({
    label: "Appointment Time",
    name: "appointmentTime",
    required: true,
    property: appointmentTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "Select time slot",
    },
    description: "Choose your preferred appointment time",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Appointment Time", true);
    fieldAssertions.hasDescription(
      canvas,
      "Choose your preferred appointment time"
    );

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test scheduling appointment
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "15:45");
    expect(timeInput).toHaveValue("15:45");
  },
};

/**
 * Time field with custom placeholder
 */
export const WithPlaceholder: Story = {
  args: createStoryArgs({
    label: "Reminder Time",
    name: "reminderTime",
    property: reminderTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "Set reminder",
    },
    description: "What time should we remind you?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test time input functionality
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "08:15");
    expect(timeInput).toHaveValue("08:15");
  },
};

/**
 * Time field for daily routines
 */
export const DailyRoutine: Story = {
  args: createStoryArgs({
    label: "Exercise Time",
    name: "exerciseTime",
    property: basicTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "When do you exercise?",
    },
    description: "Set your daily exercise time",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(canvas, "Set your daily exercise time");

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test setting exercise time
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "06:30");
    expect(timeInput).toHaveValue("06:30");
  },
};

/**
 * Time field for event schedules
 */
export const EventSchedule: Story = {
  args: createStoryArgs({
    label: "Event Start Time",
    name: "eventStartTime",
    required: true,
    property: basicTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "Event start",
    },
    description: "When does the event start? (24-hour format)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "When does the event start? (24-hour format)"
    );

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test event scheduling
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "19:30");
    expect(timeInput).toHaveValue("19:30");
  },
};

/**
 * Time field for shifts and schedules
 */
export const ShiftSchedule: Story = {
  args: createStoryArgs({
    label: "Shift End Time",
    name: "shiftEnd",
    property: workingHoursSchema,
    metadata: {
      inputType: "time",
      placeholder: "End of shift",
    },
    description: "When does your shift end?",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(canvas, "When does your shift end?");

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test shift scheduling
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "17:00");
    expect(timeInput).toHaveValue("17:00");
  },
};

/**
 * Time field for precise timing
 */
export const PreciseTime: Story = {
  args: createStoryArgs({
    label: "Medication Time",
    name: "medicationTime",
    required: true,
    property: reminderTimeSchema,
    metadata: {
      inputType: "time",
      placeholder: "Take medication",
    },
    description: "Exact time for taking medication (important for consistency)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Medication Time", true);
    fieldAssertions.hasDescription(
      canvas,
      "Exact time for taking medication (important for consistency)"
    );

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(timeInput).toHaveAttribute("type", "time");

    // Test precise medication timing
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "08:00");
    expect(timeInput).toHaveValue("08:00");
  },
};

/**
 * Time field accessibility test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessibility Test",
    name: "accessibilityTest",
    property: basicTimeSchema,
    metadata: {
      inputType: "time",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const timeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");

    // Test that the input has proper attributes
    expect(timeInput).toHaveAttribute("type", "time");
    expect(timeInput).toHaveAttribute("id");
    expect(timeInput).toHaveAttribute("name", "accessibilityTest");

    // Test keyboard navigation
    timeInput.focus();
    expect(timeInput).toHaveFocus();

    // Test that the input is properly labeled
    const label = canvas.getByText("Accessibility Test");
    expect(label).toBeInTheDocument();

    // Test time input with keyboard
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "13:45");
    expect(timeInput).toHaveValue("13:45");
  },
};
