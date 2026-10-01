import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

export const env = {
  PORT: getEnv("PORT", false) || "5000",
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", false) || "7d",
  REDIS_URL: getEnv("REDIS_URL", false) || "redis://localhost:6379",
  GITHUB_CLIENT_ID: getEnv("GITHUB_CLIENT_ID", false) || "",
  GITHUB_CLIENT_SECRET: getEnv("GITHUB_CLIENT_SECRET", false) || "",
  GITHUB_CALLBACK_URL: getEnv("GITHUB_CALLBACK_URL", false) || "http://localhost:5000/api/auth/github/callback",
  FRONTEND_URL: getEnv("FRONTEND_URL", false) || "http://localhost:5173",
  SMTP_HOST: getEnv("SMTP_HOST", false) || getEnv("EMAIL_HOST", false) || "",
  SMTP_PORT: parseInt(getEnv("SMTP_PORT", false) || getEnv("EMAIL_PORT", false) || "587", 10),
  SMTP_SECURE: getEnv("SMTP_SECURE", false) === "true" || getEnv("EMAIL_SECURE", false) === "true",
  SMTP_USER: getEnv("SMTP_USER", false) || getEnv("EMAIL_USER", false) || "",
  SMTP_PASS: getEnv("SMTP_PASS", false) || getEnv("EMAIL_PASS", false) || "",
  EMAIL_FROM: getEnv("EMAIL_FROM", false) || '"CodeSync" <noreply@codesync.dev>',
};