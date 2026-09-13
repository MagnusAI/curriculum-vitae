import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  MetaSchema,
  PersonSchema,
  ExperienceSchema,
  EducationSchema,
  SkillsSchema,
  HobbiesSchema,
  type Meta,
  type Person,
  type ExperienceEntry,
  type EducationEntry,
  type Skill,
  type Hobby,
} from "../schema";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
}

export function loadMeta(): Meta {
  return MetaSchema.parse(readJson("meta.json"));
}

export function loadPerson(): Person {
  return PersonSchema.parse(readJson("person.json"));
}

export function loadExperience(): ExperienceEntry[] {
  return ExperienceSchema.parse(readJson("experience.json"));
}

export function loadEducation(): EducationEntry[] {
  return EducationSchema.parse(readJson("education.json"));
}

export function loadSkills(): Skill[] {
  return SkillsSchema.parse(readJson("skills.json"));
}

export function loadHobbies(): Hobby[] {
  return HobbiesSchema.parse(readJson("hobbies.json"));
}

export function loadAll() {
  return {
    meta: loadMeta(),
    person: loadPerson(),
    experience: loadExperience(),
    education: loadEducation(),
    skills: loadSkills(),
    hobbies: loadHobbies(),
  };
}
