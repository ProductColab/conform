import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import { TextField } from "./TextField";
import {
  createFieldMeta,
  createStoryArgs,
  mockSchemas,
  withFormProvider,
  fieldAssertions,
  fieldInteractions,
  playFunctions,
  getFormInput,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";
import { extractMetadata } from "@/utils";

const meta: Meta<typeof TextField> = {
  ...createFieldMeta("text/TextField", TextField),
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic string field with minimal configuration
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Full Name",
    name: "fullName",
  }),
  play: playFunctions.basicField("Full Name", "John Doe"),
};

/**
 * Required field with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Email Address",
    name: "email",
    required: true,
    property: FieldPresets.email,
    metadata: extractMetadata(FieldPresets.email),
  }),
  play: playFunctions.requiredField(
    "Email Address",
    "test@example.com",
    "email"
  ),
};

/**
 * Field with helpful description text
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Username",
    name: "username",
    description: "Choose a unique username between 3-20 characters",
    property: {
      type: "string",
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_]+$",
    },
  }),
  play: playFunctions.fieldWithDescription(
    "Username",
    "Choose a unique username between 3-20 characters",
    "test_user123"
  ),
};

/**
 * Currency field with prefix
 */
export const WithPrefix: Story = {
  args: createStoryArgs({
    label: "Price",
    name: "price",
    property: FieldPresets.currency,
    metadata: extractMetadata(FieldPresets.currency),
  }),
  play: playFunctions.fieldWithPrefix("Price", "$", "99.99"),
};

/**
 * Field with suffix indicator
 */
export const WithSuffix: Story = {
  args: createStoryArgs({
    label: "Completion Rate",
    name: "completionRate",
    property: FieldPresets.percentage,
    metadata: extractMetadata(FieldPresets.percentage),
  }),
  play: playFunctions.fieldWithSuffix("Completion Rate", "%", "85.5"),
};

/**
 * Field with both prefix and suffix
 */
