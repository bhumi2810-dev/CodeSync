# CodeSync

**A Real-Time Collaborative Code Editor & Code Review Platform**

CodeSync lets multiple people write, edit, review, and run code together — live, in one place. Think VS Code Live Share + GitHub Code Review + Discord + an online compiler, all combined.

---

## Why CodeSync?

Developers usually juggle separate tools — an editor to write code, a chat app to talk, GitHub to review, and another tool to run code. CodeSync brings all of this into one unified workspace, making it easier for students, beginners, and teams to collaborate.

---

## Features

- **Authentication** — Secure signup/login with JWT & password hashing
- **Coding Rooms** — Create rooms, invite others, manage roles (Owner/Editor/Viewer)
- **Real-Time Collaborative Editing** — Multiple people editing the same code at once, conflict-free
- **Live Presence** — See who's online in a room
- **Code Review Comments** — Add Bug / Suggestion / Explanation notes on specific lines
- **Real-Time Chat** — Chat with your team inside each room
- **Version History** — Save and revisit older versions of your code
- **Safe Code Execution** — Run code inside secure, isolated Docker containers

---

## Tech Stack

**Frontend:** React (TypeScript), Monaco Editor

**Backend:** Node.js, Express.js (TypeScript)

**Database:** PostgreSQL + Prisma ORM

**Real-Time:** WebSockets, Yjs (CRDT)

**Auth:** JWT, bcrypt

**Code Execution:** Docker + Dockerode

---

## How It Works (High-Level)
Browser (React + Monaco)
│
├── REST API ────► Express ────► PostgreSQL
│
└── WebSocket ───► Real-time sync, chat & presence

Run Code:
Backend ──► Docker Container (isolated, no internet, time-limited) ──► Output


---

## Getting Started

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Server runs on `http://localhost:5000`

### Docker Images (needed for code execution)

```bash
docker build -t codesync-js -f docker/javascript/Dockerfile docker/javascript
docker build -t codesync-python -f docker/python/Dockerfile docker/python
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codesync"
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

## Core API Endpoints

| Feature | Endpoint |
|---|---|
| Signup | `POST /api/auth/signup` |
| Login | `POST /api/auth/login` |
| Create Room | `POST /api/rooms` |
| Join Room | `POST /api/rooms/:roomId/join` |
| Add Comment | `POST /api/rooms/:roomId/comments` |
| Chat History | `GET /api/rooms/:roomId/chat` |
| Save Snapshot | `POST /api/rooms/:roomId/snapshots` |
| Run Code | `POST /api/execute` |

Real-time features (editing, chat, presence) run over WebSocket, not REST.

---

## Security Highlights

- Passwords hashed with bcrypt, never stored in plain text
- JWT-based authentication on all protected routes
- User code runs in isolated Docker containers with no internet access, memory/CPU limits, and a 5-second timeout

---


## License

This project is currently intended for educational purposes.
