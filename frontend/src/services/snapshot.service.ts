

import api from "./api";

export interface Snapshot {
  id: string;
  roomId: string;
  createdBy: string;
  content: string;
  message?: string | null;
  isAutoSave: boolean;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export const snapshotService = {
  async getSnapshots(roomId: string): Promise<{ success: boolean; data: Snapshot[] }> {
    const res = await api.get(`/api/rooms/${roomId}/snapshots`);
    return res.data;
  },

  async createSnapshot(
    roomId: string,
    data: { content: string; message?: string; isAutoSave?: boolean }
  ): Promise<{ success: boolean; data: Snapshot }> {
    const res = await api.post(`/api/rooms/${roomId}/snapshots`, data);
    return res.data;
  },

  async getSnapshotById(roomId: string, snapshotId: string): Promise<{ success: boolean; data: Snapshot }> {
    const res = await api.get(`/api/rooms/${roomId}/snapshots/${snapshotId}`);
    return res.data;
  },
};
