import { FiTerminal, FiTrash2 } from "react-icons/fi";

interface OutputConsoleProps {
  output: string;
  error?: string;
}

const OutputConsole = ({
  output,
  error,
}: OutputConsoleProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/80">

      {/* Console Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 px-4">

        <div className="flex items-center gap-2">
          <FiTerminal
            size={14}
            className="text-indigo-400"
          />

          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Output
          </h2>
        </div>

        {/* Clear Button */}
        <button
          type="button"
          title="Clear output"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
        >
          <FiTrash2 size={13} />
        </button>
      </div>

      {/* Console Content */}
      <div className="min-h-0 flex-1 overflow-auto p-4">

        {error ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />

              <span className="text-xs font-medium text-red-400">
                Error
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-red-300">
              {error}
            </pre>
          </div>
        ) : output ? (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              <span className="text-xs font-medium text-green-400">
                Program Output
              </span>
            </div>

            <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">
              {output}
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FiTerminal
                size={24}
                className="mx-auto mb-2 text-slate-700"
              />

              <p className="text-xs text-slate-500">
                Run your code to see the output here.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OutputConsole;