import { describe, expect, it } from "vitest";
import { loadEducation } from "../lib/loadData";

describe("education data", () => {
  it("conforms to the education schema", () => {
    expect(() => loadEducation()).not.toThrow();
  });

  it("has at least one entry", () => {
    expect(loadEducation().length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = loadEducation().map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
