import { z } from "zod";

// Stable, kebab-case identifier every entity carries so external consumers
// (a website deep link, an LLM citation, a game hotspot) can reference a
// specific entry without depending on array order.
export const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be a kebab-case slug");

// Month-precision date, e.g. "2023-08". CV entries don't need day precision.
export const IsoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "must be YYYY-MM");

export const DateRange = z.object({
  start: IsoMonth,
  end: z.union([IsoMonth, z.literal("present")]),
});

export const Location = z.object({
  city: z.string().nullable(),
  country: z.string(),
});

export const Link = z.object({
  label: z.string(),
  url: z.string().url(),
});

export type Id = z.infer<typeof Id>;
export type DateRange = z.infer<typeof DateRange>;
export type Location = z.infer<typeof Location>;
export type Link = z.infer<typeof Link>;
