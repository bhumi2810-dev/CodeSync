import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCode,
  FaSave,
  FaArrowLeft,
  FaLaptopCode,
  FaComments,
  FaHistory,
  FaLanguage,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";
import type { ProfileStats } from "../services/auth.service";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [stats, setStats] = useState<ProfileStats>({
    roomsCount: 0,
    commentsCount: 0,
    snapshotsCount: 0,
    mostUsedLanguage: "javascript",
    defaultLanguage: "javascript",
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.defaultLanguage) {
        setLanguage(user.defaultLanguage);
      }
    }

    fetchProfileAndStats();
  }, [user, isAuthenticated, authLoading]);

  const fetchProfileAndStats = async () => {
    try {
      setLoadingStats(true);
      const res = await authService.getProfileStats();
      if (res.success && res.data) {
        if (res.data.user) {
          setName(res.data.user.name || "");
          setEmail(res.data.user.email || "");
          if (res.data.user.defaultLanguage) {
            setLanguage(res.data.user.defaultLanguage);
          }
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load profile stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess(false);

      const res = await authService.updateProfile({
        name: name.trim(),
        defaultLanguage: language,
      });

      if (res.success) {
        setSaveSuccess(true);
        await refreshUser();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const displayName = name || user?.name || "Developer";
  const userInitial = displayName.charAt(0).toUpperCase();

  const getLanguageLabel = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
        return "JavaScript";
      case "python":
        return "Python";
      case "java":
        return "Java";
      default:
        return lang;
    }
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
              Collaborative Coding Workspace
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
            Manage your account information, default programming language, and workspace preferences.
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
                  {userInitial}
                </div>

                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-green-400" />
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white">{displayName}</h3>
                <p className="mt-1 text-sm text-indigo-400">
                  Default Language: {getLanguageLabel(language)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white">
                Personal Information & Preferences
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Update the details and default execution language associated with your CodeSync account.
              </p>
            </div>

            {saveSuccess && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <FaCheckCircle className="shrink-0 text-emerald-400" />
                <span>Profile preferences updated and saved successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                <FaExclamationCircle className="shrink-0 text-red-400" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Display Name
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
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    type="email"
                    value={email}
                    disabled
                    title="Email is managed through your authentication credentials"
                    className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Default Programming Language
                </label>
                <div className="relative">
                  <FaLanguage
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400"
                  />
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pl-10 text-sm text-white outline-none transition hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06]"
                  >
                    <option value="javascript" className="bg-slate-900 text-white">
                      JavaScript (Node.js)
                    </option>
                    <option value="python" className="bg-slate-900 text-white">
                      Python 3
                    </option>
                    <option value="java" className="bg-slate-900 text-white">
                      Java (JDK)
                    </option>
                  </select>
                </div>
              </div>

              {/* Authentication Type */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Account Provider
                </label>
                <div className="relative">
                  <FaCode
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    type="text"
                    value={user?.provider === "github" ? "GitHub OAuth" : "Local Email/Password"}
                    disabled
                    className="w-full rounded-xl border border-white/5 bg-white/[0.02] py-3 pl-10 pr-4 text-sm text-slate-400 outline-none cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50"
              >
                <FaSave size={13} />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>

        {/* Real Statistics from Backend */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Rooms Joined
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {loadingStats ? "..." : stats.roomsCount}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">Active workspaces</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaLaptopCode size={16} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Code Reviews
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {loadingStats ? "..." : stats.commentsCount}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">Comments posted</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaComments size={15} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Saved Snapshots
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {loadingStats ? "..." : stats.snapshotsCount}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">Code versions</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/10 bg-indigo-500/10 text-indigo-400">
                <FaHistory size={15} />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Preferred Language
                </p>
                <p className="mt-2 truncate text-xl font-bold text-white">
                  {getLanguageLabel(stats.defaultLanguage || language)}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">Default workspace file</p>
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