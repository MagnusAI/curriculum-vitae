import { describe, expect, it } from "vitest";
import { loadExperience } from "../lib/loadData";

describe("experience data", () => {
  it("conforms to the experience schema", () => {
    expect(() => loadExperience()).not.toThrow();
  });

  it("has at least one entry", () => {
    expect(loadExperience().length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = loadExperience().map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
