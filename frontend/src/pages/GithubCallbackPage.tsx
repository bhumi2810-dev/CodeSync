import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaGithub, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/auth.service";

const GithubCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGithub } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const codeProcessedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDescription || errorParam || "GitHub authentication was canceled or failed.");
      return;
    }

    if (!code) {
      setError("No authorization code received from GitHub.");
      return;
    }

    if (codeProcessedRef.current) return;
    codeProcessedRef.current = true;

    async function handleExchange() {
      try {
        const res = await authService.loginWithGithub({ code: code! });
        if (res.success && res.data) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          // Update context
          await loginWithGithub({ code: code! });
          navigate("/dashboard", { replace: true });
        } else {
          setError(res.message || "Failed to complete GitHub sign-in");
        }
      } catch (err: any) {
        console.error("GitHub callback exchange error:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to verify GitHub authorization code. Please verify GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
        );
      }
    }

    handleExchange();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[100px]" />

      <div className="glass-card relative w-full max-w-md rounded-2xl p-6 sm:p-8 text-center">
        {error ? (
          <div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10">
              <FaExclamationTriangle size={24} />
            </div>

            <h2 className="text-xl font-bold text-white">GitHub Login Failed</h2>
            <p className="mt-2 text-xs leading-5 text-red-300 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              {error}
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
        ) : (
          <div>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg">
              <FaGithub size={32} className="animate-pulse" />
            </div>

            <h2 className="text-xl font-bold text-white">Authenticating with GitHub</h2>
            <p className="mt-2 text-xs text-slate-400">
              Verifying your GitHub identity and setting up your collaborative workspace...
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

export default GithubCallbackPage;
