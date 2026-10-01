import { useState } from "react";
import {
  FaClock,
  FaPlus,
  FaEye,
  FaHistory,
  FaCheck,
  FaTimes,
  FaUser,
  FaSearch,
} from "react-icons/fa";
import type { Snapshot } from "../../services/snapshot.service";
import SnapshotPreviewModal from "./SnapshotPreviewModal";

interface SnapshotListProps {
  snapshots: Snapshot[];
  language?: string;
  onSaveSnapshot: (message?: string) => Promise<void>;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  loading?: boolean;
  currentUserId?: string;
}

const SnapshotList = ({
  snapshots = [],
  language = "javascript",
  onSaveSnapshot,
  onRestoreSnapshot,
  loading = false,
  currentUserId = "",
}: SnapshotListProps) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  const handleOpenPreview = (snapshot: Snapshot) => {
    setSelectedSnapshot(snapshot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSnapshot(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveSnapshot(customMessage.trim() || undefined);
      setCustomMessage("");
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create snapshot:", err);
    } finally {
      setSaving(false);
    }
  };

  const filteredSnapshots = snapshots.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (s.message && s.message.toLowerCase().includes(query)) ||
      (s.creator?.name && s.creator.name.toLowerCase().includes(query)) ||
      (s.content && s.content.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/40">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <FaHistory size={14} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Snapshots</h2>
              <p className="text-[10px] text-slate-500">
                {snapshots.length} saved {snapshots.length === 1 ? "version" : "versions"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-95"
          >
            <FaPlus size={10} />
            <span>Save</span>
          </button>
        </div>

        {/* Inline Snapshot Message Creator */}
        {isCreating && (
          <div className="mt-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-2.5 animate-fadeIn">
            <label className="mb-1 block text-[10px] font-medium text-slate-400">
              Snapshot Note / Label
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                placeholder="e.g. Added auth logic, Fixed algorithm"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex h-7 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <FaCheck size={10} />
                <span>{saving ? "Saving..." : "Create"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <FaTimes size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Search Bar if multiple snapshots */}
        {snapshots.length > 2 && (
          <div className="relative mt-2.5">
            <FaSearch size={10} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snapshots..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-7 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
            />
          </div>
        )}
      </div>

      {/* Snapshots List */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {loading && snapshots.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Loading snapshots...
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center">
            <div>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <FaClock size={16} />
              </div>
              <p className="text-xs font-medium text-slate-400">
                {searchQuery ? "No matching snapshots" : "No snapshots saved yet"}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                Click "+ Save" above to capture a point-in-time version of your code.
              </p>
            </div>
          </div>
        ) : (
          filteredSnapshots.map((snapshot, index) => {
            const isLatest = index === 0 && !searchQuery;
            const formattedTime = snapshot.createdAt
              ? new Date(snapshot.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            const formattedDate = snapshot.createdAt
              ? new Date(snapshot.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : "";

            // Create a short 2-3 line excerpt of the code
            const codeLines = (snapshot.content || "")
              .split("\n")
              .filter((line) => line.trim().length > 0)
              .slice(0, 3);
            const excerpt = codeLines.join("\n") || "(Empty document)";

            return (
              <div
                key={snapshot.id}
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-indigo-500/40 hover:bg-white/[0.05]"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="truncate text-xs font-semibold text-white">
                        {snapshot.message || `Version ${snapshots.length - index}`}
                      </span>

                      {isLatest && (
                        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                          Latest
                        </span>
                      )}

                      {snapshot.isAutoSave ? (
                        <span className="rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[8px] font-medium text-cyan-400">
                          Auto
                        </span>
                      ) : (
                        <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[8px] font-medium text-indigo-400">
                          Manual
                        </span>
                      )}
                    </div>

                    {/* Metadata: Creator and Timestamp */}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaUser size={8} className="text-slate-500" />
                        {snapshot.createdBy === currentUserId ? "You" : (snapshot.creator?.name || "Collaborator")}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        {formattedDate}, {formattedTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-3 Line Code Excerpt Preview */}
                <div
                  onClick={() => handleOpenPreview(snapshot)}
                  title="Click to view full preview"
                  className="mt-2.5 cursor-pointer rounded-lg border border-white/5 bg-slate-950/70 p-2 font-mono text-[10px] text-slate-300 leading-relaxed transition hover:border-indigo-500/30 hover:bg-slate-950"
                >
                  <pre className="overflow-hidden text-ellipsis whitespace-pre font-mono line-clamp-3">
                    {excerpt}
                  </pre>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(snapshot)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-indigo-400"
                  >
                    <FaEye size={11} />
                    <span>Preview</span>
                  </button>

                  {confirmRestoreId === snapshot.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-400">Restore?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onRestoreSnapshot(snapshot);
                          setConfirmRestoreId(null);
                        }}
                        className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-indigo-500"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRestoreId(null)}
                        className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-white/10"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRestoreId(snapshot.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      <FaHistory size={10} />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Snapshot Code Preview Modal */}
      <SnapshotPreviewModal
        snapshot={selectedSnapshot}
        language={language}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRestore={onRestoreSnapshot}
      />
    </div>
  );
};

export default SnapshotList;
