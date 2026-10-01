import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createRoomSchema, joinRoomSchema } from "../validators/room.validator";
import {
  createRoom,
  joinRoom,
  getUserRooms,
  getRoomById,
  getOnlineUsers,
  deleteRoom,
} from "../services/room.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createRoomSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const room = await createRoom(parsed.data, req.user!.userId);

    return res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function join(req: AuthRequest, res: Response) {
  try {
    const parsed = joinRoomSchema.safeParse(req.params);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const membership = await joinRoom(parsed.data.roomId, req.user!.userId);

    return res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error: any) {
    if (error.message === "Room not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Join room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const rooms = await getUserRooms(req.user!.userId);
    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("List rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const room = await getRoomById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getOnline(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const onlineUsers = await getOnlineUsers(roomId);

    return res.status(200).json({
      success: true,
      data: onlineUsers,
    });
  } catch (error) {
    console.error("Get online users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const result = await deleteRoom(roomId, req.user!.userId);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Room not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message?.includes("Forbidden")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

