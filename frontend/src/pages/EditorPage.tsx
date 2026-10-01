import { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  FiCode,
  FiMessageSquare,
  FiUsers,
  FiX,
  FiClock,
} from "react-icons/fi";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";

import { useAuth } from "../context/AuthContext";
import { roomService } from "../services/room.service";
import type { Room, OnlineUser } from "../services/room.service";
import { snapshotService } from "../services/snapshot.service";
import type { Snapshot } from "../services/snapshot.service";
import { executionService } from "../services/execution.service";
import { chatService } from "../services/chat.service";
import type { ChatMessage } from "../services/chat.service";
import { WS_URL } from "../services/api";

import EditorHeader from "../components/editor/EditorHeader";
import FileExplorer from "../components/editor/FileExplorer";
import CodeEditor from "../components/editor/CodeEditor";
import OutputConsole from "../components/editor/OutputConsole";
import CollaboratorsPanel from "../components/editor/CollaboratorsPanel";
import ChatPanel from "../components/chat/ChatPanel";
import CodeReviewPanel from "../components/review/CodeReviewPanel";
import SnapshotList from "../components/snapshot/SnapshotList";
import {
  STARTER_CODE,
  getStarterCodeForFile,
  getLanguageFromFileName,
} from "../constants/starterCode";

type PanelType =
  | "collaborators"
  | "chat"
  | "review"
  | "history"
  | null;

export interface WorkspaceFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

const INITIAL_FILES: WorkspaceFile[] = [
  { id: "1", name: "script.js", language: "javascript", content: STARTER_CODE.javascript },
  { id: "2", name: "main.py", language: "python", content: STARTER_CODE.python },
  { id: "3", name: "Main.java", language: "java", content: STARTER_CODE.java },
];

const EditorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const queryRoomId = searchParams.get("roomId") || params.roomId || "";
  const [roomId, setRoomId] = useState<string>(queryRoomId);

  const [room, setRoom] = useState<Room | null>(null);
  const [files, setFiles] = useState<WorkspaceFile[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState("script.js");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE.javascript);

  const [output, setOutput] = useState("");
  const [errorOutput, setErrorOutput] = useState<string | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);

  const [activePanel, setActivePanel] = useState<PanelType>("collaborators");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const editorInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading]);

  // If no roomId, create or get a room
  useEffect(() => {
    async function initRoom() {
      if (!roomId) {
        try {
          const res = await roomService.createRoom({ name: "My Workspace" });
          if (res.success && res.data) {
            setRoomId(res.data.id);
            setRoom(res.data);
            navigate(`/editor?roomId=${res.data.id}`, { replace: true });
          }
        } catch (e) {
          console.error("Failed to auto-create room:", e);
        }
      } else {
        try {
          const res = await roomService.getRoomById(roomId);
          if (res.success && res.data) {
            setRoom(res.data);
          }
        } catch (e) {
          console.error("Failed to get room details:", e);
        }
      }
    }

    if (token) {
      initRoom();
    }
  }, [roomId, token]);

  // Load snapshots, chat history & initial online users
  useEffect(() => {
    if (roomId && token) {
      loadSnapshots();
      loadOnlineUsers();
      loadChatHistory();
    }
  }, [roomId, token]);

  const loadChatHistory = async () => {
    if (!roomId) return;
    try {
      const res = await chatService.getChatMessages(roomId);
      if (res.success && Array.isArray(res.data)) {
        setChatMessages(res.data);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  // Setup WebSocket connection for chat (binary lib0 protocol) and presence
  useEffect(() => {
    if (!roomId || !token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}&roomId=${roomId}`);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        // Binary message (e.g. Chat type 2 encoded with lib0)
        if (event.data instanceof ArrayBuffer) {
          const uint8 = new Uint8Array(event.data);
          const decoder = decoding.createDecoder(uint8);
          const messageType = decoding.readVarUint(decoder);

          if (messageType === 2) {
            const messageJson = decoding.readVarString(decoder);
            const chatData = JSON.parse(messageJson);
            if (chatData && chatData.id) {
              setChatMessages((prev) => {
                const exists = prev.some((m) => m.id === chatData.id);
                return exists ? prev : [...prev, chatData];
              });
            }
          }
        } else if (typeof event.data === "string") {
          // JSON string fallback (e.g. Presence states or fallback chat)
          const msg = JSON.parse(event.data);
          if (msg.type === "PRESENCE_STATE" && Array.isArray(msg.users)) {
            setOnlineUsers(msg.users);
          } else if (msg.type === "MESSAGE_CHAT" && msg.data) {
            setChatMessages((prev) => {
              const exists = prev.some((m) => m.id === msg.data.id);
              return exists ? prev : [...prev, msg.data];
            });
          }
        }
      } catch (e) {
        console.error("Error handling WebSocket message:", e);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, token]);

  const loadOnlineUsers = async () => {
    if (!roomId) return;
    try {
      const res = await roomService.getOnlineUsers(roomId);
      if (res.success && Array.isArray(res.data)) {
        setOnlineUsers(res.data);
      }
    } catch (e) {}
  };

  const loadSnapshots = async () => {
    if (!roomId) return;
    try {
      const res = await snapshotService.getSnapshots(roomId);
      if (res.success) {
        setSnapshots(res.data);
      }
    } catch (e) {
      console.error("Failed to load snapshots:", e);
    }
  };

  // Change language via header dropdown
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    const matchingFile = files.find(
      (f) => f.language === newLanguage || getLanguageFromFileName(f.name) === newLanguage
    );

    if (matchingFile) {
      setSelectedFile(matchingFile.name);
    } else {
      const defaultName =
        newLanguage === "java"
          ? "Main.java"
          : newLanguage === "python"
          ? "main.py"
          : "script.js";
      setSelectedFile(defaultName);
      if (!files.some((f) => f.name === defaultName)) {
        setFiles((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            name: defaultName,
            language: newLanguage,
            content: getStarterCodeForFile(defaultName, newLanguage),
          },
        ]);
      }
    }

    setOutput("");
    setErrorOutput(undefined);
  };

  // Select file from explorer or tabs
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    const detectedLang = getLanguageFromFileName(fileName);
    setLanguage(detectedLang);
  };

  // Add a new file
  const handleAddFile = (fileName: string) => {
    const detectedLang = getLanguageFromFileName(fileName);
    const starterContent = getStarterCodeForFile(fileName, detectedLang);

    const newFile: WorkspaceFile = {
      id: Date.now().toString(),
      name: fileName,
      language: detectedLang,
      content: starterContent,
    };

    setFiles((prev) => [...prev, newFile]);
    setSelectedFile(fileName);
    setLanguage(detectedLang);
    setCode(starterContent);
  };

  // Delete a file
  const handleDeleteFile = (fileName: string) => {
    if (files.length <= 1) return;

    const remaining = files.filter((f) => f.name !== fileName);
    setFiles(remaining);

    if (selectedFile === fileName && remaining.length > 0) {
      const next = remaining[0];
      setSelectedFile(next.name);
      setLanguage(next.language);
      setCode(next.content);
    }
  };

  // Run code (JS, Python, Java)
  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Executing code...");
    setErrorOutput(undefined);

    const codeToExecute = editorInstanceRef.current
      ? editorInstanceRef.current.getValue()
      : code;

    console.log("[Run Code] Sending execution request:", {
      language,
      codeLength: codeToExecute?.length,
      code: codeToExecute,
    });

    try {
      const res = await executionService.executeCode(language, codeToExecute);

      if (res.timedOut) {
        setOutput("");
        setErrorOutput(
          res.error || "Execution timed out (5s limit exceeded)."
        );
      } else if (res.error) {
        setOutput(res.output || "");
        setErrorOutput(res.error);
      } else {
        setOutput(res.output || "(Code executed successfully with no output)");
        setErrorOutput(undefined);
      }
    } catch (err: any) {
      setOutput("");
      setErrorOutput(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to execute code. Please ensure backend server is reachable."
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Open or close right panel
  const handlePanelToggle = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Restore snapshot
  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    setCode(snapshot.content);
    if (editorInstanceRef.current) {
      editorInstanceRef.current.setValue(snapshot.content);
    }
    setOutput(`Restored snapshot "${snapshot.message || "Version"}" from ${new Date(snapshot.createdAt).toLocaleTimeString()}`);
    setErrorOutput(undefined);
  };

  // Save snapshot
  const handleSaveSnapshot = async (customMsg?: string) => {
    if (!roomId) return;
    try {
      const currentCode = editorInstanceRef.current
        ? editorInstanceRef.current.getValue()
        : code;
      const message = customMsg || `Snapshot of ${selectedFile} by ${user?.name || "User"} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      const res = await snapshotService.createSnapshot(roomId, {
        content: currentCode,
        message,
        isAutoSave: false,
      });

      if (res.success && res.data) {
        setSnapshots((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save snapshot:", err);
    }
  };

  // Send chat via binary WebSocket format (type 2 + lib0 writeVarString) or REST fallback
  const handleSendChatMessage = (content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 2); // Message type 2 (MESSAGE_CHAT)
      encoding.writeVarString(encoder, content);
      wsRef.current.send(encoding.toUint8Array(encoder));
    } else if (roomId) {
      chatService.sendChatMessage(roomId, content).then((res) => {
        if (res.success && res.data) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m.id === res.data.id);
            return exists ? prev : [...prev, res.data];
          });
        }
      });
    }
  };

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <EditorHeader
          roomName={room?.name || "Workspace"}
          roomId={roomId}
          language={language}
          onlineCount={onlineUsers.length || 1}
          isRunning={isRunning}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
        />
      </div>

      {/* Main Area */}
      <div className="flex min-h-0 flex-1">
        {/* File Explorer */}
        <div className="hidden w-[220px] shrink-0 border-r border-white/10 lg:block">
          <FileExplorer
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Center Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* File Tabs */}
          <div className="flex h-10 shrink-0 items-center overflow-x-auto border-b border-white/10 bg-slate-950/70 px-2 sm:px-4">
            <div className="flex items-center gap-1.5">
              {files.map((file) => {
                const isActive = selectedFile === file.name;
                return (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => handleFileSelect(file.name)}
                    className={`flex items-center gap-2 rounded-t-md px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "border-b-2 border-indigo-500 bg-white/[0.06] text-white"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                    }`}
                  >
                    <FiCode
                      size={13}
                      className={
                        file.language === "python"
                          ? "text-cyan-400"
                          : file.language === "java"
                          ? "text-orange-400"
                          : "text-yellow-300"
                      }
                    />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Monaco Code Editor */}
          <div className="min-h-0 flex-[3] overflow-hidden">
            <CodeEditor
              roomId={roomId}
              token={token}
              userName={user?.name || "Developer"}
              fileName={selectedFile}
              language={language}
              value={code}
              onChange={setCode}
              onMountEditor={(editor) => {
                editorInstanceRef.current = editor;
              }}
            />
          </div>

          {/* Output Console */}
          <div className="min-h-[120px] flex-[1] overflow-hidden border-t border-white/10 sm:min-h-[150px] lg:min-h-[180px]">
            <OutputConsole
              output={output}
              error={errorOutput}
              onClear={() => {
                setOutput("");
                setErrorOutput(undefined);
              }}
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex h-12 shrink-0 items-center justify-between overflow-hidden border-t border-white/10 bg-slate-950/80 px-2 sm:px-3">
            <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => handlePanelToggle("collaborators")}
                title="People"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  activePanel === "collaborators"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiUsers size={14} />
                <span className="hidden sm:inline">People</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelToggle("chat")}
                title="Chat"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  activePanel === "chat"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiMessageSquare size={14} />
                <span className="hidden sm:inline">Chat</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelToggle("review")}
                title="Code Review"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  activePanel === "review"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiCode size={14} />
                <span className="hidden sm:inline">Review</span>
              </button>

              <button
                type="button"
                onClick={() => handlePanelToggle("history")}
                title="History"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  activePanel === "history"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiClock size={14} />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>

            <div className="hidden shrink-0 text-xs text-slate-500 md:block">
              CodeSync • Live Collaboration Active
            </div>
          </div>
        </div>

        {/* Right Panel (Desktop & Mobile Drawer) */}
        {activePanel && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setActivePanel(null)}
            />

            <div className="fixed inset-y-0 right-0 z-50 flex w-[320px] max-w-[90vw] flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl lg:static lg:z-auto lg:w-[280px] lg:bg-slate-950/70 lg:shadow-none">
              <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
                <div className="flex items-center gap-2">
                  {activePanel === "collaborators" && (
                    <>
                      <FiUsers size={14} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-white">People</span>
                    </>
                  )}
                  {activePanel === "chat" && (
                    <>
                      <FiMessageSquare size={14} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-white">Chat</span>
                    </>
                  )}
                  {activePanel === "review" && (
                    <>
                      <FiCode size={14} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-white">Code Review</span>
                    </>
                  )}
                  {activePanel === "history" && (
                    <>
                      <FiClock size={14} className="text-indigo-400" />
                      <span className="text-xs font-semibold text-white">History</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FiX size={14} />
                </button>
              </div>

              <div className="h-[calc(100%-40px)] min-h-0">
                {activePanel === "collaborators" && (
                  <CollaboratorsPanel
                    onlineUsers={onlineUsers}
                    roomId={roomId}
                    currentUserId={user?.id}
                  />
                )}

                {activePanel === "chat" && (
                  <ChatPanel
                    roomId={roomId}
                    currentUserId={user?.id}
                    currentUserName={user?.name}
                    messages={chatMessages}
                    onSendMessage={handleSendChatMessage}
                  />
                )}

                {activePanel === "review" && (
                  <CodeReviewPanel
                    roomId={roomId}
                    currentUserId={user?.id}
                  />
                )}

                {activePanel === "history" && (
                  <SnapshotList
                    snapshots={snapshots}
                    language={language}
                    onSaveSnapshot={handleSaveSnapshot}
                    onRestoreSnapshot={handleRestoreSnapshot}
                    currentUserId={user?.id}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorPage;