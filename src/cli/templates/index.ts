interface TemplateContext {
  projectName: string;
  typescript: boolean;
}

interface TemplateFile {
  [filePath: string]: string | ((context: TemplateContext) => string);
}

interface Template {
  name: string;
  description: string;
  files: TemplateFile;
}

interface Templates {
  [templateName: string]: Template;
}

const reactTsTemplate: Template = {
  name: "React + TypeScript",
  description: "React app with TypeScript and Conform",
  files: {
    "package.json": (context: TemplateContext) => `{
  "name": "${context.projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "conform": "latest",
    "zod": "^3.25.41"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "~5.8.3",
    "vite": "^6.3.5"
  }
}`,
    "src/main.tsx": `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
    "src/App.tsx": `import { conform } from 'conform'

function App() {
  const contactForm = conform.form()
    .add('name', conform.field.text({ required: true }))
    .add('email', conform.field.email({ required: true }))
    .add('message', conform.field.textarea({ rows: 4 }))
    .build();

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Form</h1>
        <form>
          {/* Auto-generated form fields would go here */}
          <p className="text-gray-600">
            Conform form fields will be generated here!
          </p>
        </form>
      </div>
    </div>
  )
}

export default App`,
    "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Conform App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    "README.md": (context: TemplateContext) => `# ${context.projectName}

A Conform-powered React application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Learn More

- [Conform Documentation](https://conform.dev)
- [React Documentation](https://reactjs.org)
`,
  },
};

export const templates: Templates = {
  "react-ts": reactTsTemplate,
  "react-js": {
    ...reactTsTemplate,
    name: "React + JavaScript",
    description: "React app with JavaScript and Conform",
  },
  nextjs: {
    ...reactTsTemplate,
    name: "Next.js + TypeScript",
    description: "Next.js app with TypeScript and Conform",
  },
  vite: {
    ...reactTsTemplate,
    name: "Vite + React + TypeScript",
    description: "Vite-powered React app with TypeScript and Conform",
  },
  storybook: {
    ...reactTsTemplate,
    name: "Storybook Component Library",
    description: "Component library with Storybook and Conform",
  },
};
