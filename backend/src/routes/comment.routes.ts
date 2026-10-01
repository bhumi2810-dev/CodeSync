import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  create,
  list,
  resolve,
  remove,
} from "../controllers/comment.controller";

const router = Router({ mergeParams: true });

router.post("/", authenticate, create);
router.get("/", authenticate, list);
router.patch("/:commentId/resolve", authenticate, resolve);
router.delete("/:commentId", authenticate, remove);

export default router;
