import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiGithub,
} from "react-icons/fi";

import Logo from "../components/common/Logo";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Temporary frontend navigation.
    // Backend authentication will be connected later.
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">

      {/* Decorative background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[110px] sm:h-[500px] sm:w-[500px] sm:blur-[140px]" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-2xl backdrop-blur-xl sm:rounded-3xl lg:grid-cols-2">

        {/* Left side */}
        <div className="hidden flex-col justify-between p-12 lg:flex">

          <Logo size="md" />

          <div className="max-w-lg">

            <div className="mb-6 inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300">
              ✦ Collaborative coding workspace
            </div>

            <h1 className="text-5xl font-bold leading-tight text-white">
              Code together.
              <br />

              <span className="gradient-text">
                Build together.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
              CodeSync gives developers a shared space to write,
              review and discuss code in real time.
            </p>

            <div className="mt-10 flex gap-3">

              <div className="glass rounded-xl px-4 py-3">
                <p className="text-lg font-bold text-white">
                  Real-time
                </p>

                <p className="text-xs text-slate-500">
                  Collaboration
                </p>
              </div>

              <div className="glass rounded-xl px-4 py-3">
                <p className="text-lg font-bold text-white">
                  Fast
                </p>

                <p className="text-xs text-slate-500">
                  Code execution
                </p>
              </div>

              <div className="glass rounded-xl px-4 py-3">
                <p className="text-lg font-bold text-white">
                  Smart
                </p>

                <p className="text-xs text-slate-500">
                  Code reviews
                </p>
              </div>

            </div>
          </div>

          <p className="text-xs text-slate-600">
            © 2026 CodeSync. Built for developers.
          </p>

        </div>

        {/* Right side */}
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center border-white/10 p-5 sm:p-8 lg:min-h-0 lg:border-l lg:p-12">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 sm:mb-10 lg:hidden">
              <Logo size="md" />
            </div>

            {/* Heading */}
            <div className="mb-7 sm:mb-8">

              <p className="mb-2 text-sm font-medium text-indigo-400">
                Welcome back
              </p>

              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Sign in to CodeSync
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Continue where you left off.
              </p>

            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                />

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 transition hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="submit"
                className="gradient-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white"
              >
                Sign in

                <FiArrowRight size={17} />
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-slate-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* GitHub */}
              <button
                type="button"
                className="liquid-button flex w-full items-center justify-center gap-3 rounded-xl px-5 py-3 text-sm font-medium text-slate-300"
              >
                <FiGithub size={18} />

                Continue with GitHub
              </button>

            </form>

            {/* Signup */}
            <p className="mt-7 text-center text-sm text-slate-500 sm:mt-8">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;