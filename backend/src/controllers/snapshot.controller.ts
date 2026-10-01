import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createSnapshotSchema } from "../validators/snapshot.validator";
import {
  createSnapshot,
  getSnapshots,
  getSnapshotById,
} from "../services/snapshot.service";

export async function create(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const parsed = createSnapshotSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const snapshot = await createSnapshot(
      roomId,
      req.user!.userId,
      parsed.data
    );

    return res.status(201).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error("Create snapshot error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const snapshots = await getSnapshots(roomId);

    return res.status(200).json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    console.error("List snapshots error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const snapshotId = String(req.params.snapshotId);
    const snapshot = await getSnapshotById(roomId, snapshotId);

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error: any) {
    if (error.message === "Snapshot not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get snapshot error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
