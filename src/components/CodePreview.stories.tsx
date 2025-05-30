import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodePreview } from "./CodePreview";

const meta: Meta<typeof CodePreview> = {
  title: "Sprint 1/Components/Code Preview",
  component: CodePreview,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
# 💻 Code Preview Component

Built by Alex with syntax highlighting and copy functionality. Shows the real-time generated TypeScript code that developers can copy directly into their projects.

## Features
- **Syntax Highlighting**: Beautiful code formatting
- **Copy to Clipboard**: One-click copy with visual feedback
- **Real-time Updates**: Updates as the user modifies rules (coming in integration)
- **TypeScript Ready**: Generated code compiles cleanly
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "📋 Default Preview",
  parameters: {
    docs: {
      description: {
        story:
          "Shows the default code preview with sample email validation rule.",
      },
    },
  },
};

export const InteractiveCopy: Story = {
  name: "📋 Test Copy Functionality",
  parameters: {
    docs: {
      description: {
        story:
          'Click the "Copy" button to test the clipboard functionality. The button will show "Copied!" feedback.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // This would be where we could add interaction testing in the future
  },
};
