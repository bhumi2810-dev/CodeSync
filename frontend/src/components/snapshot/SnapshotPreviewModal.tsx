import { useState } from "react";
import {
  FaTimes,
  FaClock,
  FaUser,
  FaCopy,
  FaCheck,
  FaHistory,
  FaCode,
  FaExclamationCircle,
} from "react-icons/fa";
import Editor from "@monaco-editor/react";
import type { Snapshot } from "../../services/snapshot.service";

interface SnapshotPreviewModalProps {
  snapshot: Snapshot | null;
  language?: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (snapshot: Snapshot) => void;
}

const SnapshotPreviewModal = ({
  snapshot,
  language = "javascript",
  isOpen,
  onClose,
  onRestore,
}: SnapshotPreviewModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !snapshot) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snapshot.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestoreClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmRestore = () => {
    onRestore(snapshot);
    setShowConfirm(false);
    onClose();
  };

  const formattedDate = snapshot.createdAt
    ? new Date(snapshot.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog */}
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-indigo-500/10">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FaHistory size={18} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  {snapshot.message || "Code Snapshot"}
                </h3>
                {snapshot.isAutoSave ? (
                  <span className="rounded-md bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                    Auto-save
                  </span>
                ) : (
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                    Manual
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaUser size={10} className="text-slate-500" />
                  {snapshot.creator?.name || "Collaborator"}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <FaClock size={10} className="text-slate-500" />
                  {formattedDate}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5">
                  <FaCode size={10} className="text-slate-500" />
                  {snapshot.content.split("\n").length} lines
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close Preview"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Confirmation Banner if Restore is clicked */}
        {showConfirm && (
          <div className="flex shrink-0 items-center justify-between border-b border-amber-500/20 bg-amber-500/10 px-5 py-3 text-amber-200">
            <div className="flex items-center gap-2 text-xs">
              <FaExclamationCircle className="text-amber-400 shrink-0" size={14} />
              <span>
                Are you sure you want to restore this snapshot? Current editor contents will be replaced.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-indigo-500"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        )}

        {/* Code Preview Body (Monaco Read-Only) */}
        <div className="min-h-0 flex-1 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={snapshot.content}
            theme="vs-dark"
            options={{
              readOnly: true,
              domReadOnly: true,
              fontSize: 13,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "all",
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        {/* Footer Toolbar */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-slate-900/60 px-5 py-3">
          <div className="text-xs text-slate-500">
            Snapshot ID: <span className="font-mono text-slate-400">{snapshot.id}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <>
                  <FaCheck size={11} className="text-green-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy size={11} />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            {!showConfirm && (
              <button
                type="button"
                onClick={handleRestoreClick}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98]"
              >
                <FaHistory size={11} />
                <span>Restore to Editor</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnapshotPreviewModal;
