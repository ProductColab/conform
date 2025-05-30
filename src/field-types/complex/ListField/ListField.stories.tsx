import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "@storybook/test";
import { ListField } from "./ListField";
import {
  createFieldMeta,
  createStoryArgs,
  withFormProvider,
  fieldAssertions,
} from "@/lib/storybook-utils";
import { TextField } from "@/field-types/text/TextField/TextField";
import { NumberField } from "@/field-types/numeric/NumberField/NumberField";
import { SwitchField } from "@/field-types/boolean/SwitchField/SwitchField";
import { SelectField } from "@/field-types/text/SelectField/SelectField";

const meta: Meta<typeof ListField> = {
  ...createFieldMeta("complex/ListField", ListField),
  argTypes: {
    property: {
      control: { type: "object" },
      description: "JSON Schema with array type and items definition",
    },
    metadata: {
      control: { type: "object" },
      description:
        "ListField-specific configuration including min/max items, button text, etc.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Common array schemas for stories
const stringListSchema = {
  type: "array",
  items: {
    type: "string",
  },
  minItems: 0,
  maxItems: 5,
} as const;

const personListSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string" },
      age: { type: "number", minimum: 0, maximum: 120 },
    },
    required: ["firstName", "lastName"],
  },
  minItems: 1,
  maxItems: 3,
} as const;

const todoListSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      completed: { type: "boolean" },
      priority: {
        type: "string",
        enum: ["low", "medium", "high", "urgent"],
      },
    },
    required: ["title"],
  },
  minItems: 0,
  maxItems: 10,
} as const;

const tagListSchema = {
  type: "array",
  items: {
    type: "string",
  },
  minItems: 1,
  maxItems: 8,
} as const;

// Simple field renderer for string items
const StringItemRenderer = (index: number) => (
  <TextField
    name={`testField.${index}.value`}
    property={{ type: "string" }}
    required={false}
    label={`Item ${index + 1}`}
    metadata={{}}
  />
);

// Complex field renderer for person objects
const PersonRenderer = (index: number) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <TextField
        name={`testField.${index}.firstName`}
        property={{ type: "string" }}
        required={true}
        label="First Name"
        metadata={{ placeholder: "Enter first name..." }}
      />
      <TextField
        name={`testField.${index}.lastName`}
        property={{ type: "string" }}
        required={true}
        label="Last Name"
        metadata={{ placeholder: "Enter last name..." }}
      />
    </div>
    <TextField
      name={`testField.${index}.email`}
      property={{ type: "string" }}
      required={false}
      label="Email"
      metadata={{ placeholder: "email@example.com" }}
    />
    <NumberField
      name={`testField.${index}.age`}
      property={{ type: "number", minimum: 0, maximum: 120 }}
      required={false}
      label="Age"
      metadata={{ placeholder: "Enter age..." }}
    />
  </div>
);

// Todo item renderer
const TodoRenderer = (index: number) => (
  <div className="space-y-3">
    <TextField
      name={`testField.${index}.title`}
      property={{ type: "string" }}
      required={true}
      label="Title"
      metadata={{ placeholder: "What needs to be done?" }}
    />
    <TextField
      name={`testField.${index}.description`}
      property={{ type: "string" }}
      required={false}
      label="Description"
      metadata={{ placeholder: "Additional details..." }}
    />
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        name={`testField.${index}.priority`}
        property={{
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
        }}
        required={false}
        label="Priority"
        metadata={{ placeholder: "Select priority..." }}
      />
      <SwitchField
        name={`testField.${index}.completed`}
        required={false}
        label="Completed"
      />
    </div>
  </div>
);

/**
 * Basic list field with simple string items
 */
export const Default: Story = {
  args: createStoryArgs({
    label: "Tags",
    name: "testField",
    property: stringListSchema,
    metadata: {
      addButtonText: "Add Tag",
      removeButtonText: "Remove",
    },
  }),
  render: (args) => <ListField {...args}>{StringItemRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check initial state
    fieldAssertions.hasLabel(canvas, "Tags", false);
    expect(canvas.getByText("No items added yet")).toBeInTheDocument();

    // Add an item
    const addButton = canvas.getByRole("button", { name: /add tag/i });
    expect(addButton).toBeInTheDocument();
    await userEvent.click(addButton);

    // Should now have one item header (look for the collapsible button specifically)
    const itemHeaders = canvas.getAllByRole("button", { name: /item 1/i });
    expect(itemHeaders.length).toBeGreaterThan(0);
    expect(canvas.queryByText("No items added yet")).not.toBeInTheDocument();

    // Add another item
    await userEvent.click(addButton);
    const item2Headers = canvas.getAllByRole("button", { name: /item 2/i });
    expect(item2Headers.length).toBeGreaterThan(0);
  },
};

