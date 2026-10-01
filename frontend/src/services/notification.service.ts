import api from "./api";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "ROOM_JOIN" | "COMMENT" | "CHAT" | "SNAPSHOT" | "SYSTEM" | string;
  title: string;
  message: string;
  roomId?: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationsResponse> {
    const res = await api.get("/api/notifications");
    return res.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; data: NotificationItem }> {
    const res = await api.patch(`/api/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const res = await api.patch("/api/notifications/read-all");
    return res.data;
  },

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/api/notifications/${id}`);
    return res.data;
  },
};
