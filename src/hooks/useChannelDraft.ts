import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export const useChannelDraft = (channelId: string) => {
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>("chat-drafts", {});

  const draft = useMemo(() => drafts[channelId] ?? "", [drafts, channelId]);

  const setDraft = useCallback(
    (value: string) => setDrafts({ ...drafts, [channelId]: value }),
    [drafts, setDrafts, channelId]
  );

  const clearDraft = useCallback(() => {
    const next = { ...drafts };
    delete next[channelId];
    setDrafts(next);
  }, [drafts, setDrafts, channelId]);

  return { draft, setDraft, clearDraft };
};
