import { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiSend } from "react-icons/fi";
import { chatService } from "../../services/chat.service";
import type { ChatMessage } from "../../services/chat.service";

interface ChatPanelProps {
  roomId?: string;
  currentUserId?: string;
  currentUserName?: string;
  messages?: ChatMessage[];
  onSendMessage?: (content: string) => void;
}

const ChatPanel = ({
  roomId = "",
  currentUserId = "",
  messages = [],
  onSendMessage,
}: ChatPanelProps) => {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (roomId && (!messages || messages.length === 0)) {
      loadHistory();
    }
  }, [roomId]);

  const loadHistory = async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const res = await chatService.getChatMessages(roomId);
      if (res.success) {
        setLocalMessages(res.data);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    if (onSendMessage) {
      onSendMessage(content);
    } else if (roomId) {
      try {
        const res = await chatService.sendChatMessage(roomId, content);
        if (res.success) {
          setLocalMessages((prev) => [...prev, res.data]);
        }
      } catch (err) {
        console.error("Failed to send chat message:", err);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950/40">
      {/* Chat Header */}
      <div className="shrink-0 border-b border-white/10 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <FiMessageSquare size={15} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Room Chat</h2>
            <p className="text-[10px] text-slate-500">
              Live conversation with collaborators
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {loading && localMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Loading messages...
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="px-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <FiMessageSquare size={17} />
              </div>
              <p className="text-xs text-slate-400">No messages yet</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Start a conversation with your team.
              </p>
            </div>
          </div>
        ) : (
          localMessages.map((message) => {
            const isOwn = message.authorId === currentUserId;
            const authorName = isOwn ? "You" : message.author?.name || "Collaborator";
            const timeStr = message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[88%] flex-col ${
                    isOwn ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`mb-1 flex items-center gap-1.5 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium ${
                        isOwn ? "text-indigo-400" : "text-slate-300"
                      }`}
                    >
                      {authorName}
                    </span>
                    <span className="text-[9px] text-slate-600">{timeStr}</span>
                  </div>

                  <div
                    className={`rounded-xl px-3 py-2 text-xs leading-5 break-words ${
                      isOwn
                        ? "rounded-br-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/10"
                        : "rounded-bl-sm border border-white/5 bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="shrink-0 border-t border-white/10 p-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={2}
            className="min-w-0 flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/10"
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ""}
            title="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/10 transition hover:from-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600"
          >
            <FiSend size={14} />
          </button>
        </div>

        <p className="mt-1.5 text-[9px] text-slate-600">
          Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;