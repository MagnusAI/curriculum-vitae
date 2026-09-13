import { ZodError } from "zod";
import { loadAll } from "../lib/loadData";

try {
  const { meta, person, experience, education, skills, hobbies } = loadAll();
  console.log(`meta: schema v${meta.schemaVersion}, updated ${meta.updatedAt}`);
  console.log(`person: ${person.name.full}`);
  console.log(`experience: ${experience.length} entries`);
  console.log(`education: ${education.length} entries`);
  console.log(`skills: ${skills.length} entries`);
  console.log(`hobbies: ${hobbies.length} entries`);
  console.log("All data is valid.");
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Data validation failed:");
    console.error(error.format());
  } else {
    console.error(error);
  }
  process.exit(1);
}
