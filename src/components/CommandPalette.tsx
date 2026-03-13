import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useHotkeys } from "../hooks/useHotkeys";
import { useChatStore, useChatSelector } from "../store/chatStore";

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  group: string;
  onSelect: () => void;
};

const CommandPalette = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { workspaces, channels, activeWorkspaceId, activeChannelId } = useChatSelector((state) => ({
    workspaces: state.workspaces,
    channels: state.channels,
    activeWorkspaceId: state.activeWorkspaceId,
    activeChannelId: state.activeChannelId
  }));

  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const requestJumpToLatest = useChatStore((state) => state.requestJumpToLatest);

  useHotkeys({
    "ctrl+k": (event) => {
      event.preventDefault();
      setIsOpen(true);
    },
    "meta+k": (event) => {
      event.preventDefault();
      setIsOpen(true);
    },
    escape: () => setIsOpen(false)
  });

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setActiveIndex(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  const workspaceCommands: PaletteItem[] = workspaces.map((ws) => {
    const fallbackChannel = channels.find((channel) => channel.workspaceId === ws.id);
    return {
      id: `ws-${ws.id}`,
      label: `Switch to ${ws.name}`,
      description: ws.plan,
      group: "Workspaces",
      onSelect: () => {
        if (!fallbackChannel) return;
        navigate(`/workspace/${ws.id}/channel/${fallbackChannel.id}`);
      }
    };
  });

  const channelCommands: PaletteItem[] = channels.map((channel) => {
    const workspaceName =
      workspaces.find((ws) => ws.id === channel.workspaceId)?.name ?? "Workspace";
    return {
      id: `ch-${channel.id}`,
      label: `#${channel.name}`,
      description: workspaceName,
      group: "Channels",
      onSelect: () => {
        navigate(`/workspace/${channel.workspaceId}/channel/${channel.id}`);
      }
    };
  });

  const actionCommands: PaletteItem[] = [
    {
      id: "action-jump-latest",
      label: "Jump to latest message",
      description: "Scroll to the bottom",
      group: "Actions",
      onSelect: () => requestJumpToLatest()
    },
    {
      id: "action-clear-search",
      label: "Clear message search",
      description: "Reset results",
      group: "Actions",
      onSelect: () => setSearchQuery("")
    },
    {
      id: "action-current-channel",
      label: "Stay on current channel",
      description: `#${channels.find((c) => c.id === activeChannelId)?.name ?? "channel"}`,
      group: "Actions",
      onSelect: () => {
        navigate(`/workspace/${activeWorkspaceId}/channel/${activeChannelId}`);
      }
    }
  ];

  const allItems = useMemo(
    () => [...actionCommands, ...channelCommands, ...workspaceCommands],
    [actionCommands, channelCommands, workspaceCommands]
  );

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allItems;
    return allItems.filter((item) =>
      `${item.label} ${item.description ?? ""}`.toLowerCase().includes(trimmed)
    );
  }, [allItems, query]);

  const groupedItems = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    filteredItems.forEach((item) => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)?.push(item);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  const flatItems = filteredItems;

  const handleSelect = (item: PaletteItem | undefined) => {
    if (!item) return;
    item.onSelect();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 px-4 pt-24"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-ink-700/60 bg-ink-900/90 shadow-card backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-ink-700/60 px-5 py-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                handleSelect(flatItems[activeIndex]);
              }
            }}
            placeholder="Search commands, channels, workspaces..."
            className="w-full bg-transparent text-sm text-ink-100 outline-none placeholder:text-ink-500"
          />
        </div>
        <div className="max-h-[420px] overflow-auto px-4 py-3">
          {groupedItems.length === 0 && (
            <div className="px-2 py-6 text-sm text-ink-400">No results.</div>
          )}
          {groupedItems.map(([group, items]) => (
            <div key={group} className="mb-4 last:mb-1">
              <div className="px-2 text-[11px] uppercase tracking-[0.2em] text-ink-500">
                {group}
              </div>
              <div className="mt-2 space-y-1">
                {items.map((item) => {
                  const index = flatItems.findIndex((candidate) => candidate.id === item.id);
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={clsx(
                        "w-full text-left rounded-2xl px-3 py-2 transition border",
                        isActive
                          ? "bg-lime-500/15 border-lime-500/40 text-white"
                          : "border-transparent text-ink-200 hover:bg-ink-800/60"
                      )}
                    >
                      <div className="text-sm font-semibold">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-ink-500">{item.description}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-ink-700/60 px-5 py-3 text-xs text-ink-500">
          <span>Use ↑ ↓ to navigate</span>
          <span>Enter to select · Esc to close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
