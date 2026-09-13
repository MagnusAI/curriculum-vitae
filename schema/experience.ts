import { z } from "zod";
import { DateRange, Id, Location } from "./common";

export const ExperienceEntrySchema = z.object({
  id: Id,
  organization: z.string(),
  title: z.string(),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  industry: z.string(),
  location: Location,
  dateRange: DateRange,
  highlights: z.array(z.string()).min(1),
});

export const ExperienceSchema = z.array(ExperienceEntrySchema);

export type ExperienceEntry = z.infer<typeof ExperienceEntrySchema>;
