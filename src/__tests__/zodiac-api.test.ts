import { expect, it, describe } from "vitest";
import { zodiac, field } from "../lib/zodiac";
import { FieldRegistry } from "../field-registry";

describe("zodiac Streamlined API", () => {
  it("should create fields with the field builders", () => {
    const emailField = field.email();
    const passwordField = field.password();
    const sliderField = field.slider({ min: 0, max: 100 });

    // Check that fields are registered
    expect(FieldRegistry.has(emailField)).toBe(true);
    expect(FieldRegistry.has(passwordField)).toBe(true);
    expect(FieldRegistry.has(sliderField)).toBe(true);

    // Check metadata
    const emailMeta = FieldRegistry.get(emailField);
    expect(emailMeta?.inputType).toBe("email");
    expect(emailMeta?.placeholder).toBe("user@example.com");

    const passwordMeta = FieldRegistry.get(passwordField);
    expect(passwordMeta?.inputType).toBe("password");
    expect(passwordMeta?.showStrengthMeter).toBe(true);

    const sliderMeta = FieldRegistry.get(sliderField);
    expect(sliderMeta?.showSlider).toBe(true);
    expect(sliderMeta?.step).toBe(1);
  });

  it("should create a form with the zodiac.form() API", () => {
    const form = zodiac.form({
      email: field.email(),
      password: field.password(),
      age: field.slider({ min: 18, max: 100 }),
      agreeToTerms: field.checkbox(),
    });

    // Should have a schema
    expect(form.schema).toBeDefined();

    // Should be able to validate
    const result = form.schema.safeParse({
      email: "test@example.com",
      password: "password123",
      age: 25,
      agreeToTerms: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
      expect(result.data.age).toBe(25);
    }
  });

  it("should work with quick form patterns", () => {
    const contactForm = zodiac.quick.contact();
    expect(contactForm.schema).toBeDefined();

    const signupForm = zodiac.quick.signup();
    expect(signupForm.schema).toBeDefined();

    const profileForm = zodiac.quick.profile();
    expect(profileForm.schema).toBeDefined();

    const surveyForm = zodiac.quick.survey();
    expect(surveyForm.schema).toBeDefined();
  });

  it("should handle field options and overrides", () => {
    const customEmail = field.email({
      placeholder: "Enter your work email",
    });

    const customSlider = field.slider(
      { min: 1, max: 10, step: 0.5 },
      { suffix: "stars" }
    );

    // Check custom options
    const emailMeta = FieldRegistry.get(customEmail);
    expect(emailMeta?.placeholder).toBe("Enter your work email");

    const sliderMeta = FieldRegistry.get(customSlider);
    expect(sliderMeta?.step).toBe(0.5);
    expect(sliderMeta?.suffix).toBe("stars");
  });

  it("should create select and enum fields correctly", () => {
    const category = field.select(["personal", "business", "enterprise"]);
    const priority = field.radio(["low", "medium", "high", "urgent"]);

    // Verify these validate correctly
    expect(category.safeParse("personal").success).toBe(true);
    expect(category.safeParse("invalid").success).toBe(false);

    expect(priority.safeParse("high").success).toBe(true);
    expect(priority.safeParse("invalid").success).toBe(false);

    // Check metadata
    const categoryMeta = FieldRegistry.get(category);
    expect(categoryMeta?.format).toBe("select");

    const priorityMeta = FieldRegistry.get(priority);
    expect(priorityMeta?.format).toBe("radio");
  });
});
