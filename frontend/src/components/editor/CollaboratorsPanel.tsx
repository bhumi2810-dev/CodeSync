import { FiCircle, FiUserPlus } from "react-icons/fi";

interface Collaborator {
  id: number;
  name: string;
  role: string;
  online: boolean;
}

const CollaboratorsPanel = () => {
  const collaborators: Collaborator[] = [
    {
      id: 1,
      name: "You",
      role: "Developer",
      online: true,
    },
    {
      id: 2,
      name: "Developer 2",
      role: "Collaborator",
      online: true,
    },
  ];

  const onlineUsers = collaborators.filter(
    (user) => user.online
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/40">

      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-3 py-3">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-sm font-semibold text-white">
              People
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              {onlineUsers.length} people online
            </p>
          </div>

          <button
            type="button"
            title="Invite collaborator"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <FiUserPlus size={14} />
          </button>

        </div>
      </div>

      {/* User List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">

        <div className="space-y-1.5">

          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2.5 transition hover:border-white/5 hover:bg-white/[0.04]"
            >

              {/* Avatar */}
              <div className="relative shrink-0">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                  {user.name.charAt(0)}
                </div>

                <FiCircle
                  size={9}
                  className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400"
                />

              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-medium text-slate-200">
                  {user.name}
                </p>

                <p className="truncate text-[10px] text-slate-500">
                  {user.role}
                </p>

              </div>

              {/* Online */}
              <span className="text-[10px] text-green-400">
                Online
              </span>

            </div>
          ))}

        </div>
      </div>

      {/* Bottom Information */}
      <div className="shrink-0 border-t border-white/10 p-3">

        <div className="rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-2.5">

          <p className="text-[10px] leading-4 text-slate-500">
            Collaborators can edit the code and communicate in this room.
          </p>

        </div>

      </div>
    </div>
  );
};

export default CollaboratorsPanel;