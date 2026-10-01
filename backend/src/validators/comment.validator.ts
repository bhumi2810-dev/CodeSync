import { z } from "zod";

export const createCommentSchema = z.object({
  lineNumber: z.number().int().min(1, "Line number must be a positive integer"),
  type: z.enum(["BUG", "SUGGESTION", "EXPLANATION"]).default("SUGGESTION"),
  content: z.string().min(1, "Comment content cannot be empty"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
