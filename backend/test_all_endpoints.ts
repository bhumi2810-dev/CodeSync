import http from "http";
import app from "./src/app";
import { setupWebSocketServer } from "./src/websocket/websocket.server";
import { WebSocket } from "ws";

const PORT = 5002; // Use 5002 for testing to avoid collisions
const server = http.createServer(app);
setupWebSocketServer(server);

async function runTests() {
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`\n==============================================`);
  console.log(`    CodeSync Backend Test Suite Running on Port ${PORT}`);
  console.log(`==============================================\n`);

  const baseUrl = `http://localhost:${PORT}`;
  const wsUrl = `ws://localhost:${PORT}`;

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name} -> Error: ${err.message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testEmail1 = `user1_${timestamp}@example.com`;
  const testEmail2 = `user2_${timestamp}@example.com`;
  let token1 = "";
  let user1Id = "";
  let token2 = "";
  let user2Id = "";
  let testRoomId = "";
  let testCommentId = "";
  let testSnapshotId = "";

  // 1. POST /api/auth/signup (User 1)
  await test("POST /api/auth/signup (User 1)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User 1",
        email: testEmail1,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data.token) {
      throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(data)}`);
    }
    token1 = data.data.token;
    user1Id = data.data.user.id;
  });

  // 2. POST /api/auth/signup (Duplicate Email -> 409)
  await test("POST /api/auth/signup (Duplicate Email returns 409)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Duplicate User",
        email: testEmail1,
        password: "password123",
      }),
    });
    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${res.status}`);
    }
  });

  // 3. POST /api/auth/signup (User 2)
  await test("POST /api/auth/signup (User 2)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User 2",
        email: testEmail2,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    token2 = data.data.token;
    user2Id = data.data.user.id;
  });

  // 4. POST /api/auth/login (Correct credentials)
  await test("POST /api/auth/login (Valid credentials)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail1,
        password: "password123",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.data.token) {
      throw new Error(`Login failed with status ${res.status}`);
    }
  });

  // 5. POST /api/auth/login (Invalid credentials -> 401)
  await test("POST /api/auth/login (Invalid password returns 401)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail1,
        password: "wrongpassword",
      }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 6. GET /api/auth/me (With Bearer Token)
  await test("GET /api/auth/me", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.email !== testEmail1) {
      throw new Error(`Expected user email ${testEmail1}, got: ${JSON.stringify(data)}`);
    }
  });

  // 7. POST /api/rooms (Create Room)
  await test("POST /api/rooms (Create Room)", async () => {
    const res = await fetch(`${baseUrl}/api/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        name: "Test Room Full Stack",
        isBeginnerMode: false,
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data.id) {
      throw new Error(`Room creation failed: ${JSON.stringify(data)}`);
    }
    testRoomId = data.data.id;
  });

  // 8. POST /api/rooms/:roomId/join (User 2 joins Room)
  await test("POST /api/rooms/:roomId/join (User 2 joins)", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token2}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.data) {
      throw new Error(`Join room failed: ${JSON.stringify(data)}`);
    }
  });

  // 9. GET /api/rooms (List user rooms)
  await test("GET /api/rooms (List User Rooms)", async () => {
    const res = await fetch(`${baseUrl}/api/rooms`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error(`List rooms failed: ${JSON.stringify(data)}`);
    }
  });

  // 10. GET /api/rooms/:roomId (Get Room Details)
  await test("GET /api/rooms/:roomId", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.id !== testRoomId) {
      throw new Error(`Get room failed: ${JSON.stringify(data)}`);
    }
  });

  // 11. GET /api/rooms/:roomId/online
  await test("GET /api/rooms/:roomId/online", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/online`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) {
      throw new Error(`Get online users failed: ${JSON.stringify(data)}`);
    }
  });

  // 12. POST /api/rooms/:roomId/comments
  await test("POST /api/rooms/:roomId/comments", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        lineNumber: 5,
        type: "BUG",
        content: "Potential null pointer exception here",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data.id) {
      throw new Error(`Create comment failed: ${JSON.stringify(data)}`);
    }
    testCommentId = data.data.id;
  });

  // 13. GET /api/rooms/:roomId/comments
  await test("GET /api/rooms/:roomId/comments", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/comments`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.length === 0) {
      throw new Error(`Get comments failed: ${JSON.stringify(data)}`);
    }
  });

  // 14. PATCH /api/rooms/:roomId/comments/:commentId/resolve
  await test("PATCH /api/rooms/:roomId/comments/:commentId/resolve", async () => {
    const res = await fetch(
      `${baseUrl}/api/rooms/${testRoomId}/comments/${testCommentId}/resolve`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token1}` },
      }
    );
    const data = await res.json();
    if (res.status !== 200 || !data.data.resolved) {
      throw new Error(`Resolve comment failed: ${JSON.stringify(data)}`);
    }
  });

  // 15. DELETE /api/rooms/:roomId/comments/:commentId (Delete by Author)
  await test("DELETE /api/rooms/:roomId/comments/:commentId (Author deletes)", async () => {
    const res = await fetch(
      `${baseUrl}/api/rooms/${testRoomId}/comments/${testCommentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token1}` },
      }
    );
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Delete comment failed: ${JSON.stringify(data)}`);
    }
  });

  // 16. Chat API & History
  await test("GET /api/rooms/:roomId/chat", async () => {
    // Add a chat message
    await fetch(`${baseUrl}/api/rooms/${testRoomId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ content: "Hello team from REST API!" }),
    });

    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/chat`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.length === 0) {
      throw new Error(`Get chat messages failed: ${JSON.stringify(data)}`);
    }
  });

  // 17. POST /api/rooms/:roomId/snapshots
  await test("POST /api/rooms/:roomId/snapshots", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        content: `console.log("Snapshot version 1");`,
        message: "Initial working version",
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data.id) {
      throw new Error(`Create snapshot failed: ${JSON.stringify(data)}`);
    }
    testSnapshotId = data.data.id;
  });

  // 18. GET /api/rooms/:roomId/snapshots
  await test("GET /api/rooms/:roomId/snapshots", async () => {
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}/snapshots`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.length === 0) {
      throw new Error(`Get snapshots failed: ${JSON.stringify(data)}`);
    }
  });

  // 19. GET /api/rooms/:roomId/snapshots/:snapshotId
  await test("GET /api/rooms/:roomId/snapshots/:snapshotId", async () => {
    const res = await fetch(
      `${baseUrl}/api/rooms/${testRoomId}/snapshots/${testSnapshotId}`,
      {
        headers: { Authorization: `Bearer ${token1}` },
      }
    );
    const data = await res.json();
    if (res.status !== 200 || data.data.id !== testSnapshotId) {
      throw new Error(`Get snapshot by id failed: ${JSON.stringify(data)}`);
    }
  });

  // 20. POST /api/execute (JavaScript)
  await test("POST /api/execute (JavaScript execution)", async () => {
    const res = await fetch(`${baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: "const a = 10; const b = 25; console.log('Result:', a + b);",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.output.includes("Result: 35")) {
      throw new Error(`JS execution failed: ${JSON.stringify(data)}`);
    }
  });

  // 21. POST /api/execute (Python)
  await test("POST /api/execute (Python execution)", async () => {
    const res = await fetch(`${baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        code: "print('Hello from Python execution!')",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || (!data.output.includes("Hello from Python") && data.error && !data.error.includes("Python execution error"))) {
      throw new Error(`Python execution failed: ${JSON.stringify(data)}`);
    }
  });

  // 22. POST /api/execute (Java)
  await test("POST /api/execute (Java execution handled cleanly)", async () => {
    const res = await fetch(`${baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        code: "public class Main { public static void main(String[] args) { System.out.println(\"Hello Java\"); } }",
      }),
    });
    const data = await res.json();
    if (res.status !== 200) {
      throw new Error(`Java execution endpoint failed: ${JSON.stringify(data)}`);
    }
  });

  // 23. GET /api/auth/github/url
  await test("GET /api/auth/github/url (GitHub OAuth URL endpoint)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/github/url`);
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`GitHub OAuth URL endpoint failed: ${JSON.stringify(data)}`);
    }
  });

  // 23b. GET /api/auth/github (Redirect endpoint)
  await test("GET /api/auth/github (Redirects to GitHub or frontend if unconfigured)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/github`, { redirect: "manual" });
    // Should be a 302 redirect (either to GitHub or frontend oauth-success)
    if (res.status !== 302) {
      throw new Error(`Expected 302 redirect, got status: ${res.status}`);
    }
    const location = res.headers.get("location");
    if (!location || (!location.includes("github.com") && !location.includes("oauth-success"))) {
      throw new Error(`Invalid redirect location: ${location}`);
    }
  });

  // 23c. GET /api/auth/github/callback (Rejects missing state / code)
  await test("GET /api/auth/github/callback (Rejects invalid state with redirect)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/github/callback?code=bad_code&state=invalid_state`, {
      redirect: "manual",
    });
    if (res.status !== 302) {
      throw new Error(`Expected 302 redirect for invalid state, got: ${res.status}`);
    }
    const location = res.headers.get("location");
    if (!location || !location.includes("oauth-success") || !location.includes("error")) {
      throw new Error(`Expected error redirect to oauth-success, got: ${location}`);
    }
  });

  // 23d. POST /api/auth/github (OAuth user creation & JWT login)
  let oauthToken = "";
  await test("POST /api/auth/github (OAuth user registration & token issuance)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Octocat Developer",
        email: `octocat_${Date.now()}@github.dev`,
        githubId: `gh_test_${Date.now()}`,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || !data.data.token) {
      throw new Error(`GitHub auth POST failed: ${JSON.stringify(data)}`);
    }
    oauthToken = data.data.token;
  });

  // 23e. GET /api/auth/me (Verify GitHub OAuth user profile)
  await test("GET /api/auth/me (Verify GitHub user profile & metadata)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${oauthToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || data.data.provider !== "github") {
      throw new Error(`Failed to verify OAuth user provider: ${JSON.stringify(data)}`);
    }
  });

  // 24. POST /api/execute (Infinite Loop Timeout)
  await test("POST /api/execute (Infinite loop correctly times out)", async () => {
    const res = await fetch(`${baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        code: "while(true) {}",
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.timedOut) {
      throw new Error(`Infinite loop timeout test failed: ${JSON.stringify(data)}`);
    }
  });

  // 24b. GET /api/notifications (User 1 received notifications for join and comment)
  let testNotifId = "";
  await test("GET /api/notifications (Fetch user notifications & unread count)", async () => {
    const res = await fetch(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) {
      throw new Error(`Get notifications failed: ${JSON.stringify(data)}`);
    }
    if (data.data.length > 0) {
      testNotifId = data.data[0].id;
    }
  });

  // 24c. PATCH /api/notifications/:id/read or read-all
  await test("PATCH /api/notifications/read-all (Mark all notifications as read)", async () => {
    const res = await fetch(`${baseUrl}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Mark all notifications as read failed: ${JSON.stringify(data)}`);
    }
  });


  // 23. WebSocket - Missing token or roomId rejects with 4000
  await test("WebSocket reject missing token/roomId (code 4000)", async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${wsUrl}`);
      ws.on("close", (code) => {
        if (code === 4000) resolve();
        else reject(new Error(`Expected close code 4000, got ${code}`));
      });
      ws.on("error", () => {});
    });
  });

  // 24. WebSocket - Invalid token rejects with 4001
  await test("WebSocket reject invalid token (code 4001)", async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${wsUrl}?token=invalid_jwt&roomId=${testRoomId}`);
      ws.on("close", (code) => {
        if (code === 4001) resolve();
        else reject(new Error(`Expected close code 4001, got ${code}`));
      });
      ws.on("error", () => {});
    });
  });

  // 25. WebSocket - Valid token connects, receives presence & real-time chat
  await test("WebSocket valid token connects & handles real-time messages", async () => {
    return new Promise<void>((resolve, reject) => {
      const ws1 = new WebSocket(`${wsUrl}?token=${token1}&roomId=${testRoomId}`);
      const ws2 = new WebSocket(`${wsUrl}?token=${token2}&roomId=${testRoomId}`);

      let presenceReceived = false;
      let chatReceived = false;

      const timer = setTimeout(() => {
        ws1.close();
        ws2.close();
        if (presenceReceived && chatReceived) resolve();
        else reject(new Error(`Timed out: presence=${presenceReceived}, chat=${chatReceived}`));
      }, 4000);

      ws2.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "PRESENCE_STATE") {
            presenceReceived = true;
          }
          if (msg.type === "MESSAGE_CHAT" && msg.data?.content === "Live WebSocket Chat!") {
            chatReceived = true;
            clearTimeout(timer);
            ws1.close();
            ws2.close();
            resolve();
          }
        } catch (e) {}
      });

      ws1.on("open", () => {
        // Send a chat message after opening
        setTimeout(() => {
          ws1.send(JSON.stringify({ type: "MESSAGE_CHAT", content: "Live WebSocket Chat!" }));
        }, 500);
      });
    });
  });

  // 26. DELETE /api/rooms/:roomId (Owner deletes room)
  await test("DELETE /api/rooms/:roomId (Owner deletes room)", async () => {
    // Non-owner should get 403
    const forbiddenRes = await fetch(`${baseUrl}/api/rooms/${testRoomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token2}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403, got ${forbiddenRes.status}`);
    }

    // Owner should get 200
    const res = await fetch(`${baseUrl}/api/rooms/${testRoomId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token1}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  console.log(`\n==============================================`);
  console.log(`    Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test suite runner crashed:", err);
  server.close();
  process.exit(1);
});
