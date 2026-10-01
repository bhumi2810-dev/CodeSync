const http = require("http");

function request(path, method = "GET", data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      "Content-Type": "application/json",
    };
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAudit() {
  const results = [];
  console.log("=== STARTING FULL CODESYNC FEATURE AUDIT ===\n");

  // 1. Health Check
  const health = await request("/health");
  results.push({
    feature: "Health Check",
    passed: health.status === 200,
    details: JSON.stringify(health.data),
  });

  // 2. Authentication - User Signup
  const uniqueEmail = `auditor_${Date.now()}@codesync.io`;
  const signup = await request("/api/auth/signup", "POST", {
    name: "CodeSync Auditor",
    email: uniqueEmail,
    password: "Password@123",
  });
  const token = signup.data?.token || signup.data?.data?.token;
  results.push({
    feature: "User Signup (JWT Auth)",
    passed: (signup.status === 200 || signup.status === 201) && !!token,
    details: `Signed up ${uniqueEmail}`,
  });

  // 3. User Login
  const login = await request("/api/auth/login", "POST", {
    email: uniqueEmail,
    password: "Password@123",
  });
  const activeToken = login.data?.token || login.data?.data?.token;
  results.push({
    feature: "User Login (JWT Auth)",
    passed: login.status === 200 && !!activeToken,
    details: `Authenticated user ${login.data?.user?.name || login.data?.data?.user?.name}`,
  });

  // 4. User Profile / Me
  const me = await request("/api/auth/me", "GET", null, activeToken);
  results.push({
    feature: "User Profile (/api/auth/me)",
    passed: me.status === 200 && (me.data?.success || !!me.data?.data?.email),
    details: me.data?.data?.email || me.data?.user?.email,
  });

  // 5. Create Workspace Room
  const createRoom = await request(
    "/api/rooms",
    "POST",
    { name: `Audit Workspace ${Date.now()}` },
    activeToken
  );
  const roomId = createRoom.data?.data?.id || createRoom.data?.id;
  results.push({
    feature: "Create Room / Workspace",
    passed: (createRoom.status === 200 || createRoom.status === 201) && !!roomId,
    details: `Room ID: ${roomId}`,
  });

  // 6. Get User Rooms List (Dashboard)
  const listRooms = await request("/api/rooms", "GET", null, activeToken);
  results.push({
    feature: "List Rooms / Dashboard Feed",
    passed: listRooms.status === 200 && Array.isArray(listRooms.data?.data || listRooms.data),
    details: `Total user rooms: ${(listRooms.data?.data || listRooms.data)?.length}`,
  });

  // 7. Get Room Details
  const roomDetails = await request(`/api/rooms/${roomId}`, "GET", null, activeToken);
  results.push({
    feature: "Get Room Details",
    passed: roomDetails.status === 200,
    details: `Room Name: ${roomDetails.data?.data?.name || roomDetails.data?.name}`,
  });

  // 8. Snapshots - Create Snapshot
  const snapCreate = await request(
    `/api/rooms/${roomId}/snapshots`,
    "POST",
    {
      content: 'console.log("Audit snapshot content");',
      message: "Initial version",
      isAutoSave: false,
    },
    activeToken
  );
  results.push({
    feature: "Create Workspace Snapshot",
    passed: (snapCreate.status === 200 || snapCreate.status === 201) && snapCreate.data?.success,
    details: `Snapshot msg: ${snapCreate.data?.data?.message}`,
  });

  // 9. Snapshots - List Snapshots
  const snapList = await request(`/api/rooms/${roomId}/snapshots`, "GET", null, activeToken);
  results.push({
    feature: "List Workspace Snapshots",
    passed: snapList.status === 200 && (snapList.data?.data?.length > 0 || snapList.data?.length > 0),
    details: `Saved snapshots: ${(snapList.data?.data || snapList.data)?.length}`,
  });

  // 10. Chat Messages - Send Message
  const chatSend = await request(
    `/api/rooms/${roomId}/chat`,
    "POST",
    { content: "Auditor testing live chat message." },
    activeToken
  );
  results.push({
    feature: "Send Chat Message",
    passed: (chatSend.status === 200 || chatSend.status === 201) && chatSend.data?.success,
    details: `Sent: "${chatSend.data?.data?.content}"`,
  });

  // 11. Chat Messages - List Messages
  const chatList = await request(`/api/rooms/${roomId}/chat`, "GET", null, activeToken);
  results.push({
    feature: "List Chat Messages",
    passed: chatList.status === 200 && (chatList.data?.data?.length > 0 || chatList.data?.length > 0),
    details: `Messages: ${(chatList.data?.data || chatList.data)?.length}`,
  });

  // 12. Code Review - Add Inline Comment
  const commentAdd = await request(
    `/api/rooms/${roomId}/comments`,
    "POST",
    {
      lineNumber: 10,
      type: "SUGGESTION",
      content: "Consider adding type annotations here.",
    },
    activeToken
  );
  const commentId = commentAdd.data?.data?.id || commentAdd.data?.id;
  results.push({
    feature: "Code Review / Add Inline Comment",
    passed: (commentAdd.status === 200 || commentAdd.status === 201) && !!commentId,
    details: `Created comment ID: ${commentId}`,
  });

  // 13. Code Review - List Comments
  const commentList = await request(`/api/rooms/${roomId}/comments`, "GET", null, activeToken);
  results.push({
    feature: "Code Review / List Comments",
    passed: commentList.status === 200 && (commentList.data?.data?.length > 0 || commentList.data?.length > 0),
    details: `Total comments: ${(commentList.data?.data || commentList.data)?.length}`,
  });

  // 14. Notifications System
  const notifs = await request("/api/notifications", "GET", null, activeToken);
  results.push({
    feature: "Notifications System",
    passed: notifs.status === 200,
    details: `Fetched notifications: ${(notifs.data?.data || notifs.data)?.length || 0}`,
  });

  // 15. Code Execution: JavaScript
  const execJs = await request(
    "/api/execute",
    "POST",
    { language: "javascript", code: "console.log('Result:', 7 * 6);" },
    activeToken
  );
  results.push({
    feature: "Code Execution: JavaScript",
    passed: execJs.status === 200 && (execJs.data?.output || execJs.data?.data?.output)?.includes("42"),
    details: `Output: ${execJs.data?.output || execJs.data?.data?.output}`,
  });

  // 16. Code Execution: Python
  const execPy = await request(
    "/api/execute",
    "POST",
    { language: "python", code: "print('Result:', 7 * 6)" },
    activeToken
  );
  results.push({
    feature: "Code Execution: Python",
    passed: execPy.status === 200 && (execPy.data?.output || execPy.data?.data?.output)?.includes("42"),
    details: `Output: ${execPy.data?.output || execPy.data?.data?.output}`,
  });

  // 17. Code Execution: Java
  const execJava = await request(
    "/api/execute",
    "POST",
    {
      language: "java",
      code: 'public class Main { public static void main(String[] args) { System.out.println("Result: " + (7 * 6)); } }',
    },
    activeToken
  );
  results.push({
    feature: "Code Execution: Java",
    passed: execJava.status === 200 && (execJava.data?.output || execJava.data?.data?.output)?.includes("42"),
    details: `Output: ${execJava.data?.output || execJava.data?.data?.output}`,
  });

  console.log("\n=== COMPREHENSIVE FEATURE AUDIT SUMMARY ===");
  let passedCount = 0;
  for (const r of results) {
    const mark = r.passed ? "✔ PASS" : "✖ FAIL";
    if (r.passed) passedCount++;
    console.log(`${mark} | ${r.feature.padEnd(36)} | ${r.details}`);
  }
  console.log(`\nResult: ${passedCount}/${results.length} features passed.`);
}

runAudit().catch(console.error);
