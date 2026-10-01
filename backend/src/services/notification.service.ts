import { prisma } from "../lib/prisma";

export interface CreateNotificationInput {
  userId: string;
  type: "ROOM_JOIN" | "COMMENT" | "CHAT" | "SNAPSHOT" | "SYSTEM" | string;
  title: string;
  message: string;
  roomId?: string;
}

export async function createNotification(data: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        roomId: data.roomId,
      },
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.notification.count({
      where: { userId, read: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
  };
}

export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return updated;
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return { success: true, message: "All notifications marked as read" };
}

export async function deleteNotification(id: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  await prisma.notification.delete({
    where: { id },
  });

  return { success: true, message: "Notification deleted" };
}
