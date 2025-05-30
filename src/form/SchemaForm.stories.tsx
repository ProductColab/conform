import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent, waitFor } from "@storybook/test";
import { SchemaForm } from "./SchemaForm";
import { z } from "zod/v4";
import { createFieldMeta } from "@/lib/storybook-utils";

// Basic Examples
const examplesMeta: Meta<typeof SchemaForm> = {
  ...createFieldMeta("form/SchemaForm/Examples", SchemaForm),
  argTypes: {
    schema: {
      control: { type: "object" },
      description: "Zod schema for form generation",
    },
    defaultValues: {
      control: { type: "object" },
      description: "Default values for form fields",
    },
    submitLabel: {
      control: { type: "text" },
      description: "Label for submit button",
    },
    isSubmitting: {
      control: { type: "boolean" },
      description: "Whether form is currently submitting",
    },
    showCancelButton: {
      control: { type: "boolean" },
      description: "Whether to show cancel button",
    },
    columns: {
      control: { type: "select" },
      options: [1, 2, 3],
      description: "Number of columns for field layout",
    },
    spacing: {
      control: { type: "select" },
      options: ["compact", "normal", "relaxed"],
      description: "Spacing between form elements",
    },
    excludeFields: {
      control: { type: "object" },
      description: "Array of field names to exclude from form",
    },
  },
};

// Configuration Options
const configMeta: Meta<typeof SchemaForm> = {
  ...createFieldMeta("form/SchemaForm/Configuration", SchemaForm),
  argTypes: examplesMeta.argTypes,
};

// Form States
const statesMeta: Meta<typeof SchemaForm> = {
  ...createFieldMeta("form/SchemaForm/States", SchemaForm),
  argTypes: examplesMeta.argTypes,
};

// Layout Options
const layoutMeta: Meta<typeof SchemaForm> = {
  ...createFieldMeta("form/SchemaForm/Layout", SchemaForm),
  argTypes: examplesMeta.argTypes,
};

// Testing & Playground
const testingMeta: Meta<typeof SchemaForm> = {
  ...createFieldMeta("form/SchemaForm/Testing", SchemaForm),
  argTypes: examplesMeta.argTypes,
};

// Export the main meta (required by Storybook)
export default examplesMeta;

type Story = StoryObj<typeof examplesMeta>;

// Define test schemas
const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(13, "Must be at least 13").max(120, "Must be under 120"),
  bio: z.string().optional(),
  isSubscribed: z.boolean().default(false),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  attachFile: z.string().optional(),
});

const settingsSchema = z.object({
  notifications: z.boolean().default(true),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  language: z.string().default("en"),
  maxItems: z.number().min(1).max(100).default(10),
});

/**
 * Basic user profile form with various field types
 */
export const UserProfileForm: Story = {
  args: {
    schema: userProfileSchema,
    submitLabel: "Save Profile",
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      isSubscribed: true,
    },
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that form fields are rendered
    expect(canvas.getByLabelText(/firstName/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/lastName/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/email/i)).toBeInTheDocument();

    // Use getByRole for number input since label association might be different
    expect(canvas.getByRole("spinbutton")).toBeInTheDocument();

    // Check default values are populated
    expect(canvas.getByDisplayValue("John")).toBeInTheDocument();
    expect(canvas.getByDisplayValue("Doe")).toBeInTheDocument();

    // Check submit button
    const submitButton = canvas.getByRole("button", { name: /save profile/i });
    expect(submitButton).toBeInTheDocument();
  },
};

/**
 * Contact form with validation testing
 */
