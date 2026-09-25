import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  title = "Something went wrong",
  message = "We couldn't load this information. Please try again.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="max-w-sm text-center">

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/10 text-red-400">
          <FaExclamationTriangle size={18} />
        </div>

        <h3 className="text-sm font-semibold text-slate-300">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white"
          >
            <FaRedo size={10} />
            Try Again
          </button>
        )}

      </div>
    </div>
  );
};

export default ErrorState;