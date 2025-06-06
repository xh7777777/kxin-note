// tests/main/example.spec.ts

import { join } from "path";
import { existsSync } from "fs";

function add(a: number, b: number): number {
  return a + b;
}

describe("Main Process Test", () => {
  it("should add two numbers correctly", () => {
    expect(add(1, 2)).toBe(3);
  });
});

describe("Main Process Tests", () => {
  it("should be able to resolve paths correctly", () => {
    const testPath = join(__dirname, "../../src/main");
    expect(existsSync(testPath)).toBe(true);
  });

  it("should handle basic Node.js operations", () => {
    const data = { key: "value", number: 42 };
    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toEqual(data);
    expect(parsed.number).toBe(42);
  });

  it("should work with async operations", async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve("test result"), 10);
    });

    const result = await promise;
    expect(result).toBe("test result");
  });
});
