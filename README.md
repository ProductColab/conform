# 🎯 Conform - Dynamic Schema-Driven Forms

[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://[your-username].github.io/conform/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

A powerful React library for building **dynamic, schema-driven forms** with visual rule building capabilities. Generate beautiful forms from Zod schemas, create conditional logic visually, and build adaptive user experiences with zero configuration.

## ✨ Features

### 🚀 **Schema-Driven Forms**

- **Automatic Form Generation** from Zod schemas
- **Type-Safe Validation** with comprehensive error handling
- **Rich Field Types**: Text, numeric, date, boolean, file upload, signature, rating, and more
- **Flexible Layouts**: 1, 2, or 3 column responsive grids
- **Custom Styling**: Compact, normal, or relaxed spacing options

### 🎨 **Visual Rule Builder**

- **Drag-and-Drop Interface** for creating conditional logic
- **No-Code Rule Creation** - business users can build complex workflows
- **Real-Time Preview** of generated rule code
- **Rule Categories**: Field visibility, requirements, validation, and field state

### ⚡ **Dynamic Forms**

- **Conditional Field Rendering** based on user input
- **Real-Time Rule Evaluation** with smooth transitions
- **Cross-Field Dependencies** and complex business logic
- **Custom Functions** for advanced rule conditions

### 🎁 **Rich Field Types**

- **Text Fields**: Email, URL, phone, password with validation
- **Numeric Fields**: Numbers, sliders, ratings with min/max constraints
- **Date/Time Fields**: Date pickers, time inputs, date ranges
- **Selection Fields**: Dropdowns, radio buttons, checkbox groups
- **Complex Fields**: File uploads, signatures, rich text editors
- **Array Fields**: Dynamic lists with add/remove functionality

## 🚀 Quick Start

### Installation

```bash
npm install conform
# or
yarn add conform
# or
pnpm add conform
```

### Basic Usage

```tsx
import { z } from "zod";
import { SchemaForm } from "conform";

// Define your schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  subscribe: z.boolean().default(false),
  category: z.enum(["personal", "business"]),
});

// Render the form
function MyForm() {
  const handleSubmit = async (data) => {
    console.log("Form data:", data);
  };

  return (
    <SchemaForm
      schema={userSchema}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
      columns={2}
      spacing="normal"
    />
  );
}
```

## 📚 Core Components

### SchemaForm

Automatically generates forms from Zod schemas with validation and field type detection.

```tsx
<SchemaForm
  schema={mySchema}
  onSubmit={handleSubmit}
  defaultValues={{ name: "John" }}
  columns={2}
  spacing="relaxed"
  fieldLabels={{
    firstName: "First Name",
    email: "Email Address",
  }}
  fieldDescriptions={{
    bio: "Tell us about yourself (optional)",
  }}
  excludeFields={["internalId"]}
/>
```

### RuleBasedSchemaForm

Extends SchemaForm with conditional logic and dynamic field behavior.

```tsx
const rules = [
  {
    id: "show-company-fields",
    condition: {
      field: "accountType",
      operator: "equals",
      value: "business",
    },
    action: {
      type: "field-visibility",
      field: "companyName",
      visible: true,
    },
  },
];

<RuleBasedSchemaForm
  schema={mySchema}
  rules={rules}
  onSubmit={handleSubmit}
  enableTransitions={true}
/>;
```

### RuleBuilder

Visual interface for creating conditional logic without code.

```tsx
const fieldSchemas = {
  accountType: {
    type: "string",
    options: ["personal", "business", "enterprise"],
    label: "Account Type",
  },
  isActive: {
    type: "boolean",
    label: "Is Active",
  },
};

<RuleBuilder fields={fieldSchemas} onRulesChange={setRules} />;
```

## 🎯 Advanced Usage

### Custom Field Types

Conform automatically detects field types from your schema:

```tsx
const advancedSchema = z.object({
  // Text field with metadata
  bio: z.string().describe("textarea"),

  // Number with slider
  rating: z.number().min(1).max(5).describe("slider"),

  // File upload
  avatar: z.string().describe("file:image/*"),

  // Signature pad
  signature: z.string().describe("signature"),

  // Date range
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .describe("daterange"),

  // Rich text editor
  content: z.string().describe("richtext"),
});
```

### Custom Validation Rules

```tsx
const conditionalSchema = z
  .object({
    accountType: z.enum(["personal", "business"]),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "business" && !data.companyName) {
        return false;
      }
      return true;
    },
    {
      message: "Company name is required for business accounts",
      path: ["companyName"],
    }
  );
```

### Dynamic Field Dependencies

```tsx
const dynamicRules = [
  {
    id: "require-company-name",
    condition: {
      field: "accountType",
      operator: "equals",
      value: "business",
    },
    action: {
      type: "field-required",
      field: "companyName",
      required: true,
    },
  },
  {
    id: "show-enterprise-fields",
    condition: {
      and: [
        { field: "accountType", operator: "equals", value: "enterprise" },
        { field: "employeeCount", operator: "greaterThan", value: 100 },
      ],
    },
    action: {
      type: "field-visibility",
      field: "enterpriseFeatures",
      visible: true,
    },
  },
];
```

## 🎨 Styling & Layout

### Layout Options

```tsx
// Single column (mobile-first)
<SchemaForm schema={schema} columns={1} />

// Two columns on medium screens and up
<SchemaForm schema={schema} columns={2} />

// Three columns on large screens
<SchemaForm schema={schema} columns={3} />
```

### Spacing Controls

```tsx
// Compact spacing for dense forms
<SchemaForm schema={schema} spacing="compact" />

// Normal spacing (default)
<SchemaForm schema={schema} spacing="normal" />

// Relaxed spacing for better readability
<SchemaForm schema={schema} spacing="relaxed" />
```

### Custom Field Labels & Descriptions

```tsx
<SchemaForm
  schema={schema}
  fieldLabels={{
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
  }}
  fieldDescriptions={{
    email: "We'll never share your email with anyone",
    bio: "Tell us a bit about yourself (optional)",
  }}
  fieldPlaceholders={{
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  }}
/>
```

## 🛠️ Development

### Project Setup

```bash
# Clone the repository
git clone https://github.com/your-username/conform.git
cd conform

# Install dependencies
npm install

# Start development server
npm run dev

# Run Storybook
npm run storybook

# Run tests
npm test
```

### Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run storybook    # Start Storybook
npm run build-storybook # Build Storybook for deployment
npm test             # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
```

## 🏗️ Built With

- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Zod](https://zod.dev/)** - Schema validation
- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components
- **[Lucide React](https://lucide.dev/)** - Icons
- **[Storybook](https://storybook.js.org/)** - Component documentation
- **[Vitest](https://vitest.dev/)** - Testing framework

## 📖 Documentation

- **[Storybook Documentation](https://[your-username].github.io/conform/)** - Interactive component documentation
- **[API Reference](./docs/api.md)** - Detailed API documentation
- **[Examples](./examples/)** - Real-world usage examples
- **[Migration Guide](./docs/migration.md)** - Upgrading from other form libraries

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for developer-friendly form builders
- Built on the shoulders of giants in the React ecosystem
- Community feedback and contributions

---

<div align="center">

**[⭐ Star this repo](https://github.com/your-username/conform)** if you find it helpful!

</div>
