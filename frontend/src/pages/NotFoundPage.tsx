import {
  FaArrowLeft,
  FaHome,
  FaSearch,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 text-white">

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Main Card */}
      <div className="relative w-full max-w-lg text-center">

        {/* 404 */}
        <div className="mb-6">

          <h1 className="text-8xl font-black tracking-tight text-indigo-500/20 sm:text-9xl">
            404
          </h1>

          <div className="-mt-12 sm:-mt-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/10">
              <FaSearch size={24} />
            </div>

          </div>

        </div>

        {/* Text */}
        <div className="mb-8">

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Page Not Found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            The page you are looking for doesn't exist or may have
            been moved to another location.
          </p>

        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white sm:w-auto"
          >
            <FaArrowLeft size={12} />
            Go Back
          </button>

          <Link
            to="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 sm:w-auto"
          >
            <FaHome size={13} />
            Dashboard
          </Link>

        </div>

        {/* Logo */}
        <div className="mt-10 flex items-center justify-center gap-2">

          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10 text-[9px] font-bold text-indigo-400">
            {"</>"}
          </div>

          <span className="text-sm font-bold">
            <span className="text-white">Code</span>
            <span className="text-indigo-400">Sync</span>
          </span>

        </div>

      </div>

    </div>
  );
};

export default NotFoundPage;