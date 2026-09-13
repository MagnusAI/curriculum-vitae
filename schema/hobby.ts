import { z } from "zod";
import { Id } from "./common";

export const HobbySchema = z.object({
  id: Id,
  name: z.string(),
  description: z.string(),
});

export const HobbiesSchema = z.array(HobbySchema);

export type Hobby = z.infer<typeof HobbySchema>;
