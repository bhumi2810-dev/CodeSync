import { useState } from "react";
import { FiX, FiUsers, FiArrowRight } from "react-icons/fi";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomCode: string) => void;
}

const JoinRoomModal = ({ isOpen, onClose, onJoinRoom }: JoinRoomModalProps) => {
  const [roomCode, setRoomCode] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (roomCode.trim() === "") {
      alert("Please enter a room ID or code.");
      return;
    }

    onJoinRoom(roomCode.trim());
    setRoomCode("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-7">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <FiUsers size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Join Room</h2>
            <p className="text-xs text-slate-400">
              Enter the Room ID shared by your teammate.
            </p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Room ID
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. cmuiez9td00028485qn97f9rc"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full font-mono rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20"
            />
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
              disabled={!roomCode.trim()}
              className="liquid-button flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition disabled:opacity-50"
            >
              <span>Join Room</span>
              <FiArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
