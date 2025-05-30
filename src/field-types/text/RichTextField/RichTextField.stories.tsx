import type { Meta, StoryObj } from "@storybook/react";
import { expect, within, userEvent } from "@storybook/test";
import { RichTextField } from "./RichTextField";
import { createFieldMeta } from "@/lib/storybook-utils";

const meta: Meta<typeof RichTextField> = {
  ...createFieldMeta("text/RichTextField", RichTextField),
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["wysiwyg", "markdown", "hybrid"],
    },
    toolbar: {
      control: { type: "multi-select" },
      options: ["bold", "italic", "underline", "strikethrough", "link", "code"],
    },
    plugins: {
      control: { type: "multi-select" },
      options: ["lists", "links", "markdown", "tabs", "checklist"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic rich text editor with default configuration
 */
export const Default: Story = {
  args: {
    placeholder: "Start writing...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute("aria-placeholder", "Start writing...");

    // Test basic typing
    await userEvent.click(editor);
    await userEvent.type(editor, "Hello, this is a rich text editor!");

    // Verify content
    expect(editor).toHaveTextContent("Hello, this is a rich text editor!");
  },
};

/**
 * Rich text editor with full toolbar
 */
export const WithToolbar: Story = {
  args: {
    placeholder: "Type something and use the toolbar...",
    toolbar: ["bold", "italic", "underline", "strikethrough", "link", "code"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check toolbar buttons are present
    expect(canvas.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(canvas.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(
      canvas.getByRole("button", { name: /underline/i })
    ).toBeInTheDocument();

    const editor = canvas.getByRole("textbox");
    await userEvent.click(editor);
    await userEvent.type(editor, "This text can be formatted!");
  },
};

/**
 * Markdown mode editor
 */
export const MarkdownMode: Story = {
  args: {
    mode: "markdown",
    placeholder: "Write markdown...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.type(
      editor,
      "# Heading 1\n\n**Bold text** and *italic text*"
    );

    expect(editor).toHaveTextContent(
      "# Heading 1**Bold text** and *italic text*"
    );
  },
};

/**
 * Editor with lists plugin enabled
 */
export const WithLists: Story = {
  args: {
    placeholder: "Create lists...",
    plugins: ["lists"],
    toolbar: ["bold", "italic"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.type(editor, "• First item\n• Second item\n• Third item");
  },
};

/**
 * Editor with character limit
 */
export const WithCharacterLimit: Story = {
  args: {
    placeholder: "Limited to 100 characters...",
    maxLength: 100,
    toolbar: ["bold", "italic"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.type(
      editor,
      "This is a test of the character limit feature. It should prevent typing beyond 100 characters."
    );
  },
};

/**
 * Editor with code blocks enabled
 */
export const WithCodeBlocks: Story = {
  args: {
    placeholder: "Write code...",
    allowCodeBlocks: true,
    syntaxHighlighting: true,
    toolbar: ["bold", "italic", "code"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for code button in toolbar (use more specific selector to avoid conflicts)
    const codeButtons = canvas.getAllByRole("button", { name: /code/i });
    expect(codeButtons.length).toBeGreaterThan(0);
    expect(codeButtons[0]).toBeInTheDocument();

    const editor = canvas.getByRole("textbox");
    await userEvent.click(editor);
    await userEvent.type(editor, "Here's some code:\n\nconst hello = 'world';");
  },
};

/**
 * Editor with tables enabled
 */
export const WithTables: Story = {
  args: {
    placeholder: "Create tables...",
    allowTables: true,
    toolbar: ["bold", "italic"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for table button in toolbar
    expect(canvas.getByRole("button", { name: /table/i })).toBeInTheDocument();

    const editor = canvas.getByRole("textbox");
    await userEvent.click(editor);
    await userEvent.type(editor, "Table content goes here");
  },
};

/**
 * Editor with all features enabled
 */
export const FullFeatured: Story = {
  args: {
    placeholder: "Full-featured editor with all options...",
    mode: "wysiwyg",
    toolbar: ["bold", "italic", "underline", "strikethrough", "link", "code"],
    plugins: ["lists", "links", "tabs", "checklist"], // Remove markdown plugin to avoid dependency issues
    allowImages: true,
    allowTables: true,
    allowCodeBlocks: true,
    syntaxHighlighting: true,
    spellCheck: true,
    maxLength: 1000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check all toolbar buttons are present
    expect(canvas.getByRole("button", { name: /table/i })).toBeInTheDocument();
    const codeButtons = canvas.getAllByRole("button", { name: /code/i });
    expect(codeButtons.length).toBeGreaterThan(0);
    expect(canvas.getByRole("button", { name: /image/i })).toBeInTheDocument();

    const editor = canvas.getByRole("textbox");
    await userEvent.click(editor);
    await userEvent.type(
      editor,
      "This is a **full-featured** editor with *all* options enabled!"
    );
  },
};

/**
 * Auto-save enabled editor
 */
export const WithAutoSave: Story = {
  args: {
    placeholder: "Auto-save is enabled...",
    autoSave: true,
    toolbar: ["bold", "italic"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.type(editor, "This content will auto-save");

    // Wait a bit to simulate auto-save delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

/**
 * Disabled editor state
 */
export const Disabled: Story = {
  args: {
    placeholder: "This editor is disabled",
    disabled: true,
    toolbar: ["bold", "italic"],
  },
  render: (args) => (
    <div className="opacity-50">
      <RichTextField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // For disabled state, the editor might not have textbox role, so use a more flexible selector
    const editor = canvasElement.querySelector('[data-lexical-editor="true"]');
    expect(editor).toBeTruthy();
    expect(editor).toHaveAttribute("aria-readonly", "true");
    expect(editor).toHaveAttribute("contenteditable", "false");

    // Should have the placeholder
    expect(editor).toHaveAttribute(
      "aria-placeholder",
      "This editor is disabled"
    );

    // Editor should not be interactive when disabled - don't click disabled element
    // Just verify it's in the correct disabled state
  },
};

/**
 * Compact editor for short content
 */
export const Compact: Story = {
  args: {
    placeholder: "Compact editor...",
    toolbar: ["bold", "italic"],
    className: "compact-editor",
  },
  render: (args) => (
    <div style={{ maxWidth: "400px" }}>
      <RichTextField {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.type(editor, "Compact rich text content");
  },
};

/**
 * Editor with pre-filled content
 */
export const WithValue: Story = {
  args: {
    value: "This is pre-filled content with formatting.", // Plain text that should be set as initial content
    placeholder: "Edit existing content...",
    toolbar: ["bold", "italic", "underline"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    // Should have pre-filled content from the value prop
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute(
      "aria-placeholder",
      "Edit existing content..."
    );

    // Wait a moment for the InitialStatePlugin to set the content
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check that the initial content is present
    expect(editor).toHaveTextContent(
      "This is pre-filled content with formatting."
    );

    await userEvent.click(editor);
    // Test that we can add more content
    await userEvent.type(editor, " Additional content added!");
    expect(editor).toHaveTextContent(
      "This is pre-filled content with formatting. Additional content added!"
    );
  },
};

/**
 * Interactive testing for rich text features
 */
export const InteractionTesting: Story = {
  args: {
    placeholder: "Test interactions...",
    toolbar: ["bold", "italic", "underline", "code"],
    plugins: ["lists"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox");

    // Test focus behavior
    await userEvent.click(editor);
    expect(editor).toHaveFocus();

    // Test typing
    await userEvent.type(editor, "Testing rich text interactions");

    // Test toolbar interaction
    const boldButton = canvas.getByRole("button", { name: /bold/i });
    await userEvent.click(boldButton);

    // Add more text (should be bold)
    await userEvent.type(editor, " Bold text");

    // Test another toolbar button
    const italicButton = canvas.getByRole("button", { name: /italic/i });
    await userEvent.click(italicButton);
    await userEvent.type(editor, " Italic text");
  },
};

/**
 * All editor variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Editor</h3>
        <RichTextField placeholder="Basic rich text editor..." />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">With Toolbar</h3>
        <RichTextField
          placeholder="Editor with formatting toolbar..."
          toolbar={["bold", "italic", "underline", "code"]}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Markdown Mode</h3>
        <RichTextField mode="markdown" placeholder="# Write markdown here..." />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Full Featured</h3>
        <RichTextField
          placeholder="Full-featured editor..."
          toolbar={["bold", "italic", "underline", "strikethrough", "link"]}
          plugins={["lists", "links"]}
          allowTables={true}
          allowCodeBlocks={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase of different RichTextField configurations and modes.",
      },
    },
  },
};
