import { useMemo } from "react";
import { useChatSelector } from "../store/chatStore";

const TypingIndicator = () => {
  const { users, typing, activeChannelId } = useChatSelector((state) => ({
    users: state.users,
    typing: state.typing,
    activeChannelId: state.activeChannelId
  }));

  const names = useMemo(() => {
    const ids = typing[activeChannelId] ?? [];
    return ids.map((id) => users.find((user) => user.id === id)?.name).filter(Boolean);
  }, [typing, activeChannelId, users]);

  if (names.length === 0) return null;

  return (
    <div className="text-xs text-ink-400 flex items-center gap-2">
      <span className="inline-flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
      <span>{names.join(", ")} typing...</span>
    </div>
  );
};

export default TypingIndicator;
