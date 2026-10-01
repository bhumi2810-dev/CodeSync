import { z } from "zod";

export const createChatMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty"),
});

export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
