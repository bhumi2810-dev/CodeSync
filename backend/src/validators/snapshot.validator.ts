import { z } from "zod";

export const createSnapshotSchema = z.object({
  content: z.string(),
  message: z.string().optional(),
  isAutoSave: z.boolean().optional().default(false),
});

export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
