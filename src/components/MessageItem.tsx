import clsx from "clsx";
import type { Message, User } from "../store/types";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const emojiPalette = ["👍", "🔥", "🎯", "✅", "⚡", "🎉", "🚀", "📌", "🎨"];

type Props = {
  message: Message;
  author: User | undefined;
  users: User[];
  showHeader: boolean;
  isSelected: boolean;
  currentUserId: string;
  onSelect: () => void;
  onToggleReaction: (emoji: string) => void;
  onTogglePin: () => void;
  onRetrySend: () => void;
};

const MessageItem = ({
  message,
  author,
  users,
  showHeader,
  isSelected,
  currentUserId,
  onSelect,
  onToggleReaction,
  onTogglePin,
  onRetrySend
}: Props) => {
  const isMine = message.authorId === currentUserId;
  const readBy = message.readBy ?? [];
  const readers = readBy
    .filter((id) => id !== message.authorId)
    .map((id) => users.find((user) => user.id === id))
    .filter(Boolean) as User[];
  const showRead = readers.length > 0;
  const statusLabel =
    message.status === "sending"
      ? "Sending..."
      : message.status === "failed"
      ? "Failed"
      : message.status === "sent"
      ? "Sent"
      : "";

  return (
    <div
      onClick={onSelect}
      className={clsx(
        "group rounded-2xl px-3 py-3 transition border border-transparent relative",
        isSelected ? "bg-ink-800/60 border-lime-500/40" : "hover:bg-ink-900/60"
      )}
    >
      <div className="absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(event) => {
            event.stopPropagation();
            navigator.clipboard?.writeText(message.content).catch(() => undefined);
          }}
          className="text-xs px-2 py-1 rounded-full border border-ink-700/60 text-ink-300 hover:border-lime-500/50"
        >
          Copy
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
          }}
          className="text-xs px-2 py-1 rounded-full border border-ink-700/60 text-ink-300 hover:border-lime-500/50"
        >
          Reply
        </button>
      </div>
      <div className="flex gap-3">
        {showHeader ? (
          <div className="h-10 w-10 rounded-2xl bg-ink-700/70 flex items-center justify-center text-sm font-semibold">
            {author?.avatar ?? "??"}
          </div>
        ) : (
          <div className="h-10 w-10" />
        )}
        <div className="flex-1">
          {showHeader && (
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-white">{author?.name ?? "Unknown"}</div>
              <div className="text-xs text-ink-400">{author?.title}</div>
              <div className="text-xs text-ink-500">{formatTime(message.createdAt)}</div>
            </div>
          )}
          <div className="text-sm text-ink-100 leading-relaxed">{message.content}</div>
          {message.attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-2 rounded-xl bg-ink-800/70 px-3 py-2 text-xs text-ink-200"
                >
                  <span className="text-ember-500">•</span>
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-[11px] text-ink-400">{file.size}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {emojiPalette.map((emoji) => {
              const count = message.reactions[emoji]?.length ?? 0;
              return (
                <button
                  key={emoji}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleReaction(emoji);
                  }}
                  className={clsx(
                    "px-2 py-1 rounded-full text-xs border transition",
                    count > 0
                      ? "bg-lime-500/20 text-lime-500 border-lime-500/40"
                      : "border-ink-700/40 text-ink-400 hover:border-ink-500/40"
                  )}
                >
                  {emoji} {count > 0 ? count : ""}
                </button>
              );
            })}
            <button
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin();
              }}
              className="px-2 py-1 rounded-full text-xs border border-ink-700/40 text-ink-400 hover:border-ember-500/40"
            >
              📌 Pin
            </button>
          </div>
          {(isMine || showRead) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-400">
              {isMine && statusLabel && (
                <span
                  className={clsx(
                    "rounded-full border px-2 py-0.5",
                    message.status === "failed"
                      ? "border-rose-500/40 text-rose-300"
                      : "border-ink-700/60 text-ink-400"
                  )}
                >
                  {statusLabel}
                </span>
              )}
              {isMine && message.status === "failed" && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onRetrySend();
                  }}
                  className="rounded-full border border-ink-700/60 px-2 py-0.5 text-ink-300 hover:border-lime-500/50"
                >
                  Retry
                </button>
              )}
              {showRead && (
                <div className="flex items-center gap-2">
                  <span>Read by</span>
                  <div className="flex -space-x-1">
                    {readers.slice(0, 3).map((reader) => (
                      <div
                        key={reader.id}
                        className="h-5 w-5 rounded-full bg-ink-800/80 text-[10px] text-ink-200 flex items-center justify-center border border-ink-700/60"
                        title={reader.name}
                      >
                        {reader.avatar}
                      </div>
                    ))}
                  </div>
                  {readers.length > 3 && <span>+{readers.length - 3}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
