// Guards against a data-entry replacement silently reintroducing an
// oversized image asset into what's meant to stay a lightweight data repo.
import { statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadPerson } from "../lib/loadData";

describe("person photo asset", () => {
  it("stays small", () => {
    const person = loadPerson();
    expect(person.photo).not.toBeNull();
    const path = join(process.cwd(), person.photo as string);
    const { size } = statSync(path);
    expect(size).toBeLessThan(50_000);
  });
});
