import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../lib/jwt";
import { SignupInput, LoginInput, UpdateProfileInput } from "../validators/auth.validator";
import { env } from "../config/env";
import { sendPasswordResetEmail } from "./email.service";

export async function signupUser(input: SignupInput) {
  const normalizedEmail = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      provider: "local",
    },
  });

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const normalizedEmail = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new Error("This account was created with GitHub. Please sign in with GitHub.");
  }

  const isValid = await comparePassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
    },
    token,
  };
}

export function generateOAuthState(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  return jwt.sign({ purpose: "oauth_github_csrf", nonce }, env.JWT_SECRET, {
    expiresIn: "10m",
  });
}

export function verifyOAuthState(state: string): boolean {
  try {
    const decoded = jwt.verify(state, env.JWT_SECRET) as any;
    return !!decoded && decoded.purpose === "oauth_github_csrf";
  } catch {
    return false;
  }
}

export async function getGithubOAuthUrl(customState?: string) {
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return {
      configured: false,
      url: "",
      message: "GITHUB_CLIENT_ID is not configured in backend .env",
    };
  }

  const redirectUri = env.GITHUB_CALLBACK_URL;
  const state = customState || generateOAuthState();
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email&prompt=select_account&state=${encodeURIComponent(
    state
  )}`;

  return {
    configured: true,
    url,
  };
}

export async function handleGithubOAuthCallback(code: string) {
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const redirectUri = env.GITHUB_CALLBACK_URL;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GitHub OAuth credentials missing. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend/.env"
    );
  }

  // 1. Exchange authorization code for access_token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error || !tokenData.access_token) {
    throw new Error(
      tokenData.error_description || tokenData.error || "Failed to exchange GitHub authorization code"
    );
  }

  const accessToken = tokenData.access_token;

  // 2. Fetch User Profile from GitHub API
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "CodeSync-App",
      Accept: "application/vnd.github.v3+json",
    },
  });

  const ghUser = await userRes.json();
  if (!ghUser || ghUser.message || !ghUser.id) {
    throw new Error(ghUser?.message || "Failed to retrieve GitHub user details");
  }

  const githubId = String(ghUser.id);
  const name = ghUser.name || ghUser.login || "GitHub User";
  let email = ghUser.email;
  const avatarUrl = ghUser.avatar_url || null;

  // 3. If primary email is private, fetch from emails endpoint
  if (!email) {
    try {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "CodeSync-App",
          Accept: "application/vnd.github.v3+json",
        },
      });
      const emails = await emailsRes.json();
      if (Array.isArray(emails)) {
        const primaryEmail =
          emails.find((e: any) => e.primary && e.verified) ||
          emails.find((e: any) => e.verified) ||
          emails[0];
        if (primaryEmail?.email) {
          email = primaryEmail.email;
        }
      }
    } catch (e) {
      console.warn("Could not fetch GitHub private emails:", e);
    }
  }

  if (!email) {
    email = `${ghUser.login || `gh_${githubId}`}@users.noreply.github.com`;
  }

  email = email.toLowerCase();

  // 4. Look up existing user by githubId or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ githubId }, { email }],
    },
  });

  if (user) {
    // Update missing fields (e.g. link githubId if user previously signed up via email/password)
    const updateData: { githubId?: string; avatarUrl?: string; name?: string } = {};
    if (!user.githubId) {
      updateData.githubId = githubId;
    }
    if (!user.avatarUrl && avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }
    if (!user.name && name) {
      updateData.name = name;
    }

    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  } else {
    // Create a new GitHub OAuth account
    user = await prisma.user.create({
      data: {
        name,
        email,
        githubId,
        provider: "github",
        avatarUrl,
        passwordHash: null,
      },
    });
  }

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
    },
    token,
  };
}

export async function loginWithGithubUser(payload?: {
  code?: string;
  name?: string;
  email?: string;
  githubId?: string;
}) {
  if (payload?.code) {
    return handleGithubOAuthCallback(payload.code);
  }

  // Developer mock payload fallback
  let email = (payload?.email || "github_developer@codesync.dev").toLowerCase();
  let name = payload?.name || "GitHub Developer";
  let githubId = payload?.githubId || "mock_github_123";

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ githubId }, { email }],
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        githubId,
        provider: "github",
        avatarUrl: `https://avatars.githubusercontent.com/u/0?v=4`,
        passwordHash: null,
      },
    });
  }

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
    },
    token,
  };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let devResetUrl: string | undefined;

  if (user) {
    // Generate secure random 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Hash token with SHA-256 for safe DB storage
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    // Token valid for 30 minutes
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Dispatch email
    const emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      name: user.name,
      resetToken: rawToken,
    });

    if (env.NODE_ENV !== "production") {
      devResetUrl = emailResult.resetUrl;
    }
  }

  // Always return the same generic message to prevent account/email enumeration
  return {
    message: "If an account with that email exists, a password reset link has been sent.",
    devResetUrl,
  };
}

export async function resetUserPassword(token: string, newPassword: string) {
  const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired password reset token.");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return {
    message: "Password reset successful. You can now log in with your new password.",
  };
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const updateData: any = {};
  if (input.name !== undefined) {
    updateData.name = input.name.trim();
  }
  if (input.defaultLanguage !== undefined) {
    updateData.defaultLanguage = input.defaultLanguage;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      provider: true,
      githubId: true,
      defaultLanguage: true,
      createdAt: true,
    },
  });

  return user;
}

export async function getUserProfileStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      defaultLanguage: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [roomsCount, commentsCount, snapshotsCount] = await Promise.all([
    prisma.roomMembership.count({
      where: { userId },
    }),
    prisma.comment.count({
      where: { authorId: userId },
    }),
    prisma.codeSnapshot.count({
      where: { createdBy: userId },
    }),
  ]);

  return {
    user,
    stats: {
      roomsCount,
      commentsCount,
      snapshotsCount,
      mostUsedLanguage: user.defaultLanguage || "javascript",
      defaultLanguage: user.defaultLanguage || "javascript",
    },
  };
}

