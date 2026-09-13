import { describe, expect, it } from "vitest";
import { loadHobbies } from "../lib/loadData";

describe("hobbies data", () => {
  it("conforms to the hobby schema", () => {
    expect(() => loadHobbies()).not.toThrow();
  });

  it("has at least one entry", () => {
    expect(loadHobbies().length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = loadHobbies().map((hobby) => hobby.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
