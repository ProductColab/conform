import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { SwitchField } from "./SwitchField";
import {
  createFieldMeta,
  withFormProvider,
  fieldAssertions,
} from "@/lib/storybook-utils";

const meta: Meta<typeof SwitchField> = {
  ...createFieldMeta("boolean/SwitchField", SwitchField),
  argTypes: {
    name: {
      control: { type: "text" },
      description: "Field name for form submission",
    },
    required: {
      control: { type: "boolean" },
      description: "Whether the field is required",
    },
    label: {
      control: { type: "text" },
      description: "Field label",
    },
    description: {
      control: { type: "text" },
      description: "Field description/help text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic switch field with default settings
 */
export const Default: Story = {
  args: {
    name: "enableNotifications",
    required: false,
    label: "Enable Notifications",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for field label
    fieldAssertions.hasLabel(canvas, "Enable Notifications", false);

    // Check for switch element
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  },
};

/**
 * Required switch field
 */
export const Required: Story = {
  args: {
    name: "agreeToTerms",
    required: true,
    label: "I agree to the Terms and Conditions",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required indicator - label and asterisk are in same element for SwitchField
    const labelElement = canvas.getByText(
      /I agree to the Terms and Conditions \*/
    );
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for switch element
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  },
};

/**
 * Switch field with description
 */
export const WithDescription: Story = {
  args: {
    name: "emailMarketing",
    required: false,
    label: "Email Marketing",
    description: "Receive promotional emails and product updates",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Email Marketing", false);
    fieldAssertions.hasDescription(
      canvas,
      "Receive promotional emails and product updates"
    );

    // Check for switch element
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  },
};

/**
 * Switch field pre-checked with default values
 */
export const DefaultChecked: Story = {
  args: {
    name: "darkMode",
    required: false,
    label: "Dark Mode",
    description: "Enable dark theme for better viewing in low light",
  },
  decorators: [
    withFormProvider({
      darkMode: true, // Pre-check the switch
    }),
  ],
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Switch should be checked by default
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();

    fieldAssertions.hasLabel(canvas, "Dark Mode", false);
    fieldAssertions.hasDescription(
      canvas,
      "Enable dark theme for better viewing in low light"
    );
  },
};

/**
 * Interactive switch testing
 */
export const InteractiveTesting: Story = {
  args: {
    name: "testSwitch",
    required: false,
    label: "Interactive Test Switch",
    description: "Click to toggle this switch",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();

    // Click to toggle the switch
    await userEvent.click(switchElement);

    // Should now be checked
    expect(switchElement).toBeChecked();

    // Click again to toggle back
    await userEvent.click(switchElement);

    // Should be unchecked again
    expect(switchElement).not.toBeChecked();
  },
};

/**
 * Privacy settings example
 */
export const PrivacySettings: Story = {
  args: {
    name: "profileVisibility",
    required: false,
    label: "Public Profile",
    description: "Make your profile visible to other users",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasLabel(canvas, "Public Profile", false);
    fieldAssertions.hasDescription(
      canvas,
      "Make your profile visible to other users"
    );

    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
  },
};

/**
 * Required terms agreement
 */
export const TermsAgreement: Story = {
  args: {
    name: "termsAccepted",
    required: true,
    label: "I accept the Terms of Service",
    description: "You must agree to continue",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Complete Registration</h3>
        <SwitchField {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required indicator
    const labelElement = canvas.getByText(/I accept the Terms of Service \*/);
    expect(labelElement).toBeInTheDocument();

    fieldAssertions.hasDescription(canvas, "You must agree to continue");

    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: {
    name: "accessibleSwitch",
    required: true,
    label: "Accessible Switch Example",
    description:
      "This switch is properly labeled and accessible to screen readers",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check accessibility attributes
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute("type", "button");

    // Check proper labeling
    const labelElement = canvas.getByText(/Accessible Switch Example \*/);
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Description should be present
    fieldAssertions.hasDescription(
      canvas,
      "This switch is properly labeled and accessible to screen readers"
    );

    // Switch should be keyboard accessible
    switchElement.focus();
    expect(switchElement).toHaveFocus();
  },
};

/**
 * Multiple switches showcase
 */
export const MultipleSettings: Story = {
  render: () => (
    <div className="p-4 max-w-lg space-y-4">
      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>

      <SwitchField
        name="emailNotifications"
        required={false}
        label="Email Notifications"
        description="Receive notifications via email"
      />

      <SwitchField
        name="pushNotifications"
        required={false}
        label="Push Notifications"
        description="Receive push notifications on your device"
      />

      <SwitchField
        name="smsNotifications"
        required={false}
        label="SMS Notifications"
        description="Receive notifications via text message"
      />

      <SwitchField
        name="marketingEmails"
        required={false}
        label="Marketing Emails"
        description="Receive promotional content and offers"
      />
    </div>
  ),
  decorators: [
    withFormProvider({
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      marketingEmails: true,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that all switches are present
    const switches = canvas.getAllByRole("switch");
    expect(switches).toHaveLength(4);

    // Check pre-selected states
    expect(switches[0]).toBeChecked(); // email
    expect(switches[1]).not.toBeChecked(); // push
    expect(switches[2]).not.toBeChecked(); // sms
    expect(switches[3]).toBeChecked(); // marketing
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example showing multiple switch fields for notification settings.",
      },
    },
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Switch</h3>
        <SwitchField
          name="basicSwitch"
          required={false}
          label="Simple Toggle"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Required Switch</h3>
        <SwitchField
          name="requiredSwitch"
          required={true}
          label="Must Accept Terms"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Switch with Description</h3>
        <SwitchField
          name="describedSwitch"
          required={false}
          label="Feature Toggle"
          description="Enable this feature to unlock additional functionality"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Pre-checked Switch</h3>
        <SwitchField
          name="precheckedSwitch"
          required={false}
          label="Default Enabled"
          description="This feature is enabled by default"
        />
      </div>
    </div>
  ),
  decorators: [
    withFormProvider({
      precheckedSwitch: true,
    }),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of different SwitchField configurations and use cases.",
      },
    },
  },
};

/**
 * Playground for testing custom configurations
 */
export const Playground: Story = {
  args: {
    name: "playgroundSwitch",
    required: false,
    label: "Playground Switch",
    description: "Use the controls below to customize this switch field",
  },
  render: (args) => (
    <div className="p-4 max-w-md">
      <SwitchField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeInTheDocument();

    fieldAssertions.hasLabel(canvas, "Playground Switch", false);
    fieldAssertions.hasDescription(
      canvas,
      "Use the controls below to customize this switch field"
    );

    // Test interaction
    await userEvent.click(switchElement);
    expect(switchElement).toBeChecked();
  },
};
