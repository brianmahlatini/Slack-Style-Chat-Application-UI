import { useEffect, useMemo, useRef, useState } from "react";
import { useChatSelector } from "../store/chatStore";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useHotkeys } from "../hooks/useHotkeys";

const TopBar = () => {
  const { channel, pinnedCount, searchQuery, setSearchQuery } = useChatSelector((state) => {
    const channel = state.channels.find((item) => item.id === state.activeChannelId);
    return {
      channel,
      pinnedCount: state.pinnedMessageIds.length,
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery
    };
  });

  const title = useMemo(() => channel?.name ?? "channel", [channel]);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounced = useDebouncedValue(localSearch, 250);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useHotkeys({
    "/": (event) => {
      if ((event.target as HTMLElement).tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
  });

  useEffect(() => {
    setSearchQuery(debounced);
  }, [debounced, setSearchQuery]);

  return (
    <div className="px-6 py-4 border-b border-ink-700/50 bg-ink-900/40">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-display font-semibold text-white flex items-center gap-2">
            <span className="text-ink-400">#</span>
            {title}
          </div>
          <div className="text-xs text-ink-400">{channel?.topic}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-ink-800/80 px-3 py-2 text-xs text-ink-300">
            <span className="text-ember-500">📌</span>
            <span>{pinnedCount} pinned</span>
          </div>
          <label className="flex items-center gap-2 rounded-full bg-ink-800/80 px-4 py-2 text-sm text-ink-200 focus-within:ring-1 focus-within:ring-lime-500/70">
            <span className="text-ink-400">⌕</span>
            <input
              ref={searchRef}
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder="Search messages"
              className="bg-transparent outline-none placeholder:text-ink-500 text-sm"
            />
            <span className="hidden sm:inline text-[11px] text-ink-500 border border-ink-700/60 rounded-full px-2 py-0.5">
              Ctrl K
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
