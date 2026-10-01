import { prisma } from "../lib/prisma";
import { CreateSnapshotInput } from "../validators/snapshot.validator";

export async function createSnapshot(
  roomId: string,
  createdBy: string,
  input: CreateSnapshotInput
) {
  const snapshot = await prisma.codeSnapshot.create({
    data: {
      roomId,
      createdBy,
      content: input.content,
      message: input.message,
      isAutoSave: input.isAutoSave ?? false,
    },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return snapshot;
}

export async function getSnapshots(roomId: string) {
  const snapshots = await prisma.codeSnapshot.findMany({
    where: { roomId },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return snapshots;
}

export async function getSnapshotById(roomId: string, snapshotId: string) {
  const snapshot = await prisma.codeSnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      creator: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!snapshot || snapshot.roomId !== roomId) {
    throw new Error("Snapshot not found");
  }

  return snapshot;
}
