import { Router } from "express";
import {
  create,
  join,
  list,
  getById,
  getOnline,
  remove,
} from "../controllers/room.controller";
import { authenticate } from "../middleware/auth.middleware";
import commentRoutes from "./comment.routes";
import chatRoutes from "./chat.routes";
import snapshotRoutes from "./snapshot.routes";

const router = Router();

router.post("/", authenticate, create);
router.get("/", authenticate, list);
router.post("/:roomId/join", authenticate, join);
router.get("/:roomId", authenticate, getById);
router.get("/:roomId/online", authenticate, getOnline);
router.delete("/:roomId", authenticate, remove);

router.use("/:roomId/comments", commentRoutes);
router.use("/:roomId/chat", chatRoutes);
router.use("/:roomId/snapshots", snapshotRoutes);

export default router;