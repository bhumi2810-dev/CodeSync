import { useState, useEffect } from "react";
import { FiTrash2, FiMessageSquare, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { commentService } from "../../services/comment.service";
import type { Comment } from "../../services/comment.service";

interface CodeReviewPanelProps {
  roomId?: string;
  currentUserId?: string;
}

const CodeReviewPanel = ({
  roomId = "",
  currentUserId = "",
}: CodeReviewPanelProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [lineNumber, setLineNumber] = useState("");
  const [commentType, setCommentType] = useState<"BUG" | "SUGGESTION" | "EXPLANATION">("SUGGESTION");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (roomId) {
      loadComments();
    }
  }, [roomId]);

  const loadComments = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await commentService.getComments(roomId);
      if (res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "" || lineNumber.trim() === "" || !roomId) {
      return;
    }

    const line = Number(lineNumber);
    if (line <= 0) return;

    setErrorMessage("");
    try {
      const res = await commentService.createComment(roomId, {
        lineNumber: line,
        type: commentType,
        content: newComment.trim(),
      });

      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment("");
        setLineNumber("");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleResolveComment = async (commentId: string) => {
    if (!roomId) return;
    setErrorMessage("");
    try {
      const res = await commentService.resolveComment(roomId, commentId);
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? res.data : c))
        );
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to resolve comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!roomId) return;
    setErrorMessage("");
    try {
      const res = await commentService.deleteComment(roomId, commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorMessage("You can only delete your own comments.");
      } else {
        setErrorMessage(err.response?.data?.message || "Failed to delete comment");
      }
    }
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
            <h2 className="text-sm font-semibold text-white">Code Review</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {comments.length} review {comments.length === 1 ? "comment" : "comments"}
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mx-2.5 mt-2 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-300">
          <FiAlertCircle size={14} className="shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Comments List */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5">
        {loading && comments.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <FiMessageSquare size={17} />
              </div>
              <p className="text-xs font-medium text-slate-400">No review comments</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Add a comment to start reviewing the code.
              </p>
            </div>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.authorId === currentUserId;
            const authorName = isAuthor ? "You" : comment.author?.name || "Collaborator";

            const typeBadgeColor =
              comment.type === "BUG"
                ? "bg-red-500/15 text-red-400 border-red-500/20"
                : comment.type === "SUGGESTION"
                ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
                : "bg-blue-500/15 text-blue-300 border-blue-500/20";

            return (
              <div
                key={comment.id}
                className={`rounded-lg border p-2.5 transition ${
                  comment.resolved
                    ? "border-emerald-500/20 bg-emerald-950/10 opacity-75"
                    : "border-white/5 bg-white/[0.04] hover:border-white/10 hover:bg-white/[0.06]"
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-[11px] font-semibold ${
                      isAuthor ? "text-indigo-400" : "text-purple-400"
                    }`}
                  >
                    {authorName}
                  </span>

                  {comment.resolved ? (
                    <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400">
                      <FiCheckCircle size={10} />
                      Resolved
                    </span>
                  ) : null}
                </div>

                {/* Line & Type Tag */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded-md border border-indigo-500/10 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-medium text-indigo-300">
                    Line {comment.lineNumber}
                  </span>

                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${typeBadgeColor}`}
                  >
                    {comment.type}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="mt-2 text-[11px] leading-5 text-slate-300 break-words">
                  {comment.content}
                </p>

                {/* Action buttons */}
                <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-1.5">
                  {!comment.resolved && (
                    <button
                      type="button"
                      onClick={() => handleResolveComment(comment.id)}
                      className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 transition hover:text-emerald-300"
                    >
                      <FiCheckCircle size={10} />
                      Resolve
                    </button>
                  )}

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-auto flex items-center gap-1 text-[10px] text-slate-500 transition hover:text-red-400"
                    >
                      <FiTrash2 size={10} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Comment Form */}
      <div className="shrink-0 border-t border-white/10 p-2.5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Add Review Comment
        </p>

        <div className="mb-2 flex gap-2">
          {/* Line Number */}
          <input
            type="number"
            min="1"
            value={lineNumber}
            onChange={(event) => setLineNumber(event.target.value)}
            placeholder="Line #"
            className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50"
          />

          {/* Type Selector */}
          <select
            value={commentType}
            onChange={(e) => setCommentType(e.target.value as any)}
            className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-[11px] text-white outline-none focus:border-indigo-500/50"
          >
            <option value="SUGGESTION">Suggestion</option>
            <option value="BUG">Bug</option>
            <option value="EXPLANATION">Explanation</option>
          </select>
        </div>

        {/* Comment */}
        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Add a review comment..."
          rows={2}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] leading-5 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.06]"
        />

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAddComment}
          disabled={newComment.trim() === "" || lineNumber.trim() === ""}
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