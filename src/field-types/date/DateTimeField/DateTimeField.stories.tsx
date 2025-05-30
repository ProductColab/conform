import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { DateTimeField } from "./DateTimeField";
import {
  createFieldMeta,
  createStoryArgs,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof DateTimeField> = {
  ...createFieldMeta("date/DateTimeField", DateTimeField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema for datetime constraints",
    },
    metadata: {
      control: { type: "object" },
      description: "DateTime field metadata with inputType: 'datetime-local'",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common schemas for datetime field stories
const basicDateTimeSchema = {
  type: "string",
  format: "date-time",
} as const;

const appointmentSchema = {
  type: "string",
  format: "date-time",
} as const;

const eventSchema = {
  type: "string",
  format: "date-time",
} as const;

const meetingSchema = {
  type: "string",
  format: "date-time",
} as const;

/**
 * Basic datetime picker field
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Event Date & Time",
    name: "eventDateTime",
    property: basicDateTimeSchema,
    metadata: FieldPresets.appointmentDateTime,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Event Date & Time", false);

    // Check that datetime input is rendered
    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toBeInTheDocument();
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test entering a datetime
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-12-25T14:30");
    expect(dateTimeInput).toHaveValue("2024-12-25T14:30");
  },
};

/**
 * Required datetime field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Appointment Date & Time",
    name: "appointmentDateTime",
    required: true,
    property: appointmentSchema,
    metadata: FieldPresets.appointmentDateTime,
    description: "Please select your appointment date and time",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Appointment Date & Time", true);
    fieldAssertions.hasDescription(
      canvas,
      "Please select your appointment date and time"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test entering an appointment datetime
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-06-15T09:00");
    expect(dateTimeInput).toHaveValue("2024-06-15T09:00");
  },
};

/**
 * DateTime field with helpful description
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Meeting Schedule",
    name: "meetingTime",
    description: "Select the date and time for the team meeting",
    property: meetingSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "Choose date and time",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Select the date and time for the team meeting"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test selecting a meeting time
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-07-20T10:30");
    expect(dateTimeInput).toHaveValue("2024-07-20T10:30");
  },
};

/**
 * DateTime field for scheduling (business hours)
 */
export const BusinessHours: Story = {
  args: createStoryArgs({
    label: "Business Meeting",
    name: "businessMeeting",
    property: appointmentSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "Select business hours",
    },
    description: "Schedule during business hours (9 AM - 5 PM)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Schedule during business hours (9 AM - 5 PM)"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test entering a business hour time
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-08-12T14:00");
    expect(dateTimeInput).toHaveValue("2024-08-12T14:00");
  },
};

/**
 * DateTime field for event scheduling
 */
export const EventScheduling: Story = {
  args: createStoryArgs({
    label: "Event Start Time",
    name: "eventStart",
    required: true,
    property: eventSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "When does the event start?",
    },
    description: "Set the exact start date and time for your event",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Event Start Time", true);
    fieldAssertions.hasDescription(
      canvas,
      "Set the exact start date and time for your event"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test entering event start time
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-09-01T19:00");
    expect(dateTimeInput).toHaveValue("2024-09-01T19:00");
  },
};

/**
 * DateTime field with custom placeholder
 */
export const WithPlaceholder: Story = {
  args: createStoryArgs({
    label: "Deadline",
    name: "deadline",
    property: basicDateTimeSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "When is this due?",
    },
    description: "Set the deadline with specific time",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test datetime input functionality
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-10-31T23:59");
    expect(dateTimeInput).toHaveValue("2024-10-31T23:59");
  },
};

/**
 * DateTime field for delivery scheduling
 */
export const DeliveryScheduling: Story = {
  args: createStoryArgs({
    label: "Delivery Time",
    name: "deliveryTime",
    required: true,
    property: appointmentSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "Select delivery window",
    },
    description: "Choose your preferred delivery date and time",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Choose your preferred delivery date and time"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test delivery scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, tomorrowStr);
    expect(dateTimeInput).toHaveValue(tomorrowStr);
  },
};

/**
 * DateTime field for conference calls
 */
export const ConferenceCall: Story = {
  args: createStoryArgs({
    label: "Conference Call Time",
    name: "callTime",
    property: meetingSchema,
    metadata: {
      inputType: "datetime-local",
      placeholder: "Schedule conference call",
    },
    description: "Schedule across time zones (times shown in local timezone)",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Schedule across time zones (times shown in local timezone)"
    );

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");

    // Test conference call scheduling
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-11-15T16:00");
    expect(dateTimeInput).toHaveValue("2024-11-15T16:00");
  },
};

/**
 * DateTime field accessibility test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessibility Test",
    name: "accessibilityTest",
    property: basicDateTimeSchema,
    metadata: {
      inputType: "datetime-local",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dateTimeInput =
      canvas.getByDisplayValue("") || canvas.getByRole("textbox");

    // Test that the input has proper attributes
    expect(dateTimeInput).toHaveAttribute("type", "datetime-local");
    expect(dateTimeInput).toHaveAttribute("id");
    expect(dateTimeInput).toHaveAttribute("name", "accessibilityTest");

    // Test keyboard navigation
    dateTimeInput.focus();
    expect(dateTimeInput).toHaveFocus();

    // Test that the input is properly labeled
    const label = canvas.getByText("Accessibility Test");
    expect(label).toBeInTheDocument();

    // Test datetime input with keyboard
    await userEvent.clear(dateTimeInput);
    await userEvent.type(dateTimeInput, "2024-03-15T12:30");
    expect(dateTimeInput).toHaveValue("2024-03-15T12:30");
  },
};
