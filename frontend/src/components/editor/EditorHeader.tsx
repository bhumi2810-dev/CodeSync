import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaUsers,
  FaCode,
  FaArrowLeft,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { useState } from "react";

interface EditorHeaderProps {
  roomName?: string;
  roomId?: string;
  language: string;
  onlineCount?: number;
  isRunning?: boolean;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
}

const EditorHeader = ({
  roomName = "Workspace",
  roomId = "",
  language,
  onlineCount = 1,
  isRunning = false,
  onLanguageChange,
  onRun,
}: EditorHeaderProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl md:px-6">
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          title="Back to Dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <FaArrowLeft size={12} />
        </button>

        {/* CodeSync Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
            {"</>"}
          </div>

          <h1 className="hidden text-lg font-bold sm:block">
            <span className="text-white">Code</span>
            <span className="gradient-text">Sync</span>
          </h1>
        </div>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-white/10 sm:block" />

        {/* Room */}
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-slate-200">
            {roomName}
          </span>

          {roomId && (
            <button
              type="button"
              onClick={handleCopyId}
              title="Click to copy room ID"
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-400 transition hover:bg-white/10 hover:text-indigo-300"
            >
              <span>{roomId}</span>
              {copied ? <FaCheck size={10} className="text-green-400" /> : <FaCopy size={10} />}
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Language Selector */}
        <div className="relative flex items-center">
          <FaCode className="pointer-events-none absolute left-3 text-xs text-indigo-400" />

          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="h-9 appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-8 text-xs font-medium text-slate-200 outline-none transition hover:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="javascript" className="bg-slate-900 text-white">
              JavaScript (Node.js)
            </option>
            <option value="python" className="bg-slate-900 text-white">
              Python 3
            </option>
            <option value="java" className="bg-slate-900 text-white">
              Java (OpenJDK)
            </option>
          </select>
        </div>

        {/* Collaborators */}
        <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-slate-300">
          <FaUsers className="text-cyan-400" />
          <span>{onlineCount}</span>
          <span className="hidden text-slate-500 md:inline">online</span>
        </div>

        {/* Run Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 text-xs font-semibold text-white shadow-lg shadow-green-500/10 transition hover:from-emerald-400 hover:to-green-400 hover:shadow-green-500/20 active:scale-95 disabled:opacity-50"
        >
          <FaPlay className="text-[10px]" />
          <span>{isRunning ? "Running..." : "Run"}</span>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;