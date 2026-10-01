import api from "./api";

export interface Comment {
  id: string;
  roomId: string;
  authorId: string;
  lineNumber: number;
  type: "BUG" | "SUGGESTION" | "EXPLANATION";
  content: string;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export const commentService = {
  async getComments(roomId: string): Promise<{ success: boolean; data: Comment[] }> {
    const res = await api.get(`/api/rooms/${roomId}/comments`);
    return res.data;
  },

  async createComment(
    roomId: string,
    data: { lineNumber: number; type: "BUG" | "SUGGESTION" | "EXPLANATION"; content: string }
  ): Promise<{ success: boolean; data: Comment }> {
    const res = await api.post(`/api/rooms/${roomId}/comments`, data);
    return res.data;
  },

  async resolveComment(roomId: string, commentId: string): Promise<{ success: boolean; data: Comment }> {
    const res = await api.patch(`/api/rooms/${roomId}/comments/${commentId}/resolve`);
    return res.data;
  },

  async deleteComment(roomId: string, commentId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/api/rooms/${roomId}/comments/${commentId}`);
    return res.data;
  },
};
