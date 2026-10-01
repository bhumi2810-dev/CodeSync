import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("codesync_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired
      const isAuthRoute = error.config?.url?.includes("/api/auth/login") || error.config?.url?.includes("/api/auth/signup");
      if (!isAuthRoute) {
        localStorage.removeItem("codesync_token");
        localStorage.removeItem("codesync_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
