import { useState } from "react";
import {
  FiCode,
  FiMessageSquare,
  FiUsers,
  FiX,
  FiClock,
  FiRotateCcw,
} from "react-icons/fi";

import EditorHeader from "../components/editor/EditorHeader";
import FileExplorer from "../components/editor/FileExplorer";
import CodeEditor from "../components/editor/CodeEditor";
import OutputConsole from "../components/editor/OutputConsole";
import CollaboratorsPanel from "../components/editor/CollaboratorsPanel";
import ChatPanel from "../components/chat/ChatPanel";
import CodeReviewPanel from "../components/review/CodeReviewPanel";

type PanelType =
  | "collaborators"
  | "chat"
  | "review"
  | "history"
  | null;

interface Snapshot {
  id: number;
  title: string;
  author: string;
  time: string;
  code: string;
}

const EditorPage = () => {
  const [language, setLanguage] = useState("java");

  const [selectedFile, setSelectedFile] = useState("Main.java");

  const [code, setCode] = useState(
    `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CodeSync");
    }
}`
  );

  const [output, setOutput] = useState(
    "Run your code to see the output here."
  );

  const [activePanel, setActivePanel] =
    useState<PanelType>("collaborators");

  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    {
      id: 1,
      title: "Initial code",
      author: "You",
      time: "10:20 AM",
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CodeSync");
    }
}`,
    },
    {
      id: 2,
      title: "Added output message",
      author: "Developer 2",
      time: "10:35 AM",
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CodeSync");
        System.out.println("Working together!");
    }
}`,
    },
  ]);

  // Change language
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    if (newLanguage === "java") {
      setSelectedFile("Main.java");

      setCode(
        `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello CodeSync");
    }
}`
      );
    } else {
      setSelectedFile("script.js");

      setCode(
        `function main() {
    console.log("Hello CodeSync");
}

main();`
      );
    }

    setOutput("Run your code to see the output here.");
  };

  // Change file
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  // Run code
  const handleRun = () => {
    setOutput(
      `Running ${selectedFile}...\n\nHello CodeSync\n\nProcess finished successfully.`
    );
  };

  // Open or close right panel
  const handlePanelToggle = (panel: PanelType) => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  // Restore previous snapshot
  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    setCode(snapshot.code);
    setOutput(`Restored snapshot: ${snapshot.title}`);
  };

  // Save current code as a new snapshot
  const handleSaveSnapshot = () => {
    const newSnapshot: Snapshot = {
      id: Date.now(),
      title: "New snapshot",
      author: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      code: code,
    };

    setSnapshots([newSnapshot, ...snapshots]);
  };

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">

      {/* Header */}
      <div className="shrink-0">
        <EditorHeader
          language={language}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
        />
      </div>

      {/* Main Area */}
      <div className="flex min-h-0 flex-1">

        {/* File Explorer */}
        <div className="hidden w-[220px] shrink-0 border-r border-white/10 lg:block">
          <FileExplorer
            language={language}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Center Area */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* File Tab */}
          <div className="flex h-10 shrink-0 items-center overflow-hidden border-b border-white/10 bg-slate-950/70 px-2 sm:px-4">

            <div className="flex min-w-0 items-center gap-2 border-b-2 border-indigo-500 px-2 py-2 sm:px-3">

              <FiCode
                size={14}
                className="shrink-0 text-indigo-400"
              />

              <span className="truncate text-xs font-medium text-slate-200">
                {selectedFile}
              </span>

            </div>

          </div>

          {/* Code Editor */}
          <div className="min-h-0 flex-[3] overflow-hidden">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Output Console */}
          <div className="min-h-[120px] flex-[1] overflow-hidden border-t border-white/10 sm:min-h-[150px] lg:min-h-[180px]">
            <OutputConsole output={output} />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex h-12 shrink-0 items-center justify-between overflow-hidden border-t border-white/10 bg-slate-950/80 px-2 sm:px-3">

            {/* Panel Buttons */}
            <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">

              {/* People */}
              <button
                type="button"
                onClick={() =>
                  handlePanelToggle("collaborators")
                }
                title="People"
                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  activePanel === "collaborators"
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FiUsers size={14} />

                <span className="hidden sm:inline">
                  People
                </span>
              </button>

              {/* Chat */}
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

                <span className="hidden sm:inline">
                  Chat
                </span>
              </button>

              {/* Review */}
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

                <span className="hidden sm:inline">
                  Review
                </span>
              </button>

              {/* History */}
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

                <span className="hidden sm:inline">
                  History
                </span>
              </button>

            </div>

            {/* Editor Label */}
            <div className="hidden shrink-0 text-xs text-slate-500 md:block">
              CodeSync • Collaborative Editor
            </div>

          </div>
        </div>

        {/* Desktop Right Panel */}
        {activePanel && (
          <div className="hidden w-[260px] shrink-0 border-l border-white/10 bg-slate-950/70 lg:block">

            {/* Panel Header */}
            <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">

              <div className="flex items-center gap-2">

                {activePanel === "collaborators" && (
                  <>
                    <FiUsers
                      size={14}
                      className="text-indigo-400"
                    />

                    <span className="text-xs font-semibold text-white">
                      People
                    </span>
                  </>
                )}

                {activePanel === "chat" && (
                  <>
                    <FiMessageSquare
                      size={14}
                      className="text-indigo-400"
                    />

                    <span className="text-xs font-semibold text-white">
                      Chat
                    </span>
                  </>
                )}

                {activePanel === "review" && (
                  <>
                    <FiCode
                      size={14}
                      className="text-indigo-400"
                    />

                    <span className="text-xs font-semibold text-white">
                      Code Review
                    </span>
                  </>
                )}

                {activePanel === "history" && (
                  <>
                    <FiClock
                      size={14}
                      className="text-indigo-400"
                    />

                    <span className="text-xs font-semibold text-white">
                      History
                    </span>
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

            {/* Panel Content */}
            <div className="h-[calc(100%-40px)] min-h-0">

              {activePanel === "collaborators" && (
                <CollaboratorsPanel />
              )}

              {activePanel === "chat" && (
                <ChatPanel />
              )}

              {activePanel === "review" && (
                <CodeReviewPanel />
              )}

              {activePanel === "history" && (
                <div className="flex h-full min-h-0 flex-col bg-slate-950/40">

                  {/* History Header */}
                  <div className="shrink-0 border-b border-white/10 px-3 py-3">

                    <div className="flex items-center justify-between">

                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-white">
                          Code History
                        </h2>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Previous versions of your code
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSnapshot}
                        className="shrink-0 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1.5 text-[10px] font-medium text-indigo-400 transition hover:bg-indigo-500/20"
                      >
                        Save
                      </button>

                    </div>

                  </div>

                  {/* Snapshots */}
                  <div className="min-h-0 flex-1 overflow-y-auto p-2.5">

                    <div className="space-y-2">

                      {snapshots.map((snapshot, index) => (
                        <div
                          key={snapshot.id}
                          className="rounded-lg border border-white/5 bg-white/[0.04] p-2.5 transition hover:border-white/10 hover:bg-white/[0.06]"
                        >

                          <div className="flex items-start gap-2">

                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                              <FiClock size={13} />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center justify-between gap-2">

                                <p className="truncate text-[11px] font-semibold text-slate-200">
                                  {snapshot.title}
                                </p>

                                {index === 0 && (
                                  <span className="shrink-0 rounded-md bg-green-500/10 px-1.5 py-0.5 text-[8px] font-medium text-green-400">
                                    Latest
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-[9px] text-slate-500">
                                {snapshot.author} • {snapshot.time}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRestoreSnapshot(snapshot)
                                }
                                className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-400 transition hover:text-indigo-300"
                              >
                                <FiRotateCcw size={10} />
                                Restore
                              </button>

                            </div>

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>

                  {/* Footer */}
                  <div className="shrink-0 border-t border-white/10 p-2.5">

                    <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-2.5">

                      <p className="text-[10px] leading-4 text-slate-500">
                        Snapshots let you revisit earlier versions of your
                        code.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Panel */}
      {activePanel && (
        <div className="fixed inset-0 z-50 flex lg:hidden">

          {/* Background */}
          <button
            type="button"
            aria-label="Close panel"
            onClick={() => setActivePanel(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 flex h-full w-[320px] max-w-[92%] flex-col border-l border-white/10 bg-slate-950 shadow-2xl">

            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">

              <div className="flex items-center gap-2">

                {activePanel === "collaborators" && (
                  <>
                    <FiUsers
                      size={16}
                      className="text-indigo-400"
                    />

                    <span className="font-semibold text-white">
                      People
                    </span>
                  </>
                )}

                {activePanel === "chat" && (
                  <>
                    <FiMessageSquare
                      size={16}
                      className="text-indigo-400"
                    />

                    <span className="font-semibold text-white">
                      Chat
                    </span>
                  </>
                )}

                {activePanel === "review" && (
                  <>
                    <FiCode
                      size={16}
                      className="text-indigo-400"
                    />

                    <span className="font-semibold text-white">
                      Code Review
                    </span>
                  </>
                )}

                {activePanel === "history" && (
                  <>
                    <FiClock
                      size={16}
                      className="text-indigo-400"
                    />

                    <span className="font-semibold text-white">
                      History
                    </span>
                  </>
                )}

              </div>

              <button
                type="button"
                onClick={() => setActivePanel(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <FiX size={16} />
              </button>

            </div>

            {/* Content */}
            <div className="min-h-0 flex-1">

              {activePanel === "collaborators" && (
                <CollaboratorsPanel />
              )}

              {activePanel === "chat" && (
                <ChatPanel />
              )}

              {activePanel === "review" && (
                <CodeReviewPanel />
              )}

              {activePanel === "history" && (
                <div className="flex h-full min-h-0 flex-col bg-slate-950/40">

                  {/* History Header */}
                  <div className="shrink-0 border-b border-white/10 px-4 py-3">

                    <div className="flex items-center justify-between">

                      <div className="min-w-0">

                        <h2 className="text-sm font-semibold text-white">
                          Code History
                        </h2>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Previous versions of your code
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSnapshot}
                        className="shrink-0 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-medium text-indigo-400 transition hover:bg-indigo-500/20"
                      >
                        Save
                      </button>

                    </div>

                  </div>

                  {/* Mobile Snapshots */}
                  <div className="min-h-0 flex-1 overflow-y-auto p-3">

                    <div className="space-y-2">

                      {snapshots.map((snapshot, index) => (
                        <div
                          key={snapshot.id}
                          className="rounded-lg border border-white/5 bg-white/[0.04] p-3"
                        >

                          <div className="flex items-start gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                              <FiClock size={14} />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-center justify-between gap-2">

                                <p className="truncate text-xs font-semibold text-slate-200">
                                  {snapshot.title}
                                </p>

                                {index === 0 && (
                                  <span className="shrink-0 rounded-md bg-green-500/10 px-1.5 py-0.5 text-[8px] text-green-400">
                                    Latest
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-[10px] text-slate-500">
                                {snapshot.author} • {snapshot.time}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRestoreSnapshot(snapshot)
                                }
                                className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-400 transition hover:text-indigo-300"
                              >
                                <FiRotateCcw size={11} />
                                Restore this version
                              </button>

                            </div>

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;