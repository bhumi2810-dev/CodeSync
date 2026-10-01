import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import roomRoutes from "./routes/room.routes";
import executionRoutes from "./routes/execution.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

// CORS configuration allowing all origins in development
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "CodeSync server running" });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executionRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;