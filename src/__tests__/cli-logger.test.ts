import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "../cli/utils/logger";

describe("CLI Logger", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CONFORM_VERBOSE;
  });

  it("should log info messages with blue icon", () => {
    logger.info("Test info message");

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("ℹ"),
      "Test info message"
    );
  });

  it("should log success messages with green checkmark", () => {
    logger.success("Test success message");

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("✓"),
      "Test success message"
    );
  });

  it("should log warning messages with yellow warning icon", () => {
    logger.warn("Test warning message");

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("⚠"),
      "Test warning message"
    );
  });

  it("should log error messages with red X icon", () => {
    logger.error("Test error message");

    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining("✗"),
      "Test error message"
    );
  });

  it("should show error stack in verbose mode", () => {
    process.env.CONFORM_VERBOSE = "true";
    const error = new Error("Test error");

    logger.error("Failed operation", error);

    expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    expect(consoleSpy.error).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("✗"),
      "Failed operation"
    );
    expect(consoleSpy.error).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("Test error")
    );
  });

  it("should not show error details in non-verbose mode", () => {
    const error = new Error("Test error");

    logger.error("Failed operation", error);

    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
  });

  it("should show debug messages only in verbose mode", () => {
    // Non-verbose mode
    logger.debug("Debug message");
    expect(consoleSpy.log).not.toHaveBeenCalled();

    // Verbose mode
    process.env.CONFORM_VERBOSE = "true";
    logger.debug("Debug message");

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("🔍"),
      "Debug message"
    );
  });

  it("should handle additional arguments", () => {
    const data = { key: "value" };
    logger.info("Message with data", data, "extra arg");

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("ℹ"),
      "Message with data",
      data,
      "extra arg"
    );
  });

  it("should handle non-Error objects in error logging", () => {
    process.env.CONFORM_VERBOSE = "true";
    const errorObject = { message: "Custom error", code: 500 };

    logger.error("Failed with object", errorObject);

    expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    expect(consoleSpy.error).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("[object Object]")
    );
  });
});
