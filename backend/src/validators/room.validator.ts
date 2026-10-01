import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(2, "Room name must be at least 2 characters"),
  isBeginnerMode: z.boolean().optional().default(false),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;