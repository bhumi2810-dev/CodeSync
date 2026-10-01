import { prisma } from "../lib/prisma";
import { CreateRoomInput } from "../validators/room.validator";
import { getRoomOnlineUsersList } from "../websocket/presence.handler";
import { createNotification } from "./notification.service";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CS-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createRoom(input: CreateRoomInput, ownerId: string) {
  let uniqueCode = generateRoomCode();
  // Ensure uniqueness
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.room.findUnique({ where: { code: uniqueCode } });
    if (!existing) break;
    uniqueCode = generateRoomCode();
  }

  const room = await prisma.room.create({
    data: {
      name: input.name,
      code: uniqueCode,
      isBeginnerMode: input.isBeginnerMode ?? false,
      ownerId,
      memberships: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  return room;
}

export async function joinRoom(roomIdOrCode: string, userId: string) {
  const room = await prisma.room.findFirst({
    where: {
      OR: [
        { id: roomIdOrCode },
        { code: roomIdOrCode.toUpperCase() },
        { code: roomIdOrCode },
      ],
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  const existingMembership = await prisma.roomMembership.findFirst({
    where: { roomId: room.id, userId },
  });

  if (existingMembership) {
    return {
      ...existingMembership,
      alreadyMember: true,
      room,
    };
  }

  const membership = await prisma.roomMembership.create({
    data: {
      roomId: room.id,
      userId,
      role: "EDITOR",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Notify room owner if someone else joined
  if (room.ownerId !== userId) {
    const joiningUserName = membership.user?.name || "A collaborator";
    createNotification({
      userId: room.ownerId,
      type: "ROOM_JOIN",
      title: "New Collaborator Joined",
      message: `${joiningUserName} joined your room "${room.name}"`,
      roomId: room.id,
    }).catch((err) => console.warn("Could not create join notification:", err));
  }

  return {
    ...membership,
    room,
  };
}

export async function getUserRooms(userId: string) {
  const rooms = await prisma.room.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      _count: {
        select: { memberships: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rooms.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    ownerId: r.ownerId,
    owner: r.owner,
    isBeginnerMode: r.isBeginnerMode,
    createdAt: r.createdAt,
    membersCount: r._count.memberships,
    memberships: r.memberships,
  }));
}

export async function getRoomById(roomIdOrCode: string) {
  const room = await prisma.room.findFirst({
    where: {
      OR: [
        { id: roomIdOrCode },
        { code: roomIdOrCode.toUpperCase() },
        { code: roomIdOrCode },
      ],
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      _count: {
        select: { memberships: true, comments: true, snapshots: true },
      },
    },
  });

  if (!room) return null;

  return {
    ...room,
    membersCount: room._count.memberships,
  };
}

export async function getOnlineUsers(roomId: string) {
  return getRoomOnlineUsersList(roomId);
}

export async function deleteRoom(roomIdOrCode: string, userId: string) {
  const room = await prisma.room.findFirst({
    where: {
      OR: [
        { id: roomIdOrCode },
        { code: roomIdOrCode.toUpperCase() },
        { code: roomIdOrCode },
      ],
    },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  if (room.ownerId !== userId) {
    throw new Error("Forbidden: Only the room owner can delete this room");
  }

  await prisma.room.delete({
    where: { id: room.id },
  });

  return { success: true, message: "Room deleted successfully" };
}



