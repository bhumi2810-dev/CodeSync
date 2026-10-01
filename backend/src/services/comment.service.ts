import { prisma } from "../lib/prisma";
import { CreateCommentInput } from "../validators/comment.validator";
import { createNotification } from "./notification.service";

export async function createComment(
  roomId: string,
  authorId: string,
  input: CreateCommentInput
) {
  const comment = await prisma.comment.create({
    data: {
      roomId,
      authorId,
      lineNumber: input.lineNumber,
      type: input.type,
      content: input.content,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Notify room owner
  prisma.room.findUnique({
    where: { id: roomId },
    select: { ownerId: true, name: true },
  }).then((room) => {
    if (room && room.ownerId !== authorId) {
      const authorName = comment.author?.name || "A collaborator";
      createNotification({
        userId: room.ownerId,
        type: "COMMENT",
        title: "New Code Comment",
        message: `${authorName} commented on line ${input.lineNumber} in "${room.name}"`,
        roomId,
      }).catch((err) => console.warn("Could not create comment notification:", err));
    }
  }).catch(() => {});

  return comment;
}

export async function getComments(roomId: string) {
  const comments = await prisma.comment.findMany({
    where: { roomId },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [{ lineNumber: "asc" }],
  });

  return comments;
}

export async function resolveComment(
  commentId: string,
  roomId: string,
  userName: string
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.roomId !== roomId) {
    throw new Error("Comment not found");
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      resolved: true,
      resolvedBy: userName,
      resolvedAt: new Date(),
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updated;
}

export async function deleteComment(
  commentId: string,
  roomId: string,
  userId: string
) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { room: true },
  });

  if (!comment || comment.roomId !== roomId) {
    throw new Error("Comment not found");
  }

  // Only author or room owner can delete comment
  if (comment.authorId !== userId && comment.room.ownerId !== userId) {
    throw new Error("Forbidden: You can only delete your own comments");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true, message: "Comment deleted" };
}
