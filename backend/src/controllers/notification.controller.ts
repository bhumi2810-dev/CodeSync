import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notification.service";

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const data = await getUserNotifications(userId);
    return res.status(200).json({
      success: true,
      data: data.notifications,
      unreadCount: data.unreadCount,
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);

    const updated = await markNotificationAsRead(id, userId);
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "Notification not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const result = await markAllNotificationsAsRead(userId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function deleteNotif(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const id = String(req.params.id);

    const result = await deleteNotification(id, userId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "Notification not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
