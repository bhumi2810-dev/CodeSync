import { Router } from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  redirectToGithub,
  githubCallback,
  getGithubUrl,
  githubAuth,
  me,
  updateProfile,
  getProfileStats,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Email / Password Auth & Password Reset
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// GitHub OAuth Flow
router.get("/github", redirectToGithub);
router.get("/github/callback", githubCallback);
router.get("/github/url", getGithubUrl);
router.post("/github", githubAuth);

// Current Authenticated User & Profile Management
router.get("/me", authenticate, me);
router.patch("/profile", authenticate, updateProfile);
router.get("/profile/stats", authenticate, getProfileStats);

export default router;