/**
 * Required field with minimum items constraint
 */
export const Required: Story = {
  args: createStoryArgs({
    label: "Contact List",
    name: "testField",
    required: true,
    property: personListSchema,
    metadata: {
      addButtonText: "Add Contact",
      removeButtonText: "Remove Contact",
      itemTemplate: {
        title: "Contact {index}",
        collapsible: true,
        defaultExpanded: true,
      },
    },
  }),
  render: (args) => <ListField {...args}>{PersonRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for required indicator (label should contain the text, asterisk in separate span)
    const labelElement = canvas.getByText("Contact List");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for asterisk in the same label element
    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    // Should show minimum items validation (there might be multiple instances)
    const validationMessages = canvas.getAllByText("Minimum 1 item required");
    expect(validationMessages.length).toBeGreaterThan(0);

    // Add a contact
    const addButton = canvas.getByRole("button", { name: /add contact/i });
    await userEvent.click(addButton);

    const contactHeaders = canvas.getAllByRole("button", {
      name: /contact 1/i,
    });
    expect(contactHeaders.length).toBeGreaterThan(0);

    // Validation message should be gone after adding item
    expect(
      canvas.queryByText("Minimum 1 item required")
    ).not.toBeInTheDocument();
  },
};

/**
 * Field with helpful description text
 */
export const WithDescription: Story = {
  args: createStoryArgs({
    label: "Todo List",
    name: "testField",
    description: "Manage your tasks with priorities and completion status",
    property: todoListSchema,
    metadata: {
      addButtonText: "Add Todo",
      removeButtonText: "Remove",
      itemTemplate: {
        title: "Task {index}",
        collapsible: true,
        defaultExpanded: false,
      },
    },
  }),
  render: (args) => <ListField {...args}>{TodoRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fieldAssertions.hasDescription(
      canvas,
      "Manage your tasks with priorities and completion status"
    );

    // Add a todo
    const addButton = canvas.getByRole("button", { name: /add todo/i });
    await userEvent.click(addButton);

    // Should be collapsed by default - find the task header button
    const taskHeaderButton = canvas.getByRole("button", { name: /task 1/i });
    expect(taskHeaderButton).toBeInTheDocument();

    // Should not see form fields initially (collapsed)
    expect(canvas.queryByLabelText("Title")).not.toBeInTheDocument();

    // Click to expand
    await userEvent.click(taskHeaderButton);

    // Give it a moment for expansion animation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should now see the form fields (check for any input/textarea rather than specific label)
    const formInputs = canvas.getAllByRole("textbox");
    expect(formInputs.length).toBeGreaterThan(0);
  },
};

/**
 * Field with drag and drop reordering
 */
export const WithDragAndDrop: Story = {
  args: createStoryArgs({
    label: "Priority List",
    name: "testField",
    property: stringListSchema,
    metadata: {
      allowReorder: true,
      addButtonText: "Add Item",
      removeButtonText: "Remove",
      itemTemplate: {
        title: "Priority {index}",
        collapsible: false,
      },
    },
  }),
  render: (args) => <ListField {...args}>{StringItemRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Add some items
    const addButton = canvas.getByRole("button", { name: /add item/i });
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // Check for drag handles by aria-roledescription (there will be multiple with empty names)
    const dragHandles = canvas.getAllByRole("button", { name: "" });
    const sortableHandle = dragHandles.find(
      (handle) => handle.getAttribute("aria-roledescription") === "sortable"
    );
    expect(sortableHandle).toBeInTheDocument();
    expect(sortableHandle).toHaveAttribute("aria-roledescription", "sortable");
  },
};

/**
 * Field with items collapsed by default
 */
