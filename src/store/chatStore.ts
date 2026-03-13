import { create } from "zustand";
import { shallow } from "zustand/shallow";
import type { Channel, Message, ThreadReply, TypingEvent, User, Workspace } from "./types";
import { channels as seedChannels, messages as seedMessages, threadReplies, users as seedUsers, workspaces as seedWorkspaces } from "../data/mock";

const sortByDate = (items: { createdAt: string }[]) =>
  [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const buildOlderMessages = (channelId: string, offset: number): Message[] => {
  const baseTime = new Date("2026-03-13T13:00:00").getTime();
  return Array.from({ length: 16 }, (_, i) => {
    const index = offset + i + 1;
    return {
      id: `m-old-${offset + i}`,
      channelId,
      authorId: seedUsers[(offset + i) % seedUsers.length].id,
      content: `Earlier update #${index}: summarizing experiment ${index} results and next steps.`,
      createdAt: new Date(baseTime - index * 6 * 60_000).toISOString(),
      reactions: {},
      attachments: [],
      status: "sent",
      readBy: [seedUsers[(offset + i) % seedUsers.length].id]
    };
  });
};

export type ChatState = {
  workspaces: Workspace[];
  users: User[];
  channels: Channel[];
  messages: Message[];
  replies: Record<string, ThreadReply[]>;
  activeWorkspaceId: string;
  activeChannelId: string;
  selectedMessageId: string | null;
  searchQuery: string;
  pinnedMessageIds: string[];
  typing: Record<string, string[]>;
  isLoadingOlder: boolean;
  loadOlderCount: number;
  currentUserId: string;
  jumpToLatestNonce: number;
  setActiveWorkspace: (id: string) => void;
  setActiveChannel: (id: string) => void;
  setSelectedMessage: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  toggleReaction: (messageId: string, emoji: string, userId: string) => void;
  togglePin: (messageId: string) => void;
  appendMessage: (message: Message) => void;
  setMessageStatus: (messageId: string, status: Message["status"]) => void;
  retryMessage: (messageId: string) => void;
  markMessagesRead: (messageIds: string[], userId: string) => void;
  requestJumpToLatest: () => void;
  setTypingEvent: (event: TypingEvent) => void;
  loadOlderMessages: () => void;
  addThreadReply: (parentId: string, reply: ThreadReply) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  workspaces: seedWorkspaces,
  users: seedUsers,
  channels: seedChannels,
  messages: sortByDate(seedMessages),
  replies: threadReplies,
  activeWorkspaceId: seedWorkspaces[0]?.id ?? "",
  activeChannelId: seedChannels[0]?.id ?? "",
  selectedMessageId: seedMessages[2]?.id ?? null,
  searchQuery: "",
  pinnedMessageIds: ["m-3"],
  typing: {},
  isLoadingOlder: false,
  loadOlderCount: 0,
  currentUserId: "u1",
  jumpToLatestNonce: 0,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setActiveChannel: (id) => set({ activeChannelId: id, selectedMessageId: null, searchQuery: "" }),
  setSelectedMessage: (id) => set({ selectedMessageId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleReaction: (messageId, emoji, userId) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;
        const existing = message.reactions[emoji] ?? [];
        const hasReacted = existing.includes(userId);
        const next = hasReacted ? existing.filter((id) => id !== userId) : [...existing, userId];
        return { ...message, reactions: { ...message.reactions, [emoji]: next } };
      })
    })),
  togglePin: (messageId) =>
    set((state) => ({
      pinnedMessageIds: state.pinnedMessageIds.includes(messageId)
        ? state.pinnedMessageIds.filter((id) => id !== messageId)
        : [...state.pinnedMessageIds, messageId]
    })),
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, status } : message
      )
    })),
  retryMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, status: "sending" } : message
      )
    }));
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.map((message) => {
          if (message.id !== messageId) return message;
          const nextStatus = Math.random() < 0.12 ? "failed" : "sent";
          return { ...message, status: nextStatus };
        })
      }));
    }, 700);
  },
  markMessagesRead: (messageIds, userId) =>
    set((state) => {
      if (messageIds.length === 0) return {};
      const ids = new Set(messageIds);
      let changed = false;
      const nextMessages = state.messages.map((message) => {
        if (!ids.has(message.id)) return message;
        const readBy = message.readBy ?? [];
        if (readBy.includes(userId)) return message;
        changed = true;
        return { ...message, readBy: [...readBy, userId] };
      });
      return changed ? { messages: nextMessages } : {};
    }),
  requestJumpToLatest: () =>
    set((state) => ({ jumpToLatestNonce: state.jumpToLatestNonce + 1 })),
  setTypingEvent: ({ channelId, userId, isTyping }) =>
    set((state) => {
      const current = state.typing[channelId] ?? [];
      const next = isTyping
        ? Array.from(new Set([...current, userId]))
        : current.filter((id) => id !== userId);
      return { typing: { ...state.typing, [channelId]: next } };
    }),
  loadOlderMessages: () => {
    const { isLoadingOlder, loadOlderCount, activeChannelId } = get();
    if (isLoadingOlder) return;
    set({ isLoadingOlder: true });
    setTimeout(() => {
      set((state) => ({
        messages: [...buildOlderMessages(activeChannelId, loadOlderCount * 16), ...state.messages],
        isLoadingOlder: false,
        loadOlderCount: state.loadOlderCount + 1
      }));
    }, 500);
  },
  addThreadReply: (parentId, reply) =>
    set((state) => ({
      replies: {
        ...state.replies,
        [parentId]: [...(state.replies[parentId] ?? []), reply]
      }
    }))
}));

export const useChatSelector = <T,>(selector: (state: ChatState) => T) =>
  useChatStore(selector, shallow);
