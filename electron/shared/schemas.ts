import { z } from "zod";

export const importConfSchema = z.object({
  name: z.string().min(1).max(80),
  conf: z.string().min(20)
});

export type ImportConfInput = z.infer<typeof importConfSchema>;