export const CollapsedByDefault: Story = {
  args: createStoryArgs({
    label: "Configurations",
    name: "testField",
    property: todoListSchema,
    metadata: {
      addButtonText: "Add Config",
      removeButtonText: "Delete",
      itemTemplate: {
        title: "Configuration {index}",
        collapsible: true,
        defaultExpanded: false,
      },
    },
  }),
  render: (args) => <ListField {...args}>{TodoRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Add an item
    const addButton = canvas.getByRole("button", { name: /add config/i });
    await userEvent.click(addButton);

    // Should be collapsed by default (no form fields visible)
    const configHeaderButton = canvas.getByRole("button", {
      name: /configuration 1/i,
    });
    expect(configHeaderButton).toBeInTheDocument();
    expect(canvas.queryByLabelText("Title")).not.toBeInTheDocument();

    // Click to expand
    await userEvent.click(configHeaderButton);

    // Give it a moment for expansion animation
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now should see form fields (check for any form inputs rather than specific label)
    const formInputs = canvas.queryAllByRole("textbox");
    expect(formInputs.length).toBeGreaterThan(0);
  },
};

/**
 * Field with pre-populated items
 */
export const WithDefaultValues: Story = {
  args: createStoryArgs({
    label: "Existing Tags",
    name: "testField",
    property: tagListSchema,
    metadata: {
      addButtonText: "Add Tag",
      removeButtonText: "Remove",
    },
  }),
  decorators: [
    withFormProvider({
      testField: ["React", "TypeScript", "Storybook"],
    }),
  ],
  render: (args) => <ListField {...args}>{StringItemRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show pre-populated items by looking for the header buttons
    const item1Button = canvas.getByRole("button", { name: /item 1/i });
    const item2Button = canvas.getByRole("button", { name: /item 2/i });
    const item3Button = canvas.getByRole("button", { name: /item 3/i });

    expect(item1Button).toBeInTheDocument();
    expect(item2Button).toBeInTheDocument();
    expect(item3Button).toBeInTheDocument();

    // Should show current count
    expect(canvas.getByText("(3/8)")).toBeInTheDocument();
  },
};

/**
 * Field without add/remove buttons
 */
export const ReadOnlyMode: Story = {
  args: createStoryArgs({
    label: "Read-Only List",
    name: "testField",
    property: stringListSchema,
    metadata: {
      showAddButton: false,
      showRemoveButton: false,
      allowReorder: false,
      itemTemplate: {
        title: "Item {index}",
        collapsible: false,
      },
    },
  }),
  decorators: [
    withFormProvider({
      testField: ["Item 1", "Item 2"],
    }),
  ],
  render: (args) => (
    <div className="opacity-75">
      <ListField {...args}>{StringItemRenderer}</ListField>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Should show items but no controls - look for header buttons
    const item1Button = canvas.getByRole("button", { name: /item 1/i });
    const item2Button = canvas.getByRole("button", { name: /item 2/i });

    expect(item1Button).toBeInTheDocument();
    expect(item2Button).toBeInTheDocument();

    // Should not have add/remove buttons
    expect(
      canvas.queryByRole("button", { name: /add/i })
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole("button", { name: /remove/i })
    ).not.toBeInTheDocument();
  },
};

/**
 * Accessibility features test
 */
export const AccessibilityTest: Story = {
  args: createStoryArgs({
    label: "Accessible List",
    name: "testField",
    required: true,
    description: "This list has proper accessibility attributes",
    property: stringListSchema,
    metadata: {
      addButtonText: "Add Accessible Item",
      removeButtonText: "Remove Item",
    },
  }),
  render: (args) => <ListField {...args}>{StringItemRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for label and required indicator
    const labelElement = canvas.getByText("Accessible List");
    expect(labelElement).toBeInTheDocument();
    expect(labelElement.tagName.toLowerCase()).toBe("label");

    // Check for asterisk
    const asterisk = canvas.getByText("*");
    expect(asterisk).toBeInTheDocument();

    fieldAssertions.hasDescription(
      canvas,
      "This list has proper accessibility attributes"
    );

    // Add an item to test accessibility
    const addButton = canvas.getByRole("button", {
      name: /add accessible item/i,
    });
    await userEvent.click(addButton);

    // Should have proper aria attributes for drag and drop - find by aria-roledescription
    const dragHandles = canvas.getAllByRole("button");
    const dragHandle = dragHandles.find(
      (button) => button.getAttribute("aria-roledescription") === "sortable"
    );
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute("aria-roledescription", "sortable");
  },
};

