import { z } from "zod";
import { Id } from "./common";

export const SkillSchema = z.object({
  id: Id,
  name: z.string(),
  category: z.string(),
  type: z.enum(["technical", "tool", "methodology", "soft"]),
  // 1 = familiar, 2 = proficient, 3 = advanced. Optional — not every skill
  // (e.g. a methodology) has a meaningful self-rating.
  proficiency: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  note: z.string().optional(),
});

export const SkillsSchema = z.array(SkillSchema);

export type Skill = z.infer<typeof SkillSchema>;
