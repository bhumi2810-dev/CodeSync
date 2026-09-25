import { FaFileCode, FaPlus, FaFolder } from "react-icons/fa";

interface FileExplorerProps {
  language: string;
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
}

const FileExplorer = ({
  language,
  selectedFile,
  onFileSelect,
}: FileExplorerProps) => {
  const fileName =
    language === "java" ? "Main.java" : "script.js";

  return (
    <aside className="flex h-full w-full flex-col bg-slate-950/70">

      {/* Explorer Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <FaFolder className="text-sm text-indigo-400" />

          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Explorer
          </h2>
        </div>

        <button
          type="button"
          title="Create new file"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/10 hover:text-white"
        >
          <FaPlus className="text-xs" />
        </button>
      </div>

      {/* Project Folder */}
      <div className="px-2 pt-3">

        <div className="mb-1 flex items-center gap-2 px-2 py-1.5">
          <FaFolder className="text-xs text-yellow-400" />

          <span className="text-xs font-medium text-slate-300">
            CodeSync
          </span>
        </div>

        {/* File */}
        <button
          type="button"
          onClick={() => onFileSelect(fileName)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
            selectedFile === fileName
              ? "bg-indigo-500/15 text-indigo-300"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          }`}
        >
          <FaFileCode
            className={
              language === "java"
                ? "text-orange-400"
                : "text-yellow-300"
            }
          />

          <span className="truncate">
            {fileName}
          </span>
        </button>
      </div>

      {/* Bottom Information */}
      <div className="mt-auto border-t border-white/10 p-3">
        <p className="text-[10px] leading-4 text-slate-600">
          {language === "java"
            ? "Java source file"
            : "JavaScript source file"}
        </p>
      </div>
    </aside>
  );
};

export default FileExplorer;