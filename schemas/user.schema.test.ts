import { registerUserSchema } from "./user.schema";
import { faker } from "@faker-js/faker";
import { describe, it, expect } from "vitest";

describe("user schema", () => {
  it("correct confirmation of password", () => {
    const password = faker.internet.password();
    const result = registerUserSchema.safeParse({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password, 
      confirmPassword: password,
    });

    expect(result.success).toBe(true);
    if(!result.success) {
      expect(result.error.issues[0]?.path).toContain(["confirmPassword"]);
    }
  });
});