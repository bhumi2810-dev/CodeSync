import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { URL } from "url";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import {
  addUserPresence,
  removeUserPresence,
} from "./presence.handler";
import { handleYjsConnection } from "./yjs.handler";

export interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  roomId?: string;
  userName?: string;
  userEmail?: string;
}

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: AuthenticatedSocket, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
    const token = url.searchParams.get("token");
    const roomId = url.searchParams.get("roomId");

    if (!token || !roomId) {
      ws.close(4000, "Missing token or roomId");
      return;
    }

    let userId: string;
    let email: string;

    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
      email = decoded.email;
    } catch (error) {
      ws.close(4001, "Invalid or expired token");
      return;
    }

    // Fetch user details from database
    let userName = "User";
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        userName = user.name;
        email = user.email;
      }
    } catch (e) {
      // Continue with token data if DB lookup fails
    }

    ws.userId = userId;
    ws.roomId = roomId;
    ws.userName = userName;
    ws.userEmail = email;

    console.log(`User "${userName}" (${userId}) connected to room ${roomId}`);

    // Register presence
    addUserPresence(roomId, userId, userName, email, ws);

    // Setup Yjs collaboration and chat handling
    handleYjsConnection(ws, roomId, { id: userId, name: userName, email });

    ws.on("close", () => {
      console.log(`User "${userName}" (${userId}) disconnected from room ${roomId}`);
      removeUserPresence(roomId, ws);
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error for user ${userId} in room ${roomId}:`, err);
      removeUserPresence(roomId, ws);
    });
  });

  return wss;
}