import { FiCircle, FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";
import type { OnlineUser } from "../../services/room.service";

interface CollaboratorsPanelProps {
  onlineUsers?: OnlineUser[];
  roomId?: string;
  currentUserId?: string;
}

const CollaboratorsPanel = ({
  onlineUsers = [],
  roomId = "",
  currentUserId = "",
}: CollaboratorsPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/40">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-3 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">People</h2>
            <p className="mt-1 text-[11px] text-slate-500">
              {onlineUsers.length} {onlineUsers.length === 1 ? "person" : "people"} online
            </p>
          </div>

          {roomId && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy room code to invite"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <FiCheck className="text-green-400" size={13} /> : <FiCopy size={13} />}
              <span>{copied ? "Copied" : "Invite"}</span>
            </button>
          )}
        </div>
      </div>

      {/* User List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <div className="space-y-1.5">
          {onlineUsers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No online collaborators
            </div>
          ) : (
            onlineUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              const initial = (user.name || "U").charAt(0).toUpperCase();

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 transition hover:border-white/5 hover:bg-white/[0.04]"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-md shadow-indigo-500/10">
                      {initial}
                    </div>

                    <FiCircle
                      size={9}
                      className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400"
                    />
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium text-slate-200">
                        {user.name}
                      </p>
                      {isSelf && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] text-indigo-300">
                          You
                        </span>
                      )}
                    </div>

                    <p className="truncate text-[10px] text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  {/* Online */}
                  <span className="text-[10px] font-medium text-green-400">
                    Online
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Information */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-2.5">
          <p className="text-[10px] leading-4 text-slate-400">
            Collaborators in this room can edit code in real-time and chat together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsPanel;