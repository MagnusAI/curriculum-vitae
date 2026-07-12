import { GardenBed, PottedPlant, RackTool } from "./types";

// The Skills Yard: three systems with distinct visual grammar in the game.

// Raised garden beds = core technical skill categories.
// proficiency (1–3) is shown as the bed's growth stage.
export const gardenBeds: GardenBed[] = [
  {
    name: "Frontend",
    proficiency: 3,
    skills: ["React", "TypeScript", "Next.js"],
  },
  {
    name: "Backend",
    proficiency: 3,
    skills: ["Java", "Kotlin", "Node.js", "C#", "Python"],
  },
  {
    name: "Cloud & DevOps",
    proficiency: 2,
    skills: ["AWS Cloud Services", "CI/CD", "Infrastructure as Code"],
  },
  {
    name: "Architecture",
    proficiency: 2,
    skills: ["Hexagonal Architecture", "Domain Driven Design", "Microservices"],
  },
  {
    name: "Testing",
    proficiency: 2,
    skills: ["JUnit", "Cypress", "Jest"],
  },
];

// Potted plants = softer or still-growing skills.
export const pottedPlants: PottedPlant[] = [
  { name: "Agile Methodologies", note: "Day-to-day way of working" },
  { name: "Scrum & Kanban", note: "Comfortable in both" },
  { name: "Fullstack Mindset", note: "Happiest when owning a feature end to end" },
];

// Tool rack = concrete tools; usage (1–3) = how worn-in the handle is.
export const rackTools: RackTool[] = [
  { name: "Git", usage: 3 },
  { name: "Docker", usage: 3 },
  { name: "Jira", usage: 2 },
  { name: "OpsGenie", usage: 2 },
  { name: "Storybook", usage: 2 },
  { name: "Contentful (CMS)", usage: 1 },
  { name: "Sanity (CMS)", usage: 1 },
];
