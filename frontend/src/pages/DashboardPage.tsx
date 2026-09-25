import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
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
  FiSettings,
  FiUsers,
  FiX,
  FiArrowRight,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import Logo from "../components/common/Logo";

interface Room {
  id: string;
  name: string;
  language: string;
  members: number;
  lastActive: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "CS-48291",
      name: "Java Practice",
      language: "Java",
      members: 3,
      lastActive: "2 min ago",
    },
    {
      id: "CS-71924",
      name: "DSA Problems",
      language: "JavaScript",
      members: 2,
      lastActive: "18 min ago",
    },
    {
      id: "CS-31567",
      name: "Team Project",
      language: "Java",
      members: 5,
      lastActive: "1 hour ago",
    },
  ]);

  const createRoom = () => {
    if (!roomName.trim()) {
      return;
    }

    const newRoom: Room = {
      id: "CS-" + Math.floor(10000 + Math.random() * 90000),
      name: roomName,
      language: "Java",
      members: 1,
      lastActive: "Just now",
    };

    setRooms([newRoom, ...rooms]);
    setRoomName("");
    setShowCreateModal(false);
    setSidebarOpen(false);

    navigate("/editor");
  };

  const joinRoom = () => {
    if (!joinCode.trim()) {
      return;
    }

    setJoinCode("");
    setShowJoinModal(false);
    setSidebarOpen(false);

    navigate("/editor");
  };

  const openRoom = () => {
    navigate("/editor");
  };

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
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
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FiClock size={18} />
              Recent Rooms
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

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <FiSettings size={18} />
              Settings
            </button>

          </nav>
        </div>

        {/* Bottom User */}
        <div className="mt-auto border-t border-white/10 p-4">

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/20">
              B
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Bhumika
              </p>

              <p className="truncate text-xs text-slate-500">
                Developer
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 text-slate-500 transition hover:text-white"
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

          {/* Header Left */}
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
              <p className="text-xs text-slate-500">
                Workspace
              </p>

              <h1 className="truncate text-sm font-semibold text-white">
                Developer Dashboard
              </h1>
            </div>

          </div>

          {/* Search */}
          <div className="mx-2 hidden max-w-md flex-1 md:block lg:mx-4">

            <div className="relative">

              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={17}
              />

              <input
                type="text"
                placeholder="Search rooms..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/40 focus:bg-white/[0.06] sm:h-11"
              />

              <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-500 xl:block">
                Ctrl K
              </span>

            </div>

          </div>

          {/* Header Right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <FiBell size={18} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
            </button>

            <div className="relative">

              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-2 transition hover:bg-white/10 sm:pr-3"
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold">
                  B
                </div>

                <span className="hidden text-sm font-medium text-slate-300 sm:block">
                  Bhumika
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

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    <FiSettings size={16} />
                    Settings
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  <button
                    type="button"
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

        {/* CONTENT */}
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-5 sm:py-8 md:px-8 lg:px-10">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/25 via-purple-600/15 to-cyan-500/10 p-5 shadow-2xl shadow-indigo-950/30 sm:rounded-3xl sm:p-7 md:p-10">

            {/* Hero Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-[80px] sm:h-64 sm:w-64 sm:blur-[90px]" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-purple-500/20 blur-[80px] sm:h-64 sm:w-64 sm:blur-[90px]" />

            <div className="relative z-10 max-w-3xl">

              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium text-cyan-300 sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400" />
                Workspace is online
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

            {/* Decorative Code Window */}
            <div className="absolute bottom-8 right-8 hidden w-[300px] rounded-2xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur-xl 2xl:block">

              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />

                <span className="ml-auto text-[10px] text-slate-600">
                  Main.java
                </span>
              </div>

              <div className="space-y-1 font-mono text-[11px] leading-5">
                <p className="text-purple-400">
                  public class <span className="text-cyan-300">Main</span> {"{"}
                </p>

                <p className="pl-4 text-slate-500">
                  public static void main(String[] args) {"{"}
                </p>

                <p className="pl-8 text-indigo-300">
                  System.out.println(
                  <span className="text-green-300">
                    "Hello CodeSync"
                  </span>
                  );
                </p>

                <p className="pl-4 text-slate-500">
                  {"}"}
                </p>

                <p className="text-purple-400">
                  {"}"}
                </p>
              </div>

            </div>

          </section>

          {/* STATS */}
          <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

            {/* Active Rooms */}
            <div className="glass-card rounded-2xl p-4 sm:p-5">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Active Rooms
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {rooms.length}
                  </p>
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

            {/* Collaborators */}
            <div className="glass-card rounded-2xl p-4 sm:p-5">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Collaborators
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    10
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                  <FiUsers size={20} />
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-500">
                Across your rooms
              </p>

            </div>

            {/* Code Sessions */}
            <div className="glass-card rounded-2xl p-4 sm:p-5">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Code Sessions
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    24
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-purple-500/10 p-3 text-purple-400">
                  <FiFolder size={20} />
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-500">
                This month
              </p>

            </div>

            {/* Reviews */}
            <div className="glass-card rounded-2xl p-4 sm:p-5">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Reviews
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    18
                  </p>
                </div>

                <div className="shrink-0 rounded-xl bg-pink-500/10 p-3 text-pink-400">
                  <FiMessageSquare size={20} />
                </div>

              </div>

              <p className="mt-3 text-xs text-slate-500">
                Code reviews completed
              </p>

            </div>

          </section>

          {/* QUICK START */}
          <section className="mt-8 sm:mt-10">

            <div className="mb-4 flex items-end justify-between sm:mb-5">

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                  Get started
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Quick Start
                </h3>
              </div>

            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">

              {/* Create */}
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

                  <h4 className="font-semibold">
                    Create a Room
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Start a new collaborative coding session with your team.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-400">
                    Create room
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>

                </div>

              </button>

              {/* Join */}
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

                  <h4 className="font-semibold">
                    Join a Room
                  </h4>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Enter a room code and start collaborating instantly.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-cyan-400">
                    Join room
                    <FiArrowRight className="transition group-hover:translate-x-1" />
                  </div>

                </div>

              </button>

              {/* Editor */}
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

                  <h4 className="font-semibold">
                    Open Editor
                  </h4>

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

          {/* RECENT ROOMS */}
          <section className="mt-8 pb-8 sm:mt-10 sm:pb-10">

            <div className="mb-4 flex items-end justify-between sm:mb-5">

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
                  Workspace
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Recent Rooms
                </h3>
              </div>

              <button
                type="button"
                className="text-xs text-slate-500 transition hover:text-white sm:text-sm"
              >
                View all
              </button>

            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">

              {rooms.map((room, index) => (

                <div
                  key={room.id}
                  className={`group flex flex-col gap-4 p-4 transition hover:bg-white/[0.04] sm:p-5 md:flex-row md:items-center ${
                    index !== rooms.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >

                  {/* Room Info */}
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 sm:h-11 sm:w-11">
                      <FiCode size={20} />
                    </div>

                    <div className="min-w-0">

                      <h4 className="truncate font-semibold text-white">
                        {room.name}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{room.language}</span>
                        <span>•</span>
                        <span>{room.members} members</span>
                      </div>

                    </div>

                  </div>

                  {/* Room ID */}
                  <div className="hidden flex-1 md:block">

                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Room ID
                    </p>

                    <button
                      type="button"
                      onClick={() => copyRoomId(room.id)}
                      className="mt-1 flex items-center gap-2 text-xs text-slate-500 transition hover:text-indigo-300"
                    >
                      {room.id}
                      <FiCopy size={12} />
                    </button>

                  </div>

                  {/* Activity */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                    {room.lastActive}
                  </div>

                  {/* Open */}
                  <button
                    type="button"
                    onClick={openRoom}
                    className="liquid-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-200 md:w-auto"
                  >
                    Open
                    <FiArrowRight />
                  </button>

                </div>

              ))}

            </div>

          </section>

        </div>

      </main>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">

          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl sm:rounded-3xl">

            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5 sm:p-6">

              <div className="min-w-0">

                <p className="text-xs uppercase tracking-widest text-indigo-400">
                  New workspace
                </p>

                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  Create Room
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create room modal"
                className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <FiX size={19} />
              </button>

            </div>

            <div className="p-5 sm:p-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Room Name
              </label>

              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createRoom();
                  }
                }}
                placeholder="e.g. DSA Practice"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.06]"
              />

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Your teammates can join using the generated room ID.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="liquid-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createRoom}
                  className="gradient-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                >
                  Create Room
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* JOIN ROOM MODAL */}
      {showJoinModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md">

          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:rounded-3xl">

            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5 sm:p-6">

              <div className="min-w-0">

                <p className="text-xs uppercase tracking-widest text-cyan-400">
                  Collaborate
                </p>

                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  Join Room
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                aria-label="Close join room modal"
                className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <FiX size={19} />
              </button>

            </div>

            <div className="p-5 sm:p-6">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Room ID
              </label>

              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    joinRoom();
                  }
                }}
                placeholder="e.g. CS-48291"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm uppercase tracking-wider text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/[0.06]"
              />

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Enter the room ID shared by your teammate.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="liquid-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={joinRoom}
                  className="gradient-button flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                >
                  Join Room
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default DashboardPage;