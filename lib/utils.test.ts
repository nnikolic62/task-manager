import { describe, it, expect } from "vitest";

import { slugify } from "./utils";

describe("slugify", () => {
  it("slugifies a string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("slugifies a string with multiple words and special characters", () => {
    expect(slugify("Hello World Hello World!")).toBe("hello-world-hello-world");
  });

  it("empty string returns 'workspace'", () => {
    expect(slugify("")).toBe("workspace");
  });
});
