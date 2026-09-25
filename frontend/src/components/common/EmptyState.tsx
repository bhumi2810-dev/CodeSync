import { FaInbox } from "react-icons/fa";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

const EmptyState = ({
  title = "Nothing here yet",
  message = "There is no data to display.",
}: EmptyStateProps) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="max-w-sm text-center">

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500">
          <FaInbox size={18} />
        </div>

        <h3 className="text-sm font-semibold text-slate-300">
          {title}
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {message}
        </p>

      </div>
    </div>
  );
};

export default EmptyState;