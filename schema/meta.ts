import { z } from "zod";

export const MetaSchema = z.object({
  schemaVersion: z.string(),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
});

export type Meta = z.infer<typeof MetaSchema>;
