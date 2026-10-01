import api from "./api";

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export const chatService = {
  async getChatMessages(roomId: string): Promise<{ success: boolean; data: ChatMessage[] }> {
    const res = await api.get(`/api/rooms/${roomId}/chat`);
    return res.data;
  },

  async sendChatMessage(roomId: string, content: string): Promise<{ success: boolean; data: ChatMessage }> {
    const res = await api.post(`/api/rooms/${roomId}/chat`, { content });
    return res.data;
  },
};
