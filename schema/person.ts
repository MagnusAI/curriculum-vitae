import { z } from "zod";
import { Id, Link, Location } from "./common";

export const PersonSchema = z.object({
  id: Id,
  name: z.object({
    full: z.string(),
    preferred: z.string().optional(),
  }),
  title: z.string(),
  summary: z.string(),
  location: Location,
  employmentStatus: z.enum(["employed", "open-to-opportunities", "not-looking"]),
  // Modelled as a birth date rather than a static age so it never goes stale.
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")
    .nullable(),
  contact: z.object({
    email: z.string().email().nullable(),
  }),
  links: z.array(Link),
  photo: z.string().nullable(),
});

export type Person = z.infer<typeof PersonSchema>;
