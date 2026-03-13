import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useChatSelector } from "../store/chatStore";

const ChannelList = () => {
  const navigate = useNavigate();
  const { channels, activeChannelId, activeWorkspaceId, workspaceName } = useChatSelector((state) => ({
    channels: state.channels,
    activeChannelId: state.activeChannelId,
    activeWorkspaceId: state.activeWorkspaceId,
    workspaceName: state.workspaces.find((ws) => ws.id === state.activeWorkspaceId)?.name ?? "Workspace"
  }));

  const [query, setQuery] = useState("");

  const workspaceChannels = useMemo(
    () => channels.filter((channel) => channel.workspaceId === activeWorkspaceId),
    [channels, activeWorkspaceId]
  );
  const filteredChannels = useMemo(() => {
    if (!query.trim()) return workspaceChannels;
    const normalized = query.toLowerCase();
    return workspaceChannels.filter((channel) => channel.name.toLowerCase().includes(normalized));
  }, [query, workspaceChannels]);
  const pinned = filteredChannels.filter((channel) => channel.isPinned);
  const others = filteredChannels.filter((channel) => !channel.isPinned);

  const renderChannel = (channelId: string, name: string, unread: number) => (
    <button
      key={channelId}
      onClick={() => navigate(`/workspace/${activeWorkspaceId}/channel/${channelId}`)}
      className={clsx(
        "w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition",
        channelId === activeChannelId
          ? "bg-ink-700/60 text-white"
          : "text-ink-200 hover:bg-ink-800/70"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-ink-400">#</span>
        <span className="text-sm font-semibold">{name}</span>
      </div>
      {unread > 0 && (
        <span className="text-[11px] px-2 py-1 rounded-full bg-lime-500/20 text-lime-500">
          {unread}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col bg-ink-900/40 border-l-0 lg:border-l border-ink-700/40 border-b lg:border-b-0 px-3 py-6">
      <div className="px-2 mb-4">
        <div className="text-lg font-display font-bold text-white">{workspaceName}</div>
        <div className="text-xs text-ink-400">Workspace overview</div>
      </div>
      <label className="px-2 mb-5">
        <div className="flex items-center gap-2 rounded-2xl bg-ink-800/70 px-3 py-2 text-xs text-ink-300 focus-within:ring-1 focus-within:ring-lime-500/60">
          <span className="text-ink-500">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter channels"
            className="bg-transparent outline-none placeholder:text-ink-500 text-sm"
          />
        </div>
      </label>
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-400 px-2">Pinned</div>
        {pinned.map((channel) => renderChannel(channel.id, channel.name, channel.unread))}
      </div>
      <div className="mt-6 space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-ink-400 px-2">Channels</div>
        {others.map((channel) => renderChannel(channel.id, channel.name, channel.unread))}
      </div>
      <div className="mt-auto pt-6 px-2 text-[12px] text-ink-400">
        <div className="flex items-center justify-between">
          <span>Team health</span>
          <span className="text-lime-500">+4%</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-ink-700">
          <div className="h-1 rounded-full bg-lime-500" style={{ width: "68%" }} />
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
