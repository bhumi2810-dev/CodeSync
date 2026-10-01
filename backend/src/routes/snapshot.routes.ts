import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { create, list, getById } from "../controllers/snapshot.controller";

const router = Router({ mergeParams: true });

router.post("/", authenticate, create);
router.get("/", authenticate, list);
router.get("/:snapshotId", authenticate, getById);

export default router;