export const WithPrefixAndSuffix: Story = {
  args: createStoryArgs({
    label: "Budget Range",
    name: "budget",
    metadata: {
      prefix: "$",
      suffix: "USD",
      placeholder: "1000",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test both prefix and suffix
    fieldAssertions.hasPrefix(canvas, "$");
    fieldAssertions.hasSuffix(canvas, "USD");

    const input = getFormInput(canvas, "Budget Range");
    fieldAssertions.hasCorrectPadding(input, true, true);
    fieldAssertions.hasPlaceholder(input, "1000");

    await fieldInteractions.typeAndVerify(input, "2500");
  },
};

/**
 * Password field with secure input
 */
export const Password: Story = {
  args: createStoryArgs({
    label: "Password",
    name: "password",
    required: true,
    property: FieldPresets.password,
    metadata: extractMetadata(FieldPresets.password),
    description: "Must be at least 8 characters long",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Must be at least 8 characters long"
    );
    const input = fieldAssertions.hasInputType(
      canvas,
      "Password",
      "password",
      true
    );

    await fieldInteractions.typeAndVerify(input, "secretpassword123");
  },
};

/**
 * Secret token field for API keys
 */
export const SecretToken: Story = {
  args: createStoryArgs({
    label: "API Secret",
    name: "apiSecret",
    property: mockSchemas.string,
    metadata: {
      inputType: "password",
      placeholder: "sk-1234567890abcdef",
    },
    description: "Your private API secret key",
  }),
  play: playFunctions.fieldWithDescription(
    "API Secret",
    "Your private API secret key",
    "sk-1234567890abcdef"
  ),
};

/**
 * Email field with validation
 */
export const Email: Story = {
  args: createStoryArgs({
    label: "Email Address",
    name: "email",
    required: true,
    property: FieldPresets.email,
    metadata: extractMetadata(FieldPresets.email),
  }),
  play: playFunctions.inputTypeTest(
    "Email Address",
    "email",
    "user@example.com"
  ),
};

/**
 * Phone number field
 */
export const Phone: Story = {
  args: createStoryArgs({
    label: "Phone Number",
    name: "phone",
    property: FieldPresets.phone,
    metadata: extractMetadata(FieldPresets.phone),
  }),
  play: playFunctions.inputTypeTest("Phone Number", "tel", "+1 (555) 123-4567"),
};

/**
 * URL field for website links
 */
export const URL: Story = {
  args: createStoryArgs({
    label: "Website URL",
    name: "website",
    property: FieldPresets.url,
    metadata: extractMetadata(FieldPresets.url),
    description: "Enter your company website",
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(canvas, "Enter your company website");
    const input = fieldAssertions.hasInputType(canvas, "Website URL", "url");
    fieldAssertions.hasPlaceholder(input, "https://example.com");

    await fieldInteractions.typeAndVerify(input, "https://mycompany.com");
  },
};

/**
 * Search field variant
 */
export const Search: Story = {
  args: createStoryArgs({
    label: "Search",
    name: "search",
    metadata: {
      inputType: "search",
      placeholder: "Search for products...",
    },
  }),
  play: playFunctions.inputTypeTest("Search", "search", "laptop computers"),
};

/**
 * Field with custom placeholder
 */
export const CustomPlaceholder: Story = {
  args: createStoryArgs({
    label: "Company Name",
    name: "company",
    metadata: {
      placeholder: "e.g. Acme Corporation",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getFormInput(canvas, "Company Name");

    fieldAssertions.hasPlaceholder(input, "e.g. Acme Corporation");
    await fieldInteractions.typeAndVerify(input, "TechCorp Inc.");
  },
};

/**
 * Field with length constraints
 */
export const WithLengthConstraints: Story = {
  args: createStoryArgs({
    label: "Bio",
    name: "bio",
    description: "Tell us about yourself (max 100 characters)",
    property: {
      type: "string",
      maxLength: 100,
    },
    metadata: {
      placeholder: "Write a short bio...",
    },
  }),
  play: playFunctions.fieldWithDescription(
    "Bio",
    "Tell us about yourself (max 100 characters)",
    "I'm a passionate developer who loves creating amazing user experiences."
  ),
};

/**
 * Field with pattern validation
 */
export const WithPatternValidation: Story = {
  args: createStoryArgs({
    label: "Product Code",
    name: "productCode",
    description: "Format: ABC-123 (3 letters, dash, 3 numbers)",
    property: {
      type: "string",
      pattern: "^[A-Z]{3}-[0-9]{3}$",
    },
    metadata: {
      placeholder: "ABC-123",
    },
  }),
  play: playFunctions.fieldWithDescription(
    "Product Code",
    "Format: ABC-123 (3 letters, dash, 3 numbers)",
    "XYZ-789"
  ),
};

/**
 * Disabled field state
 */
export const Disabled: Story = {
  args: createStoryArgs({
    label: "Account ID",
    name: "accountId",
    property: mockSchemas.string,
    metadata: {
      placeholder: "Auto-generated",
    },
  }),
  decorators: [
    withFormProvider({
      accountId: "ACC-12345",
    }),
  ],
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <TextField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getFormInput(canvas, "Account ID");

    fieldAssertions.hasPlaceholder(input, "Auto-generated");
    expect(input).toHaveValue("ACC-12345");
  },
};

/**
 * Interactive example showing all variants
 */
export const Playground: Story = {
  args: createStoryArgs({
    label: "Playground Field",
    name: "playground",
    description: "Use the controls below to customize this field",
  }),
  play: playFunctions.basicField("Playground Field", "Interactive test"),
};

/**
 * Complete interaction testing
 */
export const InteractionTesting: Story = {
  args: createStoryArgs({
    label: "Focus Test Field",
    name: "focusTest",
    metadata: {
      placeholder: "Click to focus me!",
    },
  }),
  play: playFunctions.fullInteractionTest(
    "Focus Test Field",
    "Testing interaction",
    "Click to focus me!"
  ),
};

/**
 * Accessibility testing
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessible Field",
    name: "accessible",
    required: true,
    description: "This field has proper accessibility attributes",
  }),
  play: playFunctions.accessibilityTest("Accessible Field", true),
};

/**
 * All input types showcase
 */
export const AllInputTypes: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <TextField
        {...createStoryArgs({
          label: "Text Input",
          name: "text",
          metadata: { inputType: "text", placeholder: "Text input" },
        })}
      />
      <TextField
        {...createStoryArgs({
          label: "Email Input",
          name: "email",
          property: FieldPresets.email,
          metadata: extractMetadata(FieldPresets.email),
        })}
      />
      <TextField
        {...createStoryArgs({
          label: "Password Input",
          name: "password",
          property: FieldPresets.password,
          metadata: extractMetadata(FieldPresets.password),
        })}
      />
      <TextField
        {...createStoryArgs({
          label: "URL Input",
          name: "url",
          property: FieldPresets.url,
          metadata: extractMetadata(FieldPresets.url),
        })}
      />
      <TextField
        {...createStoryArgs({
          label: "Phone Input",
          name: "phone",
          property: FieldPresets.phone,
          metadata: extractMetadata(FieldPresets.phone),
        })}
      />
      <TextField
        {...createStoryArgs({
          label: "Search Input",
          name: "search",
          metadata: { inputType: "search", placeholder: "Search..." },
        })}
      />
    </div>
  ),
  decorators: [withFormProvider()],
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of all available input types for the StringField component.",
      },
    },
  },
};
