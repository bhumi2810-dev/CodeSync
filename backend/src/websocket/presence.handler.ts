import { WebSocket } from "ws";

export interface UserPresence {
  userId: string;
  name: string;
  email: string;
  socket: WebSocket;
  joinedAt: Date;
}

// In-memory presence map: roomId -> Map<userId, Set<UserPresence>>
const roomPresenceMap = new Map<string, Map<string, UserPresence>>();

export function addUserPresence(
  roomId: string,
  userId: string,
  name: string,
  email: string,
  socket: WebSocket
) {
  if (!roomPresenceMap.has(roomId)) {
    roomPresenceMap.set(roomId, new Map());
  }

  const userMap = roomPresenceMap.get(roomId)!;
  userMap.set(userId, {
    userId,
    name,
    email,
    socket,
    joinedAt: new Date(),
  });

  broadcastPresenceUpdate(roomId);
}

export function removeUserPresence(roomId: string, socket: WebSocket) {
  const userMap = roomPresenceMap.get(roomId);
  if (!userMap) return;

  for (const [userId, presence] of userMap.entries()) {
    if (presence.socket === socket) {
      userMap.delete(userId);
      break;
    }
  }

  if (userMap.size === 0) {
    roomPresenceMap.delete(roomId);
  } else {
    broadcastPresenceUpdate(roomId);
  }
}

export function getRoomOnlineUsersList(roomId: string) {
  const userMap = roomPresenceMap.get(roomId);
  if (!userMap) return [];

  const users: Array<{ id: string; name: string; email: string; online: boolean }> = [];
  for (const presence of userMap.values()) {
    users.push({
      id: presence.userId,
      name: presence.name,
      email: presence.email,
      online: true,
    });
  }
  return users;
}

export function getRoomSockets(roomId: string): WebSocket[] {
  const userMap = roomPresenceMap.get(roomId);
  if (!userMap) return [];

  const sockets: WebSocket[] = [];
  for (const presence of userMap.values()) {
    if (presence.socket.readyState === WebSocket.OPEN) {
      sockets.push(presence.socket);
    }
  }
  return sockets;
}

export function broadcastToRoom(roomId: string, message: any, excludeSocket?: WebSocket) {
  const sockets = getRoomSockets(roomId);
  const data = typeof message === "string" ? message : JSON.stringify(message);

  for (const socket of sockets) {
    if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(data);
      } catch (err) {
        console.error("Error broadcasting to socket:", err);
      }
    }
  }
}

export function broadcastPresenceUpdate(roomId: string) {
  const onlineUsers = getRoomOnlineUsersList(roomId);
  broadcastToRoom(roomId, {
    type: "PRESENCE_STATE",
    users: onlineUsers,
  });
}
