import { useState } from "react";
import { FiTrash2, FiMessageSquare } from "react-icons/fi";

interface ReviewComment {
  id: number;
  author: string;
  line: number;
  text: string;
  time: string;
}

const CodeReviewPanel = () => {
  const [comments, setComments] = useState<ReviewComment[]>([
    {
      id: 1,
      author: "Developer 2",
      line: 3,
      text: "This line looks good, but we could improve the variable name.",
      time: "10:35 AM",
    },
  ]);

  const [newComment, setNewComment] = useState("");
  const [lineNumber, setLineNumber] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() === "" || lineNumber.trim() === "") {
      return;
    }

    const line = Number(lineNumber);

    if (line <= 0) {
      return;
    }

    const comment: ReviewComment = {
      id: Date.now(),
      author: "You",
      line: line,
      text: newComment.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setComments([...comments, comment]);
    setNewComment("");
    setLineNumber("");
  };

  const handleDeleteComment = (id: number) => {
    setComments(
      comments.filter((comment) => comment.id !== id)
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/40">

      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-3 py-3">

        <div className="flex items-center gap-2.5">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <FiMessageSquare size={15} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Code Review
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-500">
              {comments.length} review{" "}
              {comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>

        </div>

      </div>

      {/* Comments */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5">

        {comments.length === 0 ? (

          <div className="flex h-full items-center justify-center px-4">

            <div className="text-center">

              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <FiMessageSquare size={17} />
              </div>

              <p className="text-xs font-medium text-slate-400">
                No review comments
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Add a comment to start reviewing the code.
              </p>

            </div>

          </div>

        ) : (

          comments.map((comment) => (

            <div
              key={comment.id}
              className="rounded-lg border border-white/5 bg-white/[0.04] p-2.5 transition hover:border-white/10 hover:bg-white/[0.06]"
            >

              {/* Comment Header */}
              <div className="flex items-center justify-between gap-2">

                <span
                  className={`truncate text-[11px] font-semibold ${
                    comment.author === "You"
                      ? "text-indigo-400"
                      : "text-purple-400"
                  }`}
                >
                  {comment.author}
                </span>

                <span className="shrink-0 text-[9px] text-slate-600">
                  {comment.time}
                </span>

              </div>

              {/* Line Number */}
              <div className="mt-2">

                <span className="rounded-md border border-indigo-500/10 bg-indigo-500/10 px-2 py-1 text-[9px] font-medium text-indigo-300">
                  Line {comment.line}
                </span>

              </div>

              {/* Comment Text */}
              <p className="mt-2.5 text-[11px] leading-5 text-slate-300">
                {comment.text}
              </p>

              {/* Delete */}
              {comment.author === "You" && (

                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-600 transition hover:text-red-400"
                >
                  <FiTrash2 size={11} />
                  Delete
                </button>

              )}

            </div>

          ))

        )}

      </div>

      {/* Add Comment */}
      <div className="shrink-0 border-t border-white/10 p-2.5">

        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Add Review Comment
        </p>

        {/* Line Number */}
        <input
          type="number"
          min="1"
          value={lineNumber}
          onChange={(event) => setLineNumber(event.target.value)}
          placeholder="Line number"
          className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.06]"
        />

        {/* Comment */}
        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Add a review comment..."
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.06]"
        />

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAddComment}
          disabled={
            newComment.trim() === "" ||
            lineNumber.trim() === ""
          }
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-[11px] font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:from-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600"
        >
          <FiMessageSquare size={12} />
          Add Comment
        </button>

      </div>

    </div>
  );
};

export default CodeReviewPanel;