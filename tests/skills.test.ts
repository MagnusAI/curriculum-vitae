import { describe, expect, it } from "vitest";
import { loadSkills } from "../lib/loadData";

describe("skills data", () => {
  it("conforms to the skill schema", () => {
    expect(() => loadSkills()).not.toThrow();
  });

  it("has at least one entry", () => {
    expect(loadSkills().length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = loadSkills().map((skill) => skill.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
