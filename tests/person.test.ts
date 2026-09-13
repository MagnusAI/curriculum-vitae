import { describe, expect, it } from "vitest";
import { loadPerson } from "../lib/loadData";

describe("person data", () => {
  it("conforms to the person schema", () => {
    expect(() => loadPerson()).not.toThrow();
  });

  it("has a non-empty name and summary", () => {
    const person = loadPerson();
    expect(person.name.full.length).toBeGreaterThan(0);
    expect(person.summary.length).toBeGreaterThan(0);
  });
});
