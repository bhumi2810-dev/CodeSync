import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiCode,
  FiCopy,
  FiEdit3,
  FiFolder,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
  FiArrowRight,
  FiActivity,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";
import Logo from "../components/common/Logo";
import { useAuth } from "../context/AuthContext";
import { roomService } from "../services/room.service";
import type { Room } from "../services/room.service";
import CreateRoomModal from "../components/dashboard/CreateRoomModal";
import JoinRoomModal from "../components/dashboard/JoinRoomModal";
import NotificationDropdown from "../components/dashboard/NotificationDropdown";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Close search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const res = await roomService.listRooms();
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleCreateRoom = async (name: string, _isPrivate: boolean) => {
    try {
      const res = await roomService.createRoom({
        name: name.trim(),
        isBeginnerMode: false,
      });

      if (res.success && res.data) {
        setShowCreateModal(false);
        navigate(`/editor?roomId=${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      const res = await roomService.joinRoom(roomCode.trim());
      if (res.success) {
        setShowJoinModal(false);
        navigate(`/editor?roomId=${roomCode.trim()}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Room not found or could not join");
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${roomName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await roomService.deleteRoom(roomId);
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayName = user?.name || "Developer";
  const userInitial = displayName.charAt(0).toUpperCase();

  const query = searchQuery.trim().toLowerCase();
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(query) ||
    r.id.toLowerCase().includes(query) ||
    (r.owner?.name && r.owner.name.toLowerCase().includes(query))
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredRooms.length > 0) {
      setShowSearchDropdown(false);
      navigate(`/editor?roomId=${filteredRooms[0].id}`);
    }
    if (e.key === "Escape") {
      setShowSearchDropdown(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-white">
      {/* Background Glow Effects */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />
        <div className="absolute right-[-180px] top-[10%] h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />
        <div className="absolute bottom-[-250px] left-[35%] h-[450px] w-[450px] rounded-full bg-purple-600/20 blur-[140px] sm:h-[550px] sm:w-[550px] sm:blur-[160px]" />
        <div className="absolute left-[45%] top-[35%] h-[200px] w-[200px] rounded-full bg-blue-500/10 blur-[80px] sm:h-[250px] sm:w-[250px] sm:blur-[100px]" />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] max-w-[85vw] flex-col border-r border-white/10 bg-slate-950/90 backdrop-blur-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-5 sm:px-6">
          <Logo size="md" />

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Create Room */}
        <div className="px-4 pt-6">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="gradient-button group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20"
          >
            <FiPlus size={18} />
            <span>Create Room</span>
            <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-7 px-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 px-4 py-3 text-sm font-medium text-white shadow-inner shadow-white/5"
            >
              <FiGrid className="text-indigo-300" size={18} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FiUsers size={18} />
              Join Room
            </button>

            <button
              type="button"
              onClick={() => navigate("/editor")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FiEdit3 size={18} />
              Open Editor
            </button>
          </nav>
        </div>

        {/* Tools */}
        <div className="mt-8 px-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Tools
          </p>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FiUsers size={18} />
              Profile
            </button>
          </nav>
        </div>

        {/* Bottom User */}
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/20">
              {userInitial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "Developer"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="shrink-0 text-slate-500 transition hover:text-red-400"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative min-h-screen lg:ml-[270px]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-2xl sm:min-h-20 sm:px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 lg:hidden"
            >
              <FiMenu size={20} />
            </button>

            <div className="hidden min-w-0 md:block">
              <p className="text-xs text-slate-500">Workspace</p>
              <h1 className="truncate text-sm font-semibold text-white">
                Developer Dashboard
              </h1>
            </div>
          </div>

          {/* Interactive Header Search Bar */}
          <div className="mx-2 hidden max-w-md flex-1 md:block lg:mx-4 relative" ref={searchContainerRef}>
            <div className="relative">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search rooms by name or ID (press Enter to open)..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/40 focus:bg-white/[0.06] sm:h-11"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>

            {/* Quick Search Floating Popup */}
            {showSearchDropdown && searchQuery.trim() !== "" && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-black/80 backdrop-blur-2xl">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Search Results ({filteredRooms.length})
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching rooms found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredRooms.slice(0, 5).map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/editor?roomId=${room.id}`);
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <FiCode size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">
                              {room.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {room.membersCount || 1} members • ID: {room.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-xs text-indigo-400 font-medium">
                          Open →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Live Notifications Component */}
            <NotificationDropdown />

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-2 transition hover:bg-white/10 sm:pr-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold">
                  {userInitial}
                </div>

                <span className="hidden text-sm font-medium text-slate-300 sm:block">
                  {displayName}
                </span>

                <FiChevronDown
                  size={14}
                  className="hidden text-slate-500 sm:block"
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <FiUsers size={16} />
                    Profile
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="px-4 pt-3 md:hidden">
          <div className="relative">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-8 text-xs text-white outline-none placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-5 sm:py-8 md:px-8 lg:px-10">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-cyan-500/10 p-5 shadow-2xl shadow-indigo-950/30 sm:rounded-3xl sm:p-7 md:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-[80px] sm:h-64 sm:w-64 sm:blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-purple-500/20 blur-[80px] sm:h-64 sm:w-64 sm:blur-[90px]" />

            <div className="relative z-10 max-w-3xl">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium text-cyan-300 sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
                Welcome back, {displayName}
              </div>

              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Build.
                <span className="gradient-text"> Collaborate.</span>
                <br />
                Ship together.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Write code together in real-time, discuss solutions,
                review changes and build better software with your team.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="gradient-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-xl shadow-indigo-500/20 sm:w-auto"
                >
                  <FiPlus />
                  Create Room
                  <FiArrowRight />
                </button>

                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="liquid-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-200 sm:w-auto"
                >
                  <FiUsers />
                  Join Room
                </button>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <div className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Your Rooms</p>
                  <p className="mt-2 text-2xl font-bold">{rooms.length}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                  <FiCode size={20} />
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1 text-xs text-green-400">
                <FiActivity size={12} />
                Live workspace
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Total Members</p>
                  <p className="mt-2 text-2xl font-bold">
                    {rooms.reduce((acc, r) => acc + (r.membersCount || 1), 0)}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                  <FiUsers size={20} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Across your rooms</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Language Support</p>
                  <p className="mt-2 text-2xl font-bold">JS, Python, Java</p>
                </div>
                <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <FiFolder size={20} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Isolated execution</p>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Real-Time Sync</p>
                  <p className="mt-2 text-2xl font-bold">Yjs CRDT</p>
                </div>
                <div className="shrink-0 rounded-xl bg-pink-500/10 p-3 text-pink-400">
                  <FiMessageSquare size={20} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">WebSocket enabled</p>
            </div>
          </section>

          {/* QUICK START */}
          <section className="mt-8 sm:mt-10">
            <div className="mb-4 flex items-end justify-between sm:mb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                  Get started
                </p>
                <h3 className="mt-1 text-xl font-bold">Quick Start</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="glass-card group relative overflow-hidden rounded-2xl p-5 text-left sm:p-6"
              >
                <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl transition group-hover:bg-indigo-500/30" />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 sm:mb-5">
                    <FiPlus size={21} />
                  </div>
                  <h4 className="font-semibold">Create a Room</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Start a new collaborative coding session with your team.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-400">
                    Create room
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowJoinModal(true)}
                className="glass-card group relative overflow-hidden rounded-2xl p-5 text-left sm:p-6"
              >
                <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-cyan-500/20 blur-2xl transition group-hover:bg-cyan-500/30" />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 sm:mb-5">
                    <FiUsers size={21} />
                  </div>
                  <h4 className="font-semibold">Join a Room</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Enter a room code and start collaborating instantly.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-cyan-400">
                    Join room
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/editor")}
                className="glass-card group relative overflow-hidden rounded-2xl p-5 text-left sm:p-6"
              >
                <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-purple-500/20 blur-2xl transition group-hover:bg-purple-500/30" />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 sm:mb-5">
                    <FiEdit3 size={21} />
                  </div>
                  <h4 className="font-semibold">Open Editor</h4>
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Jump directly into the CodeSync collaborative editor.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-purple-400">
                    Open editor
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* RECENT ROOMS WITH SEARCH FILTERING */}
          <section className="mt-8 pb-8 sm:mt-10 sm:pb-10">
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                    Workspace
                  </p>
                  <h3 className="mt-1 text-xl font-bold flex items-center gap-2">
                    <span>Your Rooms</span>
                    {searchQuery.trim() !== "" && (
                      <span className="text-xs font-normal text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                        {filteredRooms.length} {filteredRooms.length === 1 ? "match" : "matches"}
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              {searchQuery.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                >
                  <FiX size={14} />
                  Clear filter
                </button>
              )}
            </div>

            {loadingRooms ? (
              <div className="flex justify-center p-12 text-sm text-slate-400">
                Loading your rooms...
              </div>
            ) : rooms.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center backdrop-blur-xl">
                <FiFolder className="mx-auto mb-3 text-slate-600" size={32} />
                <p className="font-semibold text-slate-300">No rooms found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Create a new room or join an existing one to get started.
                </p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center backdrop-blur-xl">
                <FiSearch className="mx-auto mb-3 text-indigo-400/60" size={32} />
                <p className="font-semibold text-slate-300">No rooms matching "{searchQuery}"</p>
                <p className="mt-1 text-xs text-slate-500">
                  We couldn't find any rooms matching your search term.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
                {filteredRooms.map((room, index) => (
                  <div
                    key={room.id}
                    className={`group flex flex-col gap-4 p-4 transition hover:bg-white/[0.04] sm:p-5 md:flex-row md:items-center ${
                      index !== filteredRooms.length - 1
                        ? "border-b border-white/10"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 sm:h-11 sm:w-11">
                        <FiCode size={20} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-white">
                          {room.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Owner: {room.owner?.name || "You"}</span>
                          <span>•</span>
                          <span>{room.membersCount || 1} members</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden flex-1 md:block">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Room ID
                      </p>
                      <button
                        type="button"
                        onClick={() => copyRoomId(room.id)}
                        className="mt-1 flex items-center gap-2 text-xs text-slate-400 transition hover:text-indigo-300"
                      >
                        {room.id}
                        {copiedId === room.id ? (
                          <FiCheck className="text-green-400" size={12} />
                        ) : (
                          <FiCopy size={12} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/editor?roomId=${room.id}`)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-white sm:px-4"
                      >
                        Open Editor
                        <FiArrowRight size={14} />
                      </button>

                      {room.ownerId === user?.id && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRoom(room.id, room.name, e)}
                          title="Delete room"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODALS */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
};

export default DashboardPage;