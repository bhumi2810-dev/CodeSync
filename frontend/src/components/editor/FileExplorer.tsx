import { useState } from "react";
import {
  FaFileCode,
  FaFolder,
  FaPlus,
  FaTrashAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export interface WorkspaceFile {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface FileExplorerProps {
  files: WorkspaceFile[];
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
  onAddFile: (fileName: string) => void;
  onDeleteFile?: (fileName: string) => void;
}

const FileExplorer = ({
  files,
  selectedFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
}: FileExplorerProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [inputError, setInputError] = useState("");

  const handleCreateFile = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setInputError("Filename cannot be empty");
      return;
    }

    if (files.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputError("File with this name already exists");
      return;
    }

    // Must have a valid extension
    if (!trimmed.includes(".")) {
      setInputError("Please include an extension (.js, .py, .java)");
      return;
    }

    onAddFile(trimmed);
    setNewFileName("");
    setInputError("");
    setIsCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateFile();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewFileName("");
      setInputError("");
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".py")) {
      return <FaFileCode className="shrink-0 text-cyan-400" size={13} />;
    }
    if (fileName.endsWith(".java")) {
      return <FaFileCode className="shrink-0 text-orange-400" size={13} />;
    }
    return <FaFileCode className="shrink-0 text-yellow-300" size={13} />;
  };

  return (
    <aside className="flex h-full w-full flex-col bg-slate-950/70">
      {/* Explorer Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 px-3.5">
        <div className="flex items-center gap-2">
          <FaFolder className="text-sm text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Explorer
          </h2>
        </div>

        {/* Add File Button */}
        <button
          type="button"
          onClick={() => {
            setIsCreating(true);
            setInputError("");
          }}
          title="New File (.js, .py, .java)"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/[0.04] text-slate-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white"
        >
          <FaPlus size={11} />
        </button>
      </div>

      {/* Project Files */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pt-3 space-y-1">
        <div className="mb-2 flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <FaFolder className="text-xs text-yellow-400/90" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace Files
            </span>
          </div>
          <span className="text-[10px] text-slate-600">{files.length}</span>
        </div>

        {/* Inline New File Creator */}
        {isCreating && (
          <div className="mb-2 rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                value={newFileName}
                onChange={(e) => {
                  setNewFileName(e.target.value);
                  setInputError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="filename.js / .py / .java"
                className="min-w-0 flex-1 rounded border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreateFile}
                title="Create file"
                className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white transition hover:bg-indigo-500"
              >
                <FaCheck size={10} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewFileName("");
                  setInputError("");
                }}
                title="Cancel"
                className="flex h-6 w-6 items-center justify-center rounded bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <FaTimes size={10} />
              </button>
            </div>
            {inputError && (
              <p className="mt-1.5 text-[9px] text-red-400 leading-3">
                {inputError}
              </p>
            )}
          </div>
        )}

        {/* Files List */}
        {files.map((file) => {
          const isSelected = selectedFile === file.name;
          const isRemovable = files.length > 1;

          return (
            <div
              key={file.id || file.name}
              className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                isSelected
                  ? "bg-indigo-500/15 text-indigo-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => onFileSelect(file.name)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                {getFileIcon(file.name)}
                <span className="truncate text-xs font-medium">{file.name}</span>
              </button>

              {isRemovable && onDeleteFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.name);
                  }}
                  title="Delete file"
                  className="hidden rounded p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 group-hover:block"
                >
                  <FaTrashAlt size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Information */}
      <div className="mt-auto border-t border-white/10 p-3 bg-slate-950/40">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Supported:</span>
          <span className="font-mono text-slate-400">JS • Python • Java</span>
        </div>
      </div>
    </aside>
  );
};

export default FileExplorer;