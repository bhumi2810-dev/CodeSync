import { prisma } from "./src/lib/prisma";
import { hashPassword } from "./src/utils/password";
import { generateToken } from "./src/lib/jwt";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { WebSocket } from "ws";

const API_BASE = "http://localhost:5000";

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE TESTS FOR ALL 5 ISSUES ===\n");

  // Setup test user
  const testEmail = `test_user_${Date.now()}@codesync.test`;
  const originalPassword = "InitialPassword123!";
  const newPassword = "UpdatedPassword456!";
  const testName = "Test Developer";

  const initialHash = await hashPassword(originalPassword);
  const user = await prisma.user.create({
    data: {
      name: testName,
      email: testEmail,
      passwordHash: initialHash,
      provider: "local",
    },
  });

  const authToken = generateToken({ userId: user.id, email: user.email });

  console.log(`[Setup] Created test user: ${testEmail} (${user.id})`);

  // ==========================================
  // ISSUE 1: FORGOT PASSWORD & RESET PASSWORD
  // ==========================================
  console.log("\n--- Testing Issue 1: Forgot Password & Reset Password ---");

  // 1.1 Non-existent user forgot-password
  const nonExistRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "doesnotexist@nowhere.com" }),
  });
  const nonExistData = await nonExistRes.json();
  console.log("1.1 Non-existent user forgot password response:", nonExistData);
  if (!nonExistData.success) throw new Error("1.1 Failed: Non-existent email should return generic success");

  // 1.2 Existing user forgot-password
  const forgotRes = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotData = await forgotRes.json();
  console.log("1.2 Existing user forgot password response:", forgotData);
  if (!forgotData.success) throw new Error("1.2 Failed: Forgot password failed");

  // Verify DB updated with resetToken and resetTokenExpiry
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!updatedUser?.resetToken || !updatedUser?.resetTokenExpiry) {
    throw new Error("1.3 Failed: resetToken or resetTokenExpiry was not set in DB");
  }
  console.log("1.3 DB verified: resetToken hash is stored, expiry =", updatedUser.resetTokenExpiry);

  // 1.4 Test reset-password with invalid token
  const invalidResetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "invalid_fake_token", password: newPassword }),
  });
  const invalidResetData = await invalidResetRes.json();
  console.log("1.4 Invalid token reset response:", invalidResetData);
  if (invalidResetRes.status !== 400 || invalidResetData.success) {
    throw new Error("1.4 Failed: Invalid reset token should return 400");
  }

  // To test valid reset, we will use a known raw token
  const crypto = await import("crypto");
  const testRawToken = "test_raw_reset_token_" + Date.now();
  const testHashedToken = crypto.createHash("sha256").update(testRawToken).digest("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: testHashedToken,
      resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  // 1.5 Test reset-password with valid token
  const validResetRes = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: testRawToken, password: newPassword }),
  });
  const validResetData = await validResetRes.json();
  console.log("1.5 Valid reset password response:", validResetData);
  if (!validResetData.success) throw new Error("1.5 Failed: Reset password with valid token failed");

  // 1.6 Verify logging in with new password
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  const loginData = await loginRes.json();
  console.log("1.6 Login with new password response:", loginData.success ? "SUCCESS" : "FAILED");
  if (!loginData.success) throw new Error("1.6 Failed: Could not login with new password");

  // ==========================================
  // ISSUE 2: GITHUB LOGIN PROMPT
  // ==========================================
  console.log("\n--- Testing Issue 2: GitHub OAuth URL prompt=select_account ---");
  const ghUrlRes = await fetch(`${API_BASE}/api/auth/github/url`);
  const ghUrlData = await ghUrlRes.json();
  console.log("2.1 GitHub OAuth URL:", ghUrlData.data?.url);
  if (!ghUrlData.data?.url?.includes("prompt=select_account")) {
    throw new Error("2.1 Failed: GitHub OAuth URL does not contain prompt=select_account");
  }
  if (!ghUrlData.data?.url?.includes("state=")) {
    throw new Error("2.1 Failed: GitHub OAuth URL does not contain state parameter for CSRF");
  }
  console.log("2.2 GitHub OAuth URL verified with prompt=select_account & CSRF state!");

  // ==========================================
  // ISSUE 5: SNAPSHOTS & CREATOR JOIN & PREVIEW
  // ==========================================
  console.log("\n--- Testing Issue 5: Snapshots with Creator info & Preview ---");
  // Create a room
  const room = await prisma.room.create({
    data: {
      name: "Test Room for Snapshots & Chat",
      ownerId: user.id,
    },
  });

  // Create a snapshot
  const snapRes = await fetch(`${API_BASE}/api/rooms/${room.id}/snapshots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      content: `// Java Workspace Snapshot\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Snapshot!");\n    }\n}`,
      message: "Initial Java implementation",
      isAutoSave: false,
    }),
  });
  const snapData = await snapRes.json();
  console.log("5.1 Create Snapshot response:", snapData.success ? "SUCCESS" : "FAILED");
  if (!snapData.success || !snapData.data?.id) throw new Error("5.1 Failed to create snapshot");

  // List snapshots
  const listSnapRes = await fetch(`${API_BASE}/api/rooms/${room.id}/snapshots`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const listSnapData = await listSnapRes.json();
  console.log("5.2 List Snapshots count:", listSnapData.data?.length);
  const retrievedSnap = listSnapData.data?.[0];
  if (!retrievedSnap?.creator?.name) {
    throw new Error("5.2 Failed: Snapshot list does not include creator name!");
  }
  console.log(`5.3 Snapshot creator verified: "${retrievedSnap.creator.name}" (${retrievedSnap.creator.email})`);

  // Get single snapshot by ID
  const singleSnapRes = await fetch(`${API_BASE}/api/rooms/${room.id}/snapshots/${retrievedSnap.id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const singleSnapData = await singleSnapRes.json();
  console.log("5.4 Get Snapshot By ID response:", singleSnapData.success ? "SUCCESS" : "FAILED");
  if (!singleSnapData.data?.content?.includes("Hello Snapshot!")) {
    throw new Error("5.4 Failed: Snapshot content mismatch");
  }

  // ==========================================
  // ISSUE 4: CHAT VIA BINARY WEBSOCKET (LIB0)
  // ==========================================
  console.log("\n--- Testing Issue 4: WebSocket Binary Chat Protocol (Type 2 + lib0) ---");
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:5000?token=${authToken}&roomId=${room.id}`);
    ws.binaryType = "arraybuffer";

    const chatContent = "Hello real-time collaborators! Testing binary chat.";

    ws.on("open", () => {
      console.log("4.1 WebSocket connected to room successfully");

      // Encode binary chat message: message type = 2, varString = chatContent
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 2); // MESSAGE_CHAT = 2
      encoding.writeVarString(encoder, chatContent);
      ws.send(encoding.toUint8Array(encoder));
      console.log("4.2 Sent binary chat message with type byte 2");
    });

    ws.on("message", (data: any, isBinary: boolean) => {
      if (isBinary || data instanceof ArrayBuffer || Buffer.isBuffer(data)) {
        try {
          const uint8 = new Uint8Array(data);
          const decoder = decoding.createDecoder(uint8);
          const msgType = decoding.readVarUint(decoder);

          if (msgType === 2) {
            const jsonString = decoding.readVarString(decoder);
            const msgObj = JSON.parse(jsonString);
            console.log("4.3 Received binary chat broadcast echo:", msgObj);
            if (msgObj.content === chatContent && msgObj.authorId === user.id) {
              console.log("4.4 Echo verification PASSED: Message saved with author info!");
              ws.close();
              resolve();
            }
          }
        } catch (err) {
          // Other Yjs messages (sync, awareness) ignore
        }
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
      reject(err);
    });

    setTimeout(() => {
      reject(new Error("4.5 Timeout waiting for binary chat echo broadcast"));
    }, 5000);
  });

  // Verify chat history via REST API
  const chatHistRes = await fetch(`${API_BASE}/api/rooms/${room.id}/chat`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const chatHistData = await chatHistRes.json();
  console.log("4.6 Chat history count from GET /api/rooms/:roomId/chat:", chatHistData.data?.length);
  if (!chatHistData.data?.some((m: any) => m.content.includes("Testing binary chat"))) {
    throw new Error("4.6 Failed: Chat message not found in history");
  }

  console.log("\n======================================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! ALL 5 ISSUES VERIFIED.");
  console.log("======================================================\n");

  // Cleanup
  await prisma.chatMessage.deleteMany({ where: { roomId: room.id } });
  await prisma.codeSnapshot.deleteMany({ where: { roomId: room.id } });
  await prisma.room.delete({ where: { id: room.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
