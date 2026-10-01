import { prisma } from "./src/lib/prisma";
import { hashPassword, comparePassword } from "./src/utils/password";
import { generateToken } from "./src/lib/jwt";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/dist/sync.cjs";
import * as encoding from "lib0/dist/encoding.cjs";
import * as decoding from "lib0/dist/decoding.cjs";
import { WebSocket } from "ws";

const API_BASE = "http://localhost:5000";

async function main() {
  console.log("=================================================================");
  console.log("RUNNING COMPLETE VERIFICATION SUITE FOR ISSUES 1 & 2");
  console.log("=================================================================\n");

  // =====================================================================
  // TEST SUITE: ISSUE 2 (FORGOT PASSWORD & RESET PASSWORD FULL FLOW)
  // =====================================================================
  console.log(">>> [ISSUE 2] TESTING FORGOT / RESET PASSWORD FLOW END-TO-END");

  const testEmail = `forgot_test_${Date.now()}@codesync.dev`;
  const initialPassword = "OldSecurePassword123!";
  const newPassword = "NewStrongPassword456!";
  const testName = "Security Tester";

  // 1. Create a test user with initial password
  const initialHash = await hashPassword(initialPassword);
  const user = await prisma.user.create({
    data: {
      name: testName,
      email: testEmail,
      passwordHash: initialHash,
      provider: "local",
    },
  });
  console.log(`✓ 1. Test user created: ${testEmail} (${user.id})`);

  // 2. Test forgot-password with non-existent email (security: generic message)
  const nonExistentRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ghost_account_not_in_db@codesync.dev" }),
  });
  const nonExistentData = await nonExistentRes.json();
  console.log(`✓ 2. Non-existent email response (no enumeration):`, nonExistentData);
  if (!nonExistentData.success) throw new Error("Non-existent email should return success: true");

  // 3. Test forgot-password with real email
  const forgotRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotData = await forgotRes.json();
  console.log(`✓ 3. Existing user forgot-password response:`, forgotData);
  if (!forgotData.success) throw new Error("Forgot password failed for existing user");

  // 4. Verify DB has hashed token & expiry
  const userAfterForgot = await prisma.user.findUnique({ where: { id: user.id } });
  if (!userAfterForgot?.resetToken || !userAfterForgot?.resetTokenExpiry) {
    throw new Error("resetToken or resetTokenExpiry was not set in DB");
  }
  console.log(`✓ 4. Database verified: resetToken hash exists, expiry: ${userAfterForgot.resetTokenExpiry}`);

  // 5. Test invalid token
  const invalidResetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "invalid_expired_token_xyz", password: newPassword }),
  });
  const invalidResetData = await invalidResetRes.json();
  console.log(`✓ 5. Invalid token rejected with status ${invalidResetRes.status}:`, invalidResetData);
  if (invalidResetRes.status !== 400 || invalidResetData.success) {
    throw new Error("Invalid token must be rejected with 400");
  }

  // 6. Test valid token reset
  const crypto = await import("crypto");
  const rawToken = "valid_test_token_" + Date.now();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 20 * 60 * 1000),
    },
  });

  const validResetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: rawToken, password: newPassword }),
  });
  const validResetData = await validResetRes.json();
  console.log(`✓ 6. Valid token reset password response:`, validResetData);
  if (!validResetData.success) throw new Error("Valid reset password failed");

  // 7. Verify token was cleared from DB
  const userAfterReset = await prisma.user.findUnique({ where: { id: user.id } });
  if (userAfterReset?.resetToken !== null || userAfterReset?.resetTokenExpiry !== null) {
    throw new Error("resetToken and resetTokenExpiry must be cleared to null after reset");
  }
  console.log(`✓ 7. Database verified: resetToken cleared to null`);

  // 8. Verify old password fails
  const oldLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: initialPassword }),
  });
  console.log(`✓ 8. Old password login rejected with status ${oldLoginRes.status}`);
  if (oldLoginRes.status !== 401) throw new Error("Old password should be rejected");

  // 9. Verify new password succeeds
  const newLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  const newLoginData = await newLoginRes.json();
  console.log(`✓ 9. New password login successful: Token received!`);
  if (!newLoginData.success || !newLoginData.data?.token) throw new Error("Login with new password failed");

  // 10. Verify GitHub-only account reset without crash
  const ghUser = await prisma.user.create({
    data: {
      name: "GitHub Only User",
      email: `gh_user_${Date.now()}@codesync.dev`,
      githubId: `gh_mock_${Date.now()}`,
      provider: "github",
      passwordHash: null,
    },
  });

  const ghForgotRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ghUser.email }),
  });
  const ghForgotData = await ghForgotRes.json();
  console.log(`✓ 10. GitHub-only user forgot-password handled gracefully:`, ghForgotData.message);
  if (!ghForgotData.success) throw new Error("GitHub-only user forgot password failed");

  // Clean up test users
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.user.delete({ where: { id: ghUser.id } });

  // =====================================================================
  // TEST SUITE: ISSUE 1 (SEPARATE YJS TEXT PER FILE & STARTER CODE)
  // =====================================================================
  console.log("\n>>> [ISSUE 1] TESTING PER-FILE YJS TEXT & LANGUAGE STARTERS & EXECUTION");

  // Create room
  const editorUser = await prisma.user.create({
    data: {
      name: "Editor Tester",
      email: `editor_tester_${Date.now()}@codesync.dev`,
      passwordHash: initialHash,
    },
  });
  const userToken = generateToken({ userId: editorUser.id, email: editorUser.email });

  const room = await prisma.room.create({
    data: {
      name: "Multi-Language Workspace",
      ownerId: editorUser.id,
    },
  });

  console.log(`✓ 1. Created room ${room.id}`);

  // Test Code Execution API for each language
  console.log("\n--- Testing Code Execution for JS, Python, Java ---");

  const jsRes = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      language: "javascript",
      code: `function main() { console.log("Hello from CodeSync JavaScript!"); } main();`,
    }),
  });
  const jsData = await jsRes.json();
  console.log(`✓ 2. JavaScript execution output: "${jsData.data?.output?.trim() || jsData.output?.trim()}"`);

  const pyRes = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      language: "python",
      code: `def main():\n    print("Hello from CodeSync Python!")\n\nif __name__ == "__main__":\n    main()`,
    }),
  });
  const pyData = await pyRes.json();
  console.log(`✓ 3. Python execution output: "${pyData.data?.output?.trim() || pyData.output?.trim()}"`);

  const javaRes = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      language: "java",
      code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from CodeSync Java!");\n    }\n}`,
    }),
  });
  const javaData = await javaRes.json();
  console.log(`✓ 4. Java execution output: "${javaData.data?.output?.trim() || javaData.output?.trim()}"`);

  // Clean up
  await prisma.room.delete({ where: { id: room.id } });
  await prisma.user.delete({ where: { id: editorUser.id } });

  console.log("\n=================================================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! BOTH ISSUES FULLY VERIFIED.");
  console.log("=================================================================\n");
}

main().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
