import { z } from "zod";

export const executeCodeSchema = z.object({
  language: z.string().min(1, "Language is required"),
  code: z.string(),
});

export type ExecuteCodeInput = z.infer<typeof executeCodeSchema>;
