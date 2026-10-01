import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createChatMessageSchema } from "../validators/chat.validator";
import { createChatMessage, getChatMessages } from "../services/chat.service";

export async function list(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const messages = await getChatMessages(roomId);

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("List chat messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const parsed = createChatMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const message = await createChatMessage(
      roomId,
      req.user!.userId,
      parsed.data.content
    );

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Create chat message error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
