import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the logger to avoid console output during tests
vi.mock("../cli/utils/logger", () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Node.js modules to avoid file system operations during tests
vi.mock("node:fs", () => ({
  default: {
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(false),
  },
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(false),
}));

vi.mock("node:path", () => ({
  default: {
    join: vi.fn((...args) => args.join("/")),
  },
  join: vi.fn((...args) => args.join("/")),
}));

vi.mock("../../lib/docs-generator", () => ({
  generateDocs: vi.fn().mockReturnValue("<html>Mock docs</html>"),
}));

// Import commands after mocking
import { generateCommand } from "../cli/commands/generate";
import { validateCommand } from "../cli/commands/validate";
import { auditCommand } from "../cli/commands/audit";
import { migrateCommand } from "../cli/commands/migrate";
import { docsCommand } from "../cli/commands/docs";

describe("CLI Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Generate Command", () => {
    it("should have correct command configuration", () => {
      expect(generateCommand.name()).toBe("generate");
      expect(generateCommand.description()).toBe(
        "Generate schemas, forms, and add fields"
      );
    });

    it("should have required options", () => {
      const options = generateCommand.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--output");
      expect(optionNames).toContain("--template");
      expect(optionNames).toContain("--force");
    });

    it("should accept optional type and name arguments", () => {
      const args = generateCommand.registeredArguments;
      expect(args).toHaveLength(2);
      expect(args[0].name()).toBe("type");
      expect(args[0].required).toBe(false);
      expect(args[1].name()).toBe("name");
      expect(args[1].required).toBe(false);
    });
  });

  describe("Validate Command", () => {
    it("should have correct command configuration", () => {
      expect(validateCommand.name()).toBe("validate");
      expect(validateCommand.description()).toBe(
        "Validate form schemas and configurations"
      );
    });

    it("should have required options", () => {
      const options = validateCommand.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--strict");
      expect(optionNames).toContain("--format");
    });

    it("should accept optional path argument", () => {
      const args = validateCommand.registeredArguments;
      expect(args).toHaveLength(1);
      expect(args[0].name()).toBe("path");
      expect(args[0].required).toBe(false);
    });
  });

  describe("Audit Command", () => {
    it("should have correct command configuration", () => {
      expect(auditCommand.name()).toBe("audit");
      expect(auditCommand.description()).toBe(
        "Audit form schemas for issues and optimization opportunities"
      );
    });

    it("should have audit-specific options", () => {
      const options = auditCommand.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--unused-fields");
      expect(optionNames).toContain("--duplicates");
      expect(optionNames).toContain("--performance");
    });
  });

  describe("Migrate Command", () => {
    it("should have correct command configuration", () => {
      expect(migrateCommand.name()).toBe("migrate");
      expect(migrateCommand.description()).toBe(
        "Migrate schemas between different versions"
      );
    });

    it("should have migration-specific options", () => {
      const options = migrateCommand.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--from");
      expect(optionNames).toContain("--to");
      expect(optionNames).toContain("--dry-run");
    });
  });

  describe("Docs Command", () => {
    it("should have correct command configuration", () => {
      expect(docsCommand.name()).toBe("docs");
      expect(docsCommand.description()).toBe(
        "Generate documentation from registered field schemas"
      );
    });

    it("should have documentation-specific options", () => {
      const options = docsCommand.options;
      const optionNames = options.map((opt) => opt.long);

      expect(optionNames).toContain("--output");
      expect(optionNames).toContain("--format");
      expect(optionNames).toContain("--include");
      expect(optionNames).toContain("--exclude");
      expect(optionNames).toContain("--watch");
      expect(optionNames).toContain("--open");
    });

    it("should have default values for key options", () => {
      const outputOption = docsCommand.options.find(
        (opt) => opt.long === "--output"
      );
      const formatOption = docsCommand.options.find(
        (opt) => opt.long === "--format"
      );

      expect(outputOption?.defaultValue).toBe("docs");
      expect(formatOption?.defaultValue).toBe("html");
    });
  });

  describe("Command Structure", () => {
    it("should have all commands properly configured", () => {
      const commands = [
        generateCommand,
        validateCommand,
        auditCommand,
        migrateCommand,
        docsCommand,
      ];

      commands.forEach((command) => {
        // Each command should have basic properties
        expect(command.name()).toBeTruthy();
        expect(command.description()).toBeTruthy();

        // Each command should have options
        expect(Array.isArray(command.options)).toBe(true);
      });
    });

    it("should have unique command names", () => {
      const commands = [
        generateCommand,
        validateCommand,
        auditCommand,
        migrateCommand,
        docsCommand,
      ];
      const names = commands.map((cmd) => cmd.name());
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it("should have sensible default values where appropriate", () => {
      // Generate command defaults
      const generateOutputOption = generateCommand.options.find(
        (opt) => opt.long === "--output"
      );
      expect(generateOutputOption?.defaultValue).toBe("src");

      // Validate command defaults
      const validatePathArg = validateCommand.registeredArguments.find(
        (arg) => arg.name() === "path"
      );
      expect(validatePathArg?.defaultValue).toBe("src/");

      // Docs command defaults
      const docsOutputOption = docsCommand.options.find(
        (opt) => opt.long === "--output"
      );
      const docsFormatOption = docsCommand.options.find(
        (opt) => opt.long === "--format"
      );

      expect(docsOutputOption?.defaultValue).toBe("docs");
      expect(docsFormatOption?.defaultValue).toBe("html");
    });
  });
});
