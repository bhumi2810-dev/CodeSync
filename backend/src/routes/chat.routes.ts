import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { list, create } from "../controllers/chat.controller";

const router = Router({ mergeParams: true });

router.get("/", authenticate, list);
router.post("/", authenticate, create);

export default router;
