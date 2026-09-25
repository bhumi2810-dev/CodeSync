import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCode,
  FaSave,
  FaArrowLeft,
  FaEdit,
  FaLaptopCode,
  FaStar,
  FaLanguage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("Bhumika Rana");
  const [email, setEmail] = useState("bhumika@example.com");
  const [role, setRole] = useState("Developer");
  const [language, setLanguage] = useState("Java");

  const handleSave = () => {
    alert("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen w-full text-white">

      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/85 px-4 backdrop-blur-xl md:px-8">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-bold text-indigo-400">
            {"</>"}
          </div>

          <div>
            <h1 className="text-lg font-bold">
              <span className="text-white">Code</span>
              <span className="gradient-text">Sync</span>
            </h1>

            <p className="hidden text-[10px] text-slate-500 sm:block">
              Collaborative Coding
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white md:px-4 md:text-sm"
        >
          <FaArrowLeft size={12} />
          Dashboard
        </button>

      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">

        {/* Page Title */}
        <div className="mb-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Account Settings
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Your Profile
          </h2>

          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage your account information and coding preferences.
          </p>

        </div>

        {/* Profile Card */}
        <section className="glass-card overflow-hidden rounded-2xl">

          {/* Profile Header */}
          <div className="relative overflow-hidden border-b border-white/10 p-6 md:p-8">

            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-5 sm:flex-row">

              {/* Avatar */}
              <div className="relative">

                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-indigo-400/20 bg-gradient-to-br from-indigo-500 to-blue-600 text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-green-400" />

              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">

                <h3 className="text-2xl font-bold text-white">
                  {name}
                </h3>

                <p className="mt-1 text-sm text-indigo-400">
                  {role}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  CodeSync Developer
                </p>

              </div>

              {/* Profile Settings */}
              <div className="sm:ml-auto">

                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                  <FaEdit size={12} />
                  Profile Settings
                </div>

              </div>

            </div>

          </div>

          {/* Personal Information */}
          <div className="p-6 md:p-8">

            <div className="mb-6">

              <h3 className="text-lg font-semibold text-white">
                Personal Information
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Update the information shown on your CodeSync profile.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Name */}
              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Name
                </label>

                <div className="relative">

                  <FaUser
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Email
                </label>

                <div className="relative">

                  <FaEnvelope
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                  />

                </div>

              </div>

              {/* Role */}
              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Role
                </label>

                <div className="relative">

                  <FaCode
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                  />

                </div>

              </div>

              {/* Language */}
              <div>

                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Default Language
                </label>

                <div className="relative">

                  <FaLanguage
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
                  />

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pl-10 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option
                      value="Java"
                      className="bg-slate-900 text-white"
                    >
                      Java
                    </option>

                    <option
                      value="JavaScript"
                      className="bg-slate-900 text-white"
                    >
                      JavaScript
                    </option>
                  </select>

                </div>

              </div>

            </div>

            {/* Save Button */}
            <div className="mt-7 flex justify-end">

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98]"
              >
                <FaSave size={13} />
                Save Changes
              </button>

            </div>

          </div>

        </section>

        {/* Statistics */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Rooms */}
          <div className="glass-card rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Rooms
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  3
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  Coding rooms
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaLaptopCode size={16} />
              </div>

            </div>

          </div>

          {/* Reviews */}
          <div className="glass-card rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Reviews
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  8
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  Reviews completed
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaStar size={15} />
              </div>

            </div>

          </div>

          {/* Language */}
          <div className="glass-card rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Language
                </p>

                <p className="mt-2 truncate text-2xl font-bold text-white">
                  {language}
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  Default language
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaCode size={16} />
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default ProfilePage;