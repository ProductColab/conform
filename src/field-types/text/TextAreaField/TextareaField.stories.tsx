import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { TextareaField } from "./TextareaField";
import {
  createFieldMeta,
  createStoryArgs,
  mockSchemas,
  withFormProvider,
  fieldAssertions,
  fieldInteractions,
  playFunctions,
} from "@/lib/storybook-utils";
import { FieldPresets } from "@/utils/field-presets";

const meta: Meta<typeof TextareaField> = {
  ...createFieldMeta("text/TextareaField", TextareaField),
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic textarea field with default configuration
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Comments",
    name: "comments",
    property: mockSchemas.string,
    metadata: {
      rows: 4,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /comments/i });

    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4"); // default rows

    await fieldInteractions.typeAndVerify(
      textarea,
      "This is a sample comment."
    );
  },
};

/**
 * Required textarea with asterisk indicator
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Feedback",
    name: "feedback",
    required: true,
    property: mockSchemas.string,
    metadata: {
      rows: 4,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fieldAssertions.hasLabel(canvas, "Feedback", true);

    const textarea = canvas.getByRole("textbox", { name: /feedback \*/i });
    expect(textarea.tagName).toBe("TEXTAREA");

    await fieldInteractions.typeAndVerify(
      textarea,
      "This product exceeded my expectations!"
    );
  },
};

/**
 * Textarea with custom rows configuration
 */
export const CustomRows: Story = {
  args: createStoryArgs({
    label: "Long Description",
    name: "longDescription",
    property: mockSchemas.string,
    metadata: {
      rows: 8,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /long description/i });

    expect(textarea).toHaveAttribute("rows", "8");

    const longText =
      "This is a much longer description that spans multiple lines.\n\nIt includes paragraphs and detailed information about the topic.\n\nThe textarea has more rows to accommodate this content.";
    await fieldInteractions.typeAndVerify(textarea, longText);
  },
};

/**
 * Textarea with placeholder text
 */
export const WithPlaceholder: Story = {
  args: createStoryArgs({
    label: "Bio",
    name: "bio",
    property: mockSchemas.string,
    metadata: {
      placeholder:
        "Tell us about yourself, your interests, and your experience...",
      rows: 6,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /bio/i });

    fieldAssertions.hasPlaceholder(
      textarea,
      "Tell us about yourself, your interests, and your experience..."
    );
    expect(textarea).toHaveAttribute("rows", "6");

    await fieldInteractions.typeAndVerify(
      textarea,
      "I'm a passionate developer with 5 years of experience in web development."
    );
  },
};

/**
 * Textarea with description and length constraints
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Review",
    name: "review",
    description: "Please provide a detailed review (minimum 50 characters)",
    property: {
      type: "string",
      minLength: 50,
      maxLength: 500,
    },
    metadata: {
      placeholder: "Share your experience with this product...",
      rows: 5,
    },
  }),
  play: playFunctions.fieldWithDescription(
    "Review",
    "Please provide a detailed review (minimum 50 characters)",
    "This product has excellent build quality and performs exactly as described. I would definitely recommend it to others."
  ),
};

/**
 * Blog post textarea using preset
 */
export const BlogPost: Story = {
  args: createStoryArgs({
    label: "Article Content",
    name: "articleContent",
    property: mockSchemas.string,
    metadata: FieldPresets.textarea,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /article content/i });

    expect(textarea).toHaveAttribute("rows", "4"); // from preset

    const articleText =
      "# My First Blog Post\n\nWelcome to my blog! This is where I'll share my thoughts and experiences.\n\n## Introduction\n\nI'm excited to start this journey...";
    await fieldInteractions.typeAndVerify(textarea, articleText);
  },
};

/**
 * Compact textarea for short messages
 */
