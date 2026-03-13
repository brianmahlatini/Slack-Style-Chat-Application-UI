import { useMemo } from "react";
import { useChatStore, useChatSelector } from "../store/chatStore";

const ThreadPanel = () => {
  const { selectedMessageId, messages, replies, users, pinnedMessageIds, activeChannelId } = useChatSelector((state) => ({
    selectedMessageId: state.selectedMessageId,
    messages: state.messages,
    replies: state.replies,
    users: state.users,
    pinnedMessageIds: state.pinnedMessageIds,
    activeChannelId: state.activeChannelId
  }));
  const addThreadReply = useChatStore((state) => state.addThreadReply);

  const message = useMemo(
    () => messages.find((msg) => msg.id === selectedMessageId),
    [messages, selectedMessageId]
  );

  const threadReplies = message ? replies[message.id] ?? [] : [];

  const pinnedMessages = useMemo(
    () => messages.filter((msg) => pinnedMessageIds.includes(msg.id)),
    [messages, pinnedMessageIds]
  );

  const channelMessages = useMemo(
    () => messages.filter((msg) => msg.channelId === activeChannelId),
    [messages, activeChannelId]
  );
  const totalMessages = channelMessages.length;
  const activeAuthors = new Set(channelMessages.map((msg) => msg.authorId)).size;
  const totalReactions = channelMessages.reduce(
    (sum, msg) =>
      sum +
      Object.values(msg.reactions).reduce((inner, list) => inner + list.length, 0),
    0
  );
  const totalReaders = channelMessages.reduce((sum, msg) => sum + (msg.readBy?.length ?? 0), 0);
  const readRate =
    totalMessages && users.length
      ? Math.round((totalReaders / (totalMessages * users.length)) * 100)
      : 0;
  const responseDiffs = channelMessages
    .slice(1)
    .map((msg, index) => {
      const prev = channelMessages[index];
      if (!prev || prev.authorId === msg.authorId) return null;
      return new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime();
    })
    .filter((value): value is number => Boolean(value) && value > 0);
  const avgResponseMinutes = responseDiffs.length
    ? Math.round(responseDiffs.reduce((a, b) => a + b, 0) / responseDiffs.length / 60_000)
    : 0;

  return (
    <div className="hidden lg:flex flex-col border-l border-ink-700/40 bg-ink-900/30">
      <div className="px-5 py-5 border-b border-ink-700/40">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-400">Pinned</div>
        <div className="mt-4 space-y-3">
          {pinnedMessages.map((pin) => (
            <div key={pin.id} className="rounded-2xl bg-ink-800/70 px-3 py-3">
              <div className="text-xs text-ink-400">#{pin.channelId.replace("c-", "")}</div>
              <div className="text-sm text-ink-100 max-h-10 overflow-hidden text-ellipsis">
                {pin.content}
              </div>
            </div>
          ))}
          {pinnedMessages.length === 0 && (
            <div className="text-sm text-ink-400">No pinned highlights yet.</div>
          )}
        </div>
      </div>
      <div className="flex-1 px-5 py-5 overflow-auto scrollbar-thin">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-400">Thread</div>
        {message ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-ink-800/80 px-4 py-4">
              <div className="text-xs text-ink-400">From {users.find((u) => u.id === message.authorId)?.name}</div>
              <div className="text-sm text-ink-100 mt-2">{message.content}</div>
            </div>
            <div className="space-y-3">
              {threadReplies.map((reply) => (
                <div key={reply.id} className="rounded-2xl bg-ink-800/50 px-3 py-3">
                  <div className="text-xs text-ink-400">
                    {users.find((u) => u.id === reply.authorId)?.name}
                  </div>
                  <div className="text-sm text-ink-100">{reply.content}</div>
                </div>
              ))}
              {threadReplies.length === 0 && (
                <div className="text-sm text-ink-400">Select a message to open its thread.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-ink-400">Select a message to open its thread.</div>
        )}
        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-ink-400">Analytics</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-800/60 px-3 py-3">
              <div className="text-[11px] text-ink-400">Total messages</div>
              <div className="text-lg font-semibold text-white">{totalMessages}</div>
              <div className="text-[11px] text-ink-500">Channel activity</div>
            </div>
            <div className="rounded-2xl bg-ink-800/60 px-3 py-3">
              <div className="text-[11px] text-ink-400">Active authors</div>
              <div className="text-lg font-semibold text-white">{activeAuthors}</div>
              <div className="text-[11px] text-ink-500">Unique contributors</div>
            </div>
            <div className="rounded-2xl bg-ink-800/60 px-3 py-3">
              <div className="text-[11px] text-ink-400">Reaction density</div>
              <div className="text-lg font-semibold text-white">
                {totalMessages ? (totalReactions / totalMessages).toFixed(1) : "0.0"}
              </div>
              <div className="text-[11px] text-ink-500">Per message</div>
            </div>
            <div className="rounded-2xl bg-ink-800/60 px-3 py-3">
              <div className="text-[11px] text-ink-400">Read coverage</div>
              <div className="text-lg font-semibold text-white">{readRate}%</div>
              <div className="text-[11px] text-ink-500">Avg per message</div>
            </div>
            <div className="col-span-2 rounded-2xl bg-ink-800/60 px-3 py-3">
              <div className="text-[11px] text-ink-400">Avg response time</div>
              <div className="text-lg font-semibold text-white">
                {avgResponseMinutes ? `${avgResponseMinutes}m` : "—"}
              </div>
              <div className="text-[11px] text-ink-500">Author switches only</div>
            </div>
          </div>
        </div>
      </div>
      {message && (
        <div className="border-t border-ink-700/40 px-5 py-4">
          <div className="rounded-2xl bg-ink-800/70 px-3 py-3 text-sm text-ink-200">
            Reply in thread...
          </div>
          <button
            onClick={() =>
              addThreadReply(message.id, {
                id: `t-${Date.now()}`,
                parentId: message.id,
                authorId: "u1",
                content: "Acknowledged. Will follow up with next steps shortly.",
                createdAt: new Date().toISOString(),
                reactions: {}
              })
            }
            className="mt-3 w-full rounded-2xl bg-ink-700/80 py-2 text-sm text-ink-100 hover:bg-ink-600/80"
          >
            Send Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreadPanel;
