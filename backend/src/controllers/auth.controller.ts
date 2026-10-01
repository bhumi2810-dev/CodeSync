import { Request, Response } from "express";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator";
import {
  signupUser,
  loginUser,
  getGithubOAuthUrl,
  verifyOAuthState,
  handleGithubOAuthCallback,
  loginWithGithubUser,
  requestPasswordReset,
  resetUserPassword,
  updateUserProfile,
  getUserProfileStats,
} from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export async function signup(req: Request, res: Response) {
  try {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await signupUser(parsed.data);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === "Email already registered") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await loginUser(parsed.data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === "Invalid email or password" ||
      error.message?.includes("GitHub")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * GET /api/auth/github
 * Initiates the GitHub OAuth flow by redirecting the browser to GitHub's authorization page.
 */
export async function redirectToGithub(_req: Request, res: Response) {
  try {
    const oauthUrlData = await getGithubOAuthUrl();
    if (!oauthUrlData.configured || !oauthUrlData.url) {
      const errorMsg = encodeURIComponent(
        "GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env"
      );
      return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
    }

    return res.redirect(oauthUrlData.url);
  } catch (error: any) {
    console.error("Redirect to GitHub error:", error);
    const errorMsg = encodeURIComponent(error.message || "Failed to initiate GitHub login");
    return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
  }
}

/**
 * GET /api/auth/github/callback
 * Handles the OAuth redirect from GitHub, verifies CSRF state, exchanges code for token, and redirects to frontend.
 */
export async function githubCallback(req: Request, res: Response) {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      const errorMsg = encodeURIComponent(
        String(error_description || error || "GitHub authentication was cancelled.")
      );
      return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
    }

    // Verify anti-CSRF state parameter
    if (!state || typeof state !== "string" || !verifyOAuthState(state)) {
      const errorMsg = encodeURIComponent(
        "Invalid or expired OAuth state parameter (anti-CSRF check failed)."
      );
      return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
    }

    if (!code || typeof code !== "string") {
      const errorMsg = encodeURIComponent("Missing authorization code from GitHub callback.");
      return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
    }

    const result = await handleGithubOAuthCallback(code);

    // Redirect to frontend with JWT token
    return res.redirect(
      `${env.FRONTEND_URL}/oauth-success?token=${encodeURIComponent(result.token)}`
    );
  } catch (error: any) {
    console.error("GitHub callback error:", error);
    const errorMsg = encodeURIComponent(error.message || "Failed to authenticate with GitHub");
    return res.redirect(`${env.FRONTEND_URL}/oauth-success?error=${errorMsg}`);
  }
}

/**
 * GET /api/auth/github/url
 * Returns the GitHub OAuth URL as JSON for clients that want to fetch it programmatically.
 */
export async function getGithubUrl(_req: Request, res: Response) {
  try {
    const result = await getGithubOAuthUrl();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate GitHub OAuth URL",
    });
  }
}

/**
 * POST /api/auth/github
 * Programmatic endpoint to exchange code or log in with GitHub data.
 */
export async function githubAuth(req: Request, res: Response) {
  try {
    const result = await loginWithGithubUser(req.body);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("GitHub auth error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to authenticate with GitHub",
    });
  }
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile including GitHub metadata.
 */
export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        provider: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * POST /api/auth/forgot-password
 * Generates a reset token and sends an email if user exists.
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await requestPasswordReset(parsed.data.email);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request. Please try again.",
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Validates token, hashes new password with bcrypt, and clears reset token.
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await resetUserPassword(parsed.data.token, parsed.data.password);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    if (error.message?.includes("Invalid or expired")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
}

/**
 * PATCH /api/auth/profile
 * Updates user display name and/or default language.
 */
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const updatedUser = await updateUserProfile(req.user!.userId, parsed.data);

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

/**
 * GET /api/auth/profile/stats
 * Returns user profile and calculated workspace stats.
 */
export async function getProfileStats(req: AuthRequest, res: Response) {
  try {
    const statsData = await getUserProfileStats(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: statsData,
    });
  } catch (error: any) {
    console.error("Get profile stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile stats",
    });
  }
}


