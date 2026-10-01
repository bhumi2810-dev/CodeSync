import { useState, useEffect } from "react";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/auth.service";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("No password reset token provided. Please request a new reset link.");
      setIsSuccess(false);
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setMessage("Invalid reset link. Missing token.");
      setIsSuccess(false);
      return;
    }

    if (password === "" || confirmPassword === "") {
      setMessage("Please fill in both password fields.");
      setIsSuccess(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const res = await authService.resetPassword(token, password);
      setIsSuccess(true);
      setMessage(res.message || "Password updated successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1800);
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(
        err.response?.data?.message ||
        err.response?.data?.errors?.password?.[0] ||
        "Failed to reset password. The link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 text-white sm:px-6 sm:py-8">

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[90px] sm:h-96 sm:w-96 sm:blur-3xl" />

      {/* Card */}
      <div className="glass-card relative w-full max-w-md rounded-2xl p-5 sm:p-7 md:p-8">

        {/* Icon */}
        <div className="mb-5 flex justify-center sm:mb-6">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/10 sm:h-16 sm:w-16">
            <FaLock className="text-lg sm:text-2xl" />
          </div>

        </div>

        {/* Heading */}
        <div className="mb-6 text-center sm:mb-7">

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Reset Password
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Create a new password for your CodeSync account.
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* New Password */}
          <div className="mb-5">

            <label className="mb-2 block text-xs font-medium text-slate-400">
              New Password
            </label>

            <div className="relative">

              <FaLock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
              >
                {showPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>

            </div>

            <p className="mt-2 text-[10px] text-slate-600">
              Password must contain at least 6 characters.
            </p>

          </div>

          {/* Confirm Password */}
          <div className="mb-5">

            <label className="mb-2 block text-xs font-medium text-slate-400">
              Confirm Password
            </label>

            <div className="relative">

              <FaLock
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={14} />
                ) : (
                  <FaEye size={14} />
                )}
              </button>

            </div>

          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-5 rounded-lg border px-3 py-2.5 text-xs leading-5 ${
                isSuccess
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {message}
            </div>
          )}

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading || !token}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <FaSpinner size={13} className="animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <FaCheck size={13} />
                Reset Password
              </>
            )}
          </button>

        </form>

        {/* Back to Login */}
        <div className="mt-6 border-t border-white/10 pt-5 text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-indigo-400 sm:text-sm"
          >
            <FaArrowLeft size={11} />
            Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ResetPasswordPage;