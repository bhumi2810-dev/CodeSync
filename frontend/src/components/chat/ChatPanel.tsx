import { useEffect, useRef, useState } from "react";
import { FiMessageSquare, FiSend } from "react-icons/fi";

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "Developer 2",
      text: "Hey! Let's review the code together.",
      time: "10:35 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Sure! I will check the main function.",
      time: "10:37 AM",
      isOwn: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") {
      return;
    }

    const message: ChatMessage = {
      id: Date.now(),
      sender: "You",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
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
            <h2 className="text-sm font-semibold text-white">
              Team Chat
            </h2>

            <p className="text-[10px] text-slate-500">
              2 members in this room
            </p>
          </div>

        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="px-4 text-center">

              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                <FiMessageSquare size={17} />
              </div>

              <p className="text-xs text-slate-400">
                No messages yet
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                Start a conversation with your team.
              </p>

            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[88%] flex-col ${
                  message.isOwn ? "items-end" : "items-start"
                }`}
              >

                {/* Sender and Time */}
                <div
                  className={`mb-1 flex items-center gap-1.5 ${
                    message.isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      message.isOwn
                        ? "text-indigo-400"
                        : "text-slate-300"
                    }`}
                  >
                    {message.sender}
                  </span>

                  <span className="text-[9px] text-slate-600">
                    {message.time}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-xl px-3 py-2 text-xs leading-5 ${
                    message.isOwn
                      ? "rounded-br-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/10"
                      : "rounded-bl-sm border border-white/5 bg-white/[0.05] text-slate-300"
                  }`}
                >
                  {message.text}
                </div>

              </div>
            </div>
          ))
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