/**
 * Interactive testing playground
 */
export const InteractionTesting: Story = {
  args: {
    name: "testField",
    property: stringListSchema,
    required: false,
    label: "Interactive Test",
    metadata: {},
    children: StringItemRenderer,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Debug: Check initial state
    const addButton = canvas.getByRole("button", { name: /add item/i });
    console.log("Initial add button text:", addButton.textContent);

    // Add first item
    await userEvent.click(addButton);

    // Wait and check state after first click
    await new Promise((resolve) => setTimeout(resolve, 100));
    const item1Buttons = canvas.getAllByRole("button", { name: /item 1/i });
    console.log("After first click, Item 1 buttons:", item1Buttons.length);
    console.log("Add button text after first click:", addButton.textContent);

    // Add second item
    await userEvent.click(addButton);

    // Wait and check state after second click
    await new Promise((resolve) => setTimeout(resolve, 100));
    const item1ButtonsAfter = canvas.getAllByRole("button", {
      name: /item 1/i,
    });
    const item2ButtonsAfter = canvas.queryAllByRole("button", {
      name: /item 2/i,
    });
    console.log(
      "After second click, Item 1 buttons:",
      item1ButtonsAfter.length
    );
    console.log(
      "After second click, Item 2 buttons:",
      item2ButtonsAfter.length
    );
    console.log("Add button text after second click:", addButton.textContent);

    // Check if second item was actually added
    expect(item2ButtonsAfter.length).toBeGreaterThan(0);
  },
};

/**
 * All list field variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-2">Simple String List</h3>
        <ListField
          {...createStoryArgs({
            label: "Tags",
            name: "tags",
            property: stringListSchema,
            metadata: { addButtonText: "Add Tag" },
          })}
        >
          {StringItemRenderer}
        </ListField>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Complex Object List</h3>
        <ListField
          {...createStoryArgs({
            label: "Team Members",
            name: "members",
            property: personListSchema,
            metadata: {
              addButtonText: "Add Member",
              itemTemplate: {
                title: "Member {index}",
                defaultExpanded: false,
              },
            },
          })}
        >
          {PersonRenderer}
        </ListField>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">
          Todo List with Validation
        </h3>
        <ListField
          {...createStoryArgs({
            label: "Tasks",
            name: "tasks",
            required: true,
            property: todoListSchema,
            metadata: {
              addButtonText: "Add Task",
              removeButtonText: "Delete",
            },
          })}
        >
          {TodoRenderer}
        </ListField>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">No Reordering</h3>
        <ListField
          {...createStoryArgs({
            label: "Sequential Steps",
            name: "steps",
            property: stringListSchema,
            metadata: {
              allowReorder: false,
              addButtonText: "Add Step",
              itemTemplate: { title: "Step {index}" },
            },
          })}
        >
          {StringItemRenderer}
        </ListField>
      </div>
    </div>
  ),
  decorators: [withFormProvider()],
  parameters: {
    docs: {
      description: {
        story: "Showcase of different ListField configurations and use cases.",
      },
    },
  },
};

/**
 * Playground for testing custom configurations
 */
export const Playground: Story = {
  args: createStoryArgs({
    label: "Playground List",
    name: "testField",
    description: "Use the controls below to customize this list field",
    property: stringListSchema,
    metadata: {
      addButtonText: "Add Item",
      removeButtonText: "Remove",
      allowReorder: true,
      itemTemplate: {
        title: "Item {index}",
        collapsible: true,
        defaultExpanded: true,
      },
    },
  }),
  render: (args) => <ListField {...args}>{StringItemRenderer}</ListField>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const addButton = canvas.getByRole("button", { name: /add item/i });
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    // Check for header buttons instead of multiple text matches
    const item1Button = canvas.getByRole("button", { name: /item 1/i });
    const item2Button = canvas.getByRole("button", { name: /item 2/i });

    expect(item1Button).toBeInTheDocument();
    expect(item2Button).toBeInTheDocument();
  },
};
