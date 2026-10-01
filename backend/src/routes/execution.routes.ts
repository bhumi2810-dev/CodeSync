import { Router } from "express";
import { execute } from "../controllers/execution.controller";

const router = Router();

router.post("/", execute);

export default router;