export const Compact: Story = {
  args: createStoryArgs({
    label: "Quick Note",
    name: "quickNote",
    property: mockSchemas.string,
    metadata: {
      rows: 2,
      placeholder: "Add a quick note...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /quick note/i });

    expect(textarea).toHaveAttribute("rows", "2");
    fieldAssertions.hasPlaceholder(textarea, "Add a quick note...");

    await fieldInteractions.typeAndVerify(
      textarea,
      "Remember to follow up on this."
    );
  },
};

/**
 * Large textarea for extensive content
 */
export const Large: Story = {
  args: createStoryArgs({
    label: "Terms and Conditions",
    name: "terms",
    property: mockSchemas.string,
    metadata: {
      rows: 12,
      placeholder: "Enter the full terms and conditions...",
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", {
      name: /terms and conditions/i,
    });

    expect(textarea).toHaveAttribute("rows", "12");

    const termsText =
      "1. Acceptance of Terms\nBy using this service, you agree to these terms.\n\n2. User Responsibilities\nUsers must provide accurate information.\n\n3. Privacy Policy\nWe respect your privacy and protect your data.";
    await fieldInteractions.typeAndVerify(textarea, termsText);
  },
};

/**
 * Textarea with character limit validation
 */
export const WithCharacterLimit: Story = {
  args: createStoryArgs({
    label: "Tweet",
    name: "tweet",
    description: "Maximum 280 characters",
    property: {
      type: "string",
      maxLength: 280,
    },
    metadata: {
      placeholder: "What's happening?",
      rows: 3,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    fieldAssertions.hasDescription(canvas, "Maximum 280 characters");

    const textarea = canvas.getByRole("textbox", { name: /tweet/i });
    fieldAssertions.hasPlaceholder(textarea, "What's happening?");

    await fieldInteractions.typeAndVerify(
      textarea,
      "Just deployed a new feature that makes our app 50% faster! Excited to see how users respond. #development #performance"
    );
  },
};

/**
 * Disabled textarea state
 */
export const Disabled: Story = {
  args: createStoryArgs({
    label: "System Message",
    name: "systemMessage",
    property: mockSchemas.string,
    metadata: {
      placeholder: "Auto-generated content",
      rows: 4,
    },
  }),
  decorators: [
    withFormProvider({
      systemMessage:
        "This message was automatically generated by the system.\n\nIt contains important information about your account status.\n\nPlease read carefully.",
    }),
  ],
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <TextareaField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /system message/i });

    fieldAssertions.hasPlaceholder(textarea, "Auto-generated content");
    expect(textarea).toHaveValue(
      "This message was automatically generated by the system.\n\nIt contains important information about your account status.\n\nPlease read carefully."
    );
  },
};

/**
 * Interactive focus and selection testing
 */
export const InteractionTesting: Story = {
  args: createStoryArgs({
    label: "Interactive Test",
    name: "interactiveTest",
    property: mockSchemas.string,
    metadata: {
      placeholder: "Click to start typing...",
      rows: 4,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: /interactive test/i });

    // Test focus behavior
    await fieldInteractions.testFocusBlur(textarea);

    // Test typing and clearing
    await fieldInteractions.typeAndVerify(
      textarea,
      "First line of text\nSecond line of text"
    );
    await fieldInteractions.clearAndVerify(textarea);

    // Test final content
    await fieldInteractions.typeAndVerify(textarea, "Final test content");
  },
};

/**
 * Accessibility testing for textarea
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessible Textarea",
    name: "accessibleTextarea",
    required: true,
    description: "This textarea has proper accessibility attributes",
    property: mockSchemas.string,
    metadata: {
      rows: 5,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test accessibility
    const textarea = canvas.getByRole("textbox", {
      name: /accessible textarea/i,
    });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toBeVisible();
    expect(textarea).toBeEnabled();
    expect(textarea.tagName).toBe("TEXTAREA");

    // Test required indicator
    fieldAssertions.hasLabel(canvas, "Accessible Textarea", true);
    fieldAssertions.hasDescription(
      canvas,
      "This textarea has proper accessibility attributes"
    );

    // Test keyboard navigation
    await fieldInteractions.testKeyboardNav(
      textarea,
      "Accessible content for everyone"
    );
  },
};

/**
 * All textarea variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-2xl">
      <TextareaField
        {...createStoryArgs({
          label: "Small (2 rows)",
          name: "small",
          metadata: {
            rows: 2,
            placeholder: "Compact textarea",
          },
        })}
      />
      <TextareaField
        {...createStoryArgs({
          label: "Medium (4 rows)",
          name: "medium",
          metadata: {
            rows: 4,
            placeholder: "Standard textarea",
          },
        })}
      />
      <TextareaField
        {...createStoryArgs({
          label: "Large (8 rows)",
          name: "large",
          metadata: {
            rows: 8,
            placeholder: "Extended textarea",
          },
        })}
      />
      <TextareaField
        {...createStoryArgs({
          label: "Required Field *",
          name: "required",
          required: true,
          metadata: {
            rows: 3,
            placeholder: "This field is required",
          },
        })}
      />
    </div>
  ),
  decorators: [withFormProvider()],
  parameters: {
    docs: {
      description: {
        story: "Showcase of different textarea sizes and configurations.",
      },
    },
  },
};
