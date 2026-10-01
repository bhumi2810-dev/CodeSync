import { prisma } from "../lib/prisma";

export async function createChatMessage(
  roomId: string,
  authorId: string,
  content: string
) {
  const message = await prisma.chatMessage.create({
    data: {
      roomId,
      authorId,
      content,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return message;
}

export async function getChatMessages(roomId: string) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages;
}
