import { describe, expect, it } from "vitest";
import { loadAll } from "../lib/loadData";
import type { DateRange } from "../schema";

function isChronological(range: DateRange): boolean {
  if (range.end === "present") return true;
  return range.start <= range.end; // "YYYY-MM" sorts lexically = chronologically
}

describe("cross-entity invariants", () => {
  it("has a non-empty schema version", () => {
    expect(loadAll().meta.schemaVersion.length).toBeGreaterThan(0);
  });

  it("has ids that are unique across every domain", () => {
    const { person, experience, education, skills, hobbies } = loadAll();
    const ids = [
      person.id,
      ...experience.map((e) => e.id),
      ...education.map((e) => e.id),
      ...skills.map((s) => s.id),
      ...hobbies.map((h) => h.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has chronological date ranges for experience and education", () => {
    const { experience, education } = loadAll();
    for (const entry of [...experience, ...education]) {
      expect(isChronological(entry.dateRange)).toBe(true);
    }
  });
});
