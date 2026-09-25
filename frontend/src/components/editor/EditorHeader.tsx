import {
  FaPlay,
  FaUsers,
  FaCode,
} from "react-icons/fa";

interface EditorHeaderProps {
  roomName?: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
}

const EditorHeader = ({
  roomName = "ABC123",
  language,
  onLanguageChange,
  onRun,
}: EditorHeaderProps) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl md:px-6">

      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-4">

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
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-slate-500">
            Room
          </span>

          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
            {roomName}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Language Selector */}
        <div className="relative flex items-center">
          <FaCode className="pointer-events-none absolute left-3 text-xs text-indigo-400" />

          <select
            value={language}
            onChange={(event) =>
              onLanguageChange(event.target.value)
            }
            className="h-9 appearance-none rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-8 text-xs font-medium text-slate-200 outline-none transition hover:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
          >
            <option
              value="java"
              className="bg-slate-900 text-white"
            >
              Java
            </option>

            <option
              value="javascript"
              className="bg-slate-900 text-white"
            >
              JavaScript
            </option>
          </select>
        </div>

        {/* Collaborators */}
        <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-slate-300">
          <FaUsers className="text-cyan-400" />

          <span>2</span>

          <span className="hidden text-slate-500 md:inline">
            online
          </span>
        </div>

        {/* Run Button */}
        <button
          type="button"
          onClick={onRun}
          className="flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-4 text-xs font-semibold text-white shadow-lg shadow-green-500/10 transition hover:from-emerald-400 hover:to-green-400 hover:shadow-green-500/20 active:scale-95"
        >
          <FaPlay className="text-[10px]" />

          <span>Run</span>
        </button>
      </div>
    </header>
  );
};

export default EditorHeader;