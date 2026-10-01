import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createCommentSchema } from "../validators/comment.validator";
import {
  createComment,
  getComments,
  resolveComment,
  deleteComment,
} from "../services/comment.service";
import { prisma } from "../lib/prisma";

export async function create(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const comment = await createComment(roomId, req.user!.userId, parsed.data);

    return res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const comments = await getComments(roomId);

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("List comments error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function resolve(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const commentId = String(req.params.commentId);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { name: true },
    });

    const comment = await resolveComment(
      commentId,
      roomId,
      user?.name || "User"
    );

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    if (error.message === "Comment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Resolve comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const commentId = String(req.params.commentId);
    await deleteComment(commentId, roomId, req.user!.userId);

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    if (error.message === "Comment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete comment error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
