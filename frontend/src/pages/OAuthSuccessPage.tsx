import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaGithub, FaExclamationTriangle, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam || errorDescription) {
      setStatus("error");
      setErrorMessage(
        errorDescription ||
        errorParam ||
        "GitHub authentication failed or was cancelled."
      );
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("No authorization token received. Please try logging in again.");
      return;
    }

    async function handleAuthSuccess() {
      try {
        // 1. Store JWT token
        localStorage.setItem("codesync_token", token!);

        // 2. Fetch authenticated user profile
        const userRes = await authService.getMe();
        if (userRes.success && userRes.data) {
          localStorage.setItem("codesync_user", JSON.stringify(userRes.data));
          await refreshUser();
          setStatus("success");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 600);
        } else {
          throw new Error("Could not load user profile with the provided token.");
        }
      } catch (err: any) {
        console.error("OAuth session initialization error:", err);
        localStorage.removeItem("codesync_token");
        localStorage.removeItem("codesync_user");
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
          err.message ||
          "Failed to establish session after GitHub login."
        );
      }
    }

    handleAuthSuccess();
  }, [searchParams, refreshUser, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="glass-card relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/60 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl">
        {status === "error" ? (
          <div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10">
              <FaExclamationTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-white">Authentication Failed</h2>
            <p className="mt-3 text-xs leading-5 text-red-300 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              {errorMessage}
            </p>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                <FaArrowLeft size={12} />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : status === "success" ? (
          <div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10">
              <FaCheckCircle size={24} />
            </div>

            <h2 className="text-xl font-bold text-white">Authentication Successful!</h2>
            <p className="mt-2 text-xs text-slate-400">
              Redirecting you to your workspace dashboard...
            </p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg">
              <FaGithub size={32} className="animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-white">Connecting with GitHub</h2>
            <p className="mt-2 text-xs text-slate-400">
              Verifying your GitHub identity and initializing your session...
            </p>

            <div className="mt-6 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
