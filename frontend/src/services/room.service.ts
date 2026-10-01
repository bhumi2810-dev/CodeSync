import api from "./api";

export interface RoomMembership {
  roomId: string;
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  isBeginnerMode: boolean;
  createdAt: string;
  membersCount?: number;
  memberships?: RoomMembership[];
}

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  online: boolean;
}

export const roomService = {
  async createRoom(data: { name: string; isBeginnerMode?: boolean }): Promise<{ success: boolean; data: Room }> {
    const res = await api.post("/api/rooms", data);
    return res.data;
  },

  async joinRoom(roomId: string): Promise<{ success: boolean; data: RoomMembership }> {
    const res = await api.post(`/api/rooms/${roomId}/join`);
    return res.data;
  },

  async listRooms(): Promise<{ success: boolean; data: Room[] }> {
    const res = await api.get("/api/rooms");
    return res.data;
  },

  async getRoomById(roomId: string): Promise<{ success: boolean; data: Room }> {
    const res = await api.get(`/api/rooms/${roomId}`);
    return res.data;
  },

  async getOnlineUsers(roomId: string): Promise<{ success: boolean; data: OnlineUser[] }> {
    const res = await api.get(`/api/rooms/${roomId}/online`);
    return res.data;
  },

  async deleteRoom(roomId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/api/rooms/${roomId}`);
    return res.data;
  },
};

