import { z } from "zod";
import { DateRange, Id, Location } from "./common";

export const EducationEntrySchema = z.object({
  id: Id,
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  location: Location,
  dateRange: DateRange,
  highlights: z.array(z.string()).min(1),
});

export const EducationSchema = z.array(EducationEntrySchema);

export type EducationEntry = z.infer<typeof EducationEntrySchema>;
