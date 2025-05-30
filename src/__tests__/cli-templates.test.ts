import { describe, it, expect } from "vitest";
import { templates } from "../cli/templates";

describe("CLI Templates", () => {
  it("should have all expected templates", () => {
    const expectedTemplates = [
      "react-ts",
      "react-js",
      "nextjs",
      "vite",
      "storybook",
    ];

    expectedTemplates.forEach((templateName) => {
      expect(templates[templateName]).toBeDefined();
      expect(templates[templateName].name).toBeDefined();
      expect(templates[templateName].description).toBeDefined();
      expect(templates[templateName].files).toBeDefined();
    });
  });

  it("should generate react-ts template files correctly", () => {
    const template = templates["react-ts"];
    const context = { projectName: "test-app", typescript: true };

    // Check required files exist
    expect(template.files["package.json"]).toBeDefined();
    expect(template.files["src/main.tsx"]).toBeDefined();
    expect(template.files["src/App.tsx"]).toBeDefined();
    expect(template.files["index.html"]).toBeDefined();
    expect(template.files["README.md"]).toBeDefined();

    // Test dynamic content generation
    const packageJson = template.files["package.json"];
    if (typeof packageJson === "function") {
      const generated = packageJson(context);
      expect(generated).toContain('"name": "test-app"');
      expect(generated).toContain('"conform": "latest"');
      expect(generated).toContain('"zod"');
    }

    const readme = template.files["README.md"];
    if (typeof readme === "function") {
      const generated = readme(context);
      expect(generated).toContain("# test-app");
      expect(generated).toContain("A Conform-powered React application");
    }
  });

  it("should have static files as strings", () => {
    const template = templates["react-ts"];

    const mainTsx = template.files["src/main.tsx"];
    expect(typeof mainTsx).toBe("string");
    expect(mainTsx).toContain("import { StrictMode }");
    expect(mainTsx).toContain("createRoot");

    const appTsx = template.files["src/App.tsx"];
    expect(typeof appTsx).toBe("string");
    expect(appTsx).toContain("conform.form()");
    expect(appTsx).toContain("field.text");
    expect(appTsx).toContain("field.email");

    const indexHtml = template.files["index.html"];
    expect(typeof indexHtml).toBe("string");
    expect(indexHtml).toContain("<!doctype html>");
    expect(indexHtml).toContain('<div id="root">');
  });

  it("should have consistent structure across all templates", () => {
    Object.entries(templates).forEach(([, template]) => {
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(typeof template.files).toBe("object");
      expect(Object.keys(template.files).length).toBeGreaterThan(0);

      // All templates should have these core files
      expect(template.files["package.json"]).toBeDefined();
      expect(template.files["README.md"]).toBeDefined();
    });
  });

  it("should generate different content for different project names", () => {
    const template = templates["react-ts"];
    const context1 = { projectName: "app-one", typescript: true };
    const context2 = { projectName: "app-two", typescript: true };

    const packageJson = template.files["package.json"];
    if (typeof packageJson === "function") {
      const generated1 = packageJson(context1);
      const generated2 = packageJson(context2);

      expect(generated1).toContain('"name": "app-one"');
      expect(generated2).toContain('"name": "app-two"');
      expect(generated1).not.toContain("app-two");
      expect(generated2).not.toContain("app-one");
    }
  });

  it("should support typescript context flag", () => {
    const template = templates["react-ts"];
    const context = { projectName: "test-app", typescript: false };

    // Template should be able to access typescript flag
    // (Even though the react-ts template doesn't currently use it differently)
    const packageJson = template.files["package.json"];
    if (typeof packageJson === "function") {
      const generated = packageJson(context);
      expect(generated).toBeDefined();
      expect(typeof generated).toBe("string");
    }
  });

  it("should have valid JSON in package.json template", () => {
    const template = templates["react-ts"];
    const context = { projectName: "test-app", typescript: true };

    const packageJson = template.files["package.json"];
    if (typeof packageJson === "function") {
      const generated = packageJson(context);

      // Should be valid JSON
      expect(() => JSON.parse(generated)).not.toThrow();

      const parsed = JSON.parse(generated);
      expect(parsed.name).toBe("test-app");
      expect(parsed.dependencies.conform).toBeDefined();
      expect(parsed.dependencies.zod).toBeDefined();
      expect(parsed.dependencies.react).toBeDefined();
    }
  });
});