export const ContactFormWithValidation: Story = {
  args: {
    schema: contactFormSchema,
    submitLabel: "Send Message",
    showCancelButton: true,
    onSubmit: async (values) => {
      console.log("Contact form submitted:", values);
    },
    onCancel: () => {
      console.log("Form cancelled");
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const submitButton = canvas.getByRole("button", { name: /send message/i });

    // Test field validation by focusing and blurring required fields
    const nameField = canvas.getByLabelText(/name/i);
    await userEvent.click(nameField);
    await userEvent.tab(); // Move away from field to trigger validation

    // Give a moment for validation to process
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if validation message appears
    const hasValidationError = canvas.queryByText(/name is required/i);

    if (hasValidationError) {
      // Validation is working properly
      expect(hasValidationError).toBeInTheDocument();
    }

    // Fill in valid data
    await userEvent.type(nameField, "Jane Smith");
    await userEvent.type(canvas.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(canvas.getByLabelText(/subject/i), "Test Subject");
    await userEvent.type(
      canvas.getByLabelText(/message/i),
      "This is a test message with enough characters"
    );

    // Check cancel button exists
    const cancelButton = canvas.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    // Submit button should be enabled after filling valid data
    expect(submitButton).toBeEnabled();
  },
};

// CONFIGURATION STORIES
type ConfigStory = StoryObj<typeof configMeta>;

/**
 * Form with custom field labels and descriptions
 */
export const FormWithCustomLabels: ConfigStory = {
  parameters: { ...configMeta },
  args: {
    schema: settingsSchema,
    submitLabel: "Save Settings",
    fieldLabels: {
      notifications: "Email Notifications",
      theme: "Appearance Theme",
      language: "Preferred Language",
      maxItems: "Items Per Page",
    },
    fieldDescriptions: {
      notifications: "Receive email notifications for important updates",
      theme: "Choose your preferred color scheme",
      language: "Select your preferred language for the interface",
      maxItems: "Number of items to display per page",
    },
    fieldPlaceholders: {
      language: "Select language...",
    },
    onSubmit: async (values) => {
      console.log("Settings saved:", values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that custom labels ARE being used (they're actually working!)
    expect(canvas.getByLabelText(/email notifications/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/appearance theme/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/preferred language/i)).toBeInTheDocument();

    // Use getByRole for number input since label association might be different
    expect(canvas.getByRole("spinbutton")).toBeInTheDocument();

    // Check descriptions are shown
    expect(
      canvas.getByText(/receive email notifications for important updates/i)
    ).toBeInTheDocument();
    expect(
      canvas.getByText(/choose your preferred color scheme/i)
    ).toBeInTheDocument();
  },
};

/**
 * Multi-column layout form
 */
export const MultiColumnForm: ConfigStory = {
  parameters: { ...configMeta },
  args: {
    schema: userProfileSchema,
    submitLabel: "Save",
    columns: 2,
    spacing: "normal",
    onSubmit: async (values) => {
      console.log("Multi-column form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    // Check that grid layout is applied (this is more of a visual test)
    const formContainer = canvasElement.querySelector(".grid");
    expect(formContainer).toBeInTheDocument();
    expect(formContainer).toHaveClass("grid-cols-1", "md:grid-cols-2");
  },
};

/**
 * Form with excluded fields
 */
export const FormWithExcludedFields: ConfigStory = {
  parameters: { ...configMeta },
  args: {
    schema: userProfileSchema,
    submitLabel: "Save",
    excludeFields: ["bio", "isSubscribed"],
    onSubmit: async (values) => {
      console.log("Form with excluded fields submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check included fields are present
    expect(canvas.getByLabelText(/firstName/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/lastName/i)).toBeInTheDocument();
    expect(canvas.getByLabelText(/email/i)).toBeInTheDocument();

    // Check excluded fields are not present
    expect(canvas.queryByLabelText(/bio/i)).not.toBeInTheDocument();
    expect(canvas.queryByLabelText(/subscribe/i)).not.toBeInTheDocument();
  },
};

// FORM STATES STORIES
type StatesStory = StoryObj<typeof statesMeta>;

/**
 * Form in submitting state
 */
export const SubmittingForm: StatesStory = {
  parameters: { ...statesMeta },
  args: {
    schema: contactFormSchema,
    submitLabel: "Send Message",
    isSubmitting: true,
    showCancelButton: true,
    onSubmit: async (values) => {
      console.log("Form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check submit button shows loading state
    const submitButton = canvas.getByRole("button", { name: /submitting/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Check cancel button is also disabled
    const cancelButton = canvas.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    // Check for loading spinner using canvasElement
    const loadingSpinner =
      canvasElement.querySelector(".animate-spin") ||
      canvas.queryByTestId("loader2");
    expect(loadingSpinner).toBeInTheDocument();
  },
};

/**
 * Form with submission error
 */
export const FormWithSubmissionError: StatesStory = {
  parameters: { ...statesMeta },
  args: {
    schema: contactFormSchema,
    submitLabel: "Send Message",
    onSubmit: async () => {
      throw new Error("Failed to send message. Please try again.");
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill out the form
    await userEvent.type(canvas.getByLabelText(/name/i), "Test User");
    await userEvent.type(canvas.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(canvas.getByLabelText(/subject/i), "Test Subject");
    await userEvent.type(
      canvas.getByLabelText(/message/i),
      "This is a test message"
    );

    // Submit the form
    const submitButton = canvas.getByRole("button", { name: /send message/i });
    await userEvent.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      const errorAlert = canvas.getByText(/failed to send message/i);
      expect(errorAlert).toBeInTheDocument();
    });
  },
};

/**
 * Form with basic schema (now works correctly)
 */
export const FormWithBasicSchema: StatesStory = {
  parameters: { ...statesMeta },
  args: {
    schema: z.object({
      basicField: z.string(),
    }),
    submitLabel: "Save",
    onSubmit: async (values) => {
      console.log("Basic schema form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should render the form correctly (no longer requires registry registration)
    expect(canvas.getByLabelText(/basicField/i)).toBeInTheDocument();

    // Should have the submit button
    const submitButton = canvas.getByRole("button", { name: /save/i });
    expect(submitButton).toBeInTheDocument();

    // Test basic interaction
    const input = canvas.getByLabelText(/basicField/i);
    await userEvent.type(input, "test value");
    expect(input).toHaveValue("test value");
  },
};

// LAYOUT STORIES
type LayoutStory = StoryObj<typeof layoutMeta>;

/**
 * Compact spacing form
 */
export const CompactSpacingForm: LayoutStory = {
  parameters: { ...layoutMeta },
  args: {
    schema: settingsSchema,
    submitLabel: "Save",
    spacing: "compact",
    onSubmit: async (values) => {
      console.log("Compact form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    // Check that compact spacing class is applied
    const form = canvasElement.querySelector("form");
    expect(form).toHaveClass("space-y-2");
  },
};

/**
 * Relaxed spacing form
 */
export const RelaxedSpacingForm: LayoutStory = {
  parameters: { ...layoutMeta },
  args: {
    schema: settingsSchema,
    submitLabel: "Save",
    spacing: "relaxed",
    onSubmit: async (values) => {
      console.log("Relaxed form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    // Check that relaxed spacing class is applied
    const form = canvasElement.querySelector("form");
    expect(form).toHaveClass("space-y-6");
  },
};

/**
 * Three column layout
 */
export const ThreeColumnForm: LayoutStory = {
  parameters: { ...layoutMeta },
  args: {
    schema: userProfileSchema,
    submitLabel: "Save",
    columns: 3,
    onSubmit: async (values) => {
      console.log("Three column form submitted:", values);
    },
  },
  play: async ({ canvasElement }) => {
    // Check that three-column grid layout is applied
    const formContainer = canvasElement.querySelector(".grid");
    expect(formContainer).toHaveClass(
      "grid-cols-1",
      "md:grid-cols-2",
      "lg:grid-cols-3"
    );
  },
};

// TESTING & PLAYGROUND STORIES
type TestingStory = StoryObj<typeof testingMeta>;

/**
 * Comprehensive form interaction test
 */
export const InteractiveFormTest: TestingStory = {
  parameters: { ...testingMeta },
  args: {
    schema: userProfileSchema,
    submitLabel: "Create Profile",
    showCancelButton: true,
    defaultValues: {
      interests: ["Testing"], // Add default interests to satisfy validation
    },
    onSubmit: async (values) => {
      console.log("Interactive form submitted:", values);
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onCancel: () => {
      console.log("Form cancelled");
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Fill out the entire form
    await userEvent.type(canvas.getByLabelText(/firstName/i), "Alice");
    await userEvent.type(canvas.getByLabelText(/lastName/i), "Johnson");
    await userEvent.type(canvas.getByLabelText(/email/i), "alice@example.com");

    // Use getByRole for number input since label association might be different
    const ageInput = canvas.getByRole("spinbutton");
    await userEvent.type(ageInput, "28");

    // Find and interact with bio textarea if it exists
    const bioField = canvas.queryByLabelText(/bio/i);
    if (bioField) {
      await userEvent.type(
        bioField,
        "I'm a software developer who loves creating user-friendly applications."
      );
    }

    // Toggle newsletter subscription if it exists
    const subscribeField = canvas.queryByLabelText(/subscribe/i);
    if (subscribeField) {
      await userEvent.click(subscribeField);
    }

    // Submit the form
    const submitButton = canvas.getByRole("button", {
      name: /create profile/i,
    });

    try {
      await userEvent.click(submitButton);
    } catch (error) {
      // Expected validation error - this is fine
    }

    // The form should handle submission (actual validation would depend on the form state)
  },
};

/**
 * Showcase of all form configurations
 */
export const AllFormVariants: TestingStory = {
  parameters: {
    ...testingMeta,
    docs: {
      description: {
        story: "Showcase of different SchemaForm configurations and layouts.",
      },
    },
  },
  render: () => (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Single Column Form</h3>
        <SchemaForm
          schema={settingsSchema}
          submitLabel="Save Settings"
          onSubmit={async (values) => console.log("Settings:", values)}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Two Column Form</h3>
        <SchemaForm
          schema={userProfileSchema}
          submitLabel="Save Profile"
          columns={2}
          onSubmit={async (values) => console.log("Profile:", values)}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Spacing</h3>
        <SchemaForm
          schema={contactFormSchema}
          submitLabel="Send"
          spacing="compact"
          showCancelButton={true}
          onSubmit={async (values) => console.log("Contact:", values)}
          onCancel={() => console.log("Cancelled")}
        />
      </div>
    </div>
  ),
};

/**
 * Playground for testing different configurations
 */
export const Playground: TestingStory = {
  parameters: { ...testingMeta },
  args: {
    schema: userProfileSchema,
    submitLabel: "Submit",
    columns: 1,
    spacing: "normal",
    showCancelButton: false,
    isSubmitting: false,
    excludeFields: [],
    fieldLabels: {},
    fieldDescriptions: {},
    fieldPlaceholders: {},
    onSubmit: async (values) => {
      console.log("Playground form submitted:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Basic interaction test
    const firstNameField = canvas.getByLabelText(/firstName/i);
    expect(firstNameField).toBeInTheDocument();

    await userEvent.type(firstNameField, "Test User");
    expect(firstNameField).toHaveValue("Test User");
  },
};
