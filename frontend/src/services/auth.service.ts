import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider?: string;
  githubId?: string | null;
  defaultLanguage?: string;
  createdAt?: string;
}

export interface ProfileStats {
  roomsCount: number;
  commentsCount: number;
  snapshotsCount: number;
  mostUsedLanguage: string;
  defaultLanguage: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export const authService = {
  async signup(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post("/api/auth/signup", data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },

  async getGithubOAuthUrl(): Promise<{ success: boolean; data: { configured: boolean; url: string; message?: string } }> {
    const res = await api.get("/api/auth/github/url");
    return res.data;
  },

  async loginWithGithub(data?: { code?: string; name?: string; email?: string }): Promise<AuthResponse> {
    const res = await api.post("/api/auth/github", data || {});
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; data: User }> {
    const res = await api.get("/api/auth/me");
    return res.data;
  },

  async updateProfile(data: { name?: string; defaultLanguage?: string }): Promise<{ success: boolean; data: User }> {
    const res = await api.patch("/api/auth/profile", data);
    return res.data;
  },

  async getProfileStats(): Promise<{ success: boolean; data: { user: User; stats: ProfileStats } }> {
    const res = await api.get("/api/auth/profile/stats");
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/api/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post("/api/auth/reset-password", { token, password });
    return res.data;
  },
};


