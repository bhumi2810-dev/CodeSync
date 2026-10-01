import { useState } from "react";
import { FiX, FiPlus, FiLock, FiGlobe } from "react-icons/fi";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomName: string, isPrivate: boolean) => void;
}

const CreateRoomModal = ({
  isOpen,
  onClose,
  onCreateRoom,
}: CreateRoomModalProps) => {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (roomName.trim() === "") {
      alert("Please enter a room name.");
      return;
    }

    onCreateRoom(roomName.trim(), isPrivate);
    setRoomName("");
    setIsPrivate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-7">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <FiX size={18} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <FiPlus size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create New Room</h2>
            <p className="text-xs text-slate-400">
              Create a collaborative workspace for your team.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Room Name
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Algorithms & DSA, Team Sprint"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Room Access
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                  !isPrivate
                    ? "border-indigo-500/50 bg-indigo-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <FiGlobe className={!isPrivate ? "text-indigo-400" : "text-slate-500"} size={16} />
                <div>
                  <p className="text-xs font-semibold">Public</p>
                  <p className="text-[10px] text-slate-500">Anyone with ID</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                  isPrivate
                    ? "border-indigo-500/50 bg-indigo-500/15 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                }`}
              >
                <FiLock className={isPrivate ? "text-indigo-400" : "text-slate-500"} size={16} />
                <div>
                  <p className="text-xs font-semibold">Private</p>
                  <p className="text-[10px] text-slate-500">Invite only</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!roomName.trim()}
              className="gradient-button rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
