import { FaSpinner } from "react-icons/fa";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({
  message = "Loading...",
}: LoadingStateProps) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">

        <FaSpinner
          size={24}
          className="animate-spin text-indigo-400"
        />

        <p className="text-sm text-slate-500">
          {message}
        </p>

      </div>
    </div>
  );
};

export default LoadingState;