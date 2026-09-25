const EditorLayout = () => {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Editor Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-900 px-6">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-400">
            CodeSync
          </h1>

          <div className="text-sm text-slate-400">
            Room: <span className="text-white">ABC123</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <select className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white outline-none">
            <option>Java</option>
            <option>JavaScript</option>
          </select>

          {/* Run Button */}
          <button
            type="button"
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            ▶ Run
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <aside className="w-60 border-r border-slate-700 bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Explorer
          </h2>

          <div className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white">
            📄 Main.java
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex flex-1 flex-col">
          {/* Code Area */}
          <div className="flex-1 bg-slate-950 p-6">
            <div className="h-full rounded-lg border border-slate-800 bg-slate-900 p-6">
              <pre className="font-mono text-sm leading-7 text-slate-300">
{`public class Main {

    public static void main(String[] args) {

        System.out.println("Hello CodeSync");

    }

}`}
              </pre>
            </div>
          </div>

          {/* Console */}
          <div className="h-40 border-t border-slate-700 bg-slate-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-400">
              Console
            </h2>

            <p className="font-mono text-sm text-green-400">
              Output will appear here...
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditorLayout;