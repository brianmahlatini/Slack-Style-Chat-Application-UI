import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";
import { useChatStore, useChatSelector } from "../store/chatStore";
import type { Attachment, Message } from "../store/types";
import clsx from "clsx";
import { useChannelDraft } from "../hooks/useChannelDraft";

const GROUP_WINDOW_MINUTES = 6;

const MessageList = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const { users, activeChannelId, searchQuery, selectedMessageId, currentUserId } = useChatSelector((state) => ({
    users: state.users,
    activeChannelId: state.activeChannelId,
    searchQuery: state.searchQuery,
    selectedMessageId: state.selectedMessageId,
    currentUserId: state.currentUserId
  }));

  const messages = useChatStore((state) => state.messages);
  const loadOlderMessages = useChatStore((state) => state.loadOlderMessages);
  const isLoadingOlder = useChatStore((state) => state.isLoadingOlder);
  const setSelectedMessage = useChatStore((state) => state.setSelectedMessage);
  const toggleReaction = useChatStore((state) => state.toggleReaction);
  const togglePin = useChatStore((state) => state.togglePin);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const setMessageStatus = useChatStore((state) => state.setMessageStatus);
  const retryMessage = useChatStore((state) => state.retryMessage);
  const markMessagesRead = useChatStore((state) => state.markMessagesRead);
  const jumpToLatestNonce = useChatStore((state) => state.jumpToLatestNonce);

  const filtered = useMemo(() => {
    const channelMessages = messages.filter((msg) => msg.channelId === activeChannelId);
    if (!searchQuery.trim()) return channelMessages;
    const query = searchQuery.toLowerCase();
    return channelMessages.filter((msg) => msg.content.toLowerCase().includes(query));
  }, [messages, activeChannelId, searchQuery]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 10,
    measureElement: (element) => element.getBoundingClientRect().height
  });

  const items = virtualizer.getVirtualItems();
  const { draft, setDraft, clearDraft } = useChannelDraft(activeChannelId);
  const [queuedAttachments, setQueuedAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (items.length === 0) return;
    const startIndex = items[0].index;
    if (startIndex <= 1 && !isLoadingOlder) {
      loadOlderMessages();
    }
  }, [items, isLoadingOlder, loadOlderMessages]);

  useEffect(() => {
    const visibleIds = items
      .map((item) => filtered[item.index]?.id)
      .filter(Boolean) as string[];
    if (visibleIds.length === 0) return;
    markMessagesRead(visibleIds, currentUserId);
  }, [items, filtered, currentUserId, markMessagesRead]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!filtered.length) return;
    const currentIndex = filtered.findIndex((msg) => msg.id === selectedMessageId);
    if (event.key === "ArrowDown") {
      const nextIndex = Math.min(filtered.length - 1, currentIndex + 1);
      setSelectedMessage(filtered[nextIndex]?.id ?? filtered[0].id);
      event.preventDefault();
    }
    if (event.key === "ArrowUp") {
      const nextIndex = Math.max(0, currentIndex === -1 ? 0 : currentIndex - 1);
      setSelectedMessage(filtered[nextIndex]?.id ?? filtered[0].id);
      event.preventDefault();
    }
    if (event.key === "Enter" && selectedMessageId) {
      setSelectedMessage(selectedMessageId);
    }
    if (event.key === "Escape") {
      setSelectedMessage(null);
    }
  };

  const handleComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!draft.trim() && queuedAttachments.length === 0) return;
    const messageId = `m-local-${Date.now()}`;
    appendMessage({
      id: messageId,
      channelId: activeChannelId,
      authorId: currentUserId,
      content: draft.trim() || "Shared files",
      createdAt: new Date().toISOString(),
      reactions: {},
      attachments: queuedAttachments,
      status: "sending",
      readBy: [currentUserId]
    });
    setTimeout(() => {
      const nextStatus = Math.random() < 0.12 ? "failed" : "sent";
      setMessageStatus(messageId, nextStatus);
    }, 700);
    clearDraft();
    setQueuedAttachments([]);
    jumpToLatest();
  };

  const addMockAttachment = () => {
    const next: Attachment = {
      name: `Attachment_${queuedAttachments.length + 1}.png`,
      size: "320KB",
      type: "image"
    };
    setQueuedAttachments((current) => [...current, next]);
  };

  const removeAttachment = (name: string) => {
    setQueuedAttachments((current) => current.filter((item) => item.name !== name));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceToBottom < 80);
  };

  const jumpToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (jumpToLatestNonce === 0) return;
    jumpToLatest();
  }, [jumpToLatestNonce]);

  const showHeaderFor = (index: number, message: Message) => {
    if (index === 0) return true;
    const prev = filtered[index - 1];
    if (!prev) return true;
    if (prev.authorId !== message.authorId) return true;
    const gap = new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime();
    return gap > GROUP_WINDOW_MINUTES * 60_000;
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        className="relative flex-1 overflow-auto px-6 py-6 space-y-4 scrollbar-thin focus:outline-none"
      >
        <div
          style={{ height: virtualizer.getTotalSize(), position: "relative" }}
          className="w-full"
        >
          {items.map((virtualRow) => {
            const message = filtered[virtualRow.index];
            if (!message) return null;
            const author = users.find((user) => user.id === message.authorId);
            const showHeader = showHeaderFor(virtualRow.index, message);
            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <MessageItem
                  message={message}
                  author={author}
                  users={users}
                  showHeader={showHeader}
                  isSelected={message.id === selectedMessageId}
                  currentUserId={currentUserId}
                  onSelect={() => setSelectedMessage(message.id)}
                  onToggleReaction={(emoji) => toggleReaction(message.id, emoji, currentUserId)}
                  onTogglePin={() => togglePin(message.id)}
                  onRetrySend={() => retryMessage(message.id)}
                />
              </div>
            );
          })}
        </div>
        {isLoadingOlder && (
          <div className="text-xs text-ink-400">Loading older messages...</div>
        )}
        {!isAtBottom && (
          <button
            onClick={jumpToLatest}
            className="sticky ml-auto bottom-4 right-0 px-4 py-2 rounded-full bg-ink-800/90 text-xs text-ink-100 border border-ink-600/60 hover:border-lime-500/50"
          >
            Jump to latest
          </button>
        )}
      </div>
      <div className="border-t border-ink-700/40 px-6 py-4 bg-ink-900/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="rounded-2xl bg-ink-800/70 px-4 py-3 text-sm text-ink-200 space-y-3">
              <textarea
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKey}
                placeholder="Compose message or drop files here..."
                className="w-full bg-transparent outline-none placeholder:text-ink-500 resize-none"
              />
              {queuedAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {queuedAttachments.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-full bg-ink-900/60 px-3 py-1 text-xs text-ink-200"
                    >
                      <span className="text-ember-500">⬢</span>
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeAttachment(file.name)}
                        className="text-ink-400 hover:text-ink-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                <button
                  onClick={addMockAttachment}
                  className="rounded-full border border-ink-700/50 px-3 py-1 hover:border-lime-500/50"
                >
                  + Attachment
                </button>
                <span>Shift + Enter for new line</span>
              </div>
            </div>
            <div className="mt-2">
              <TypingIndicator />
            </div>
          </div>
          <button
            onClick={handleSend}
            className={clsx(
              "px-4 py-3 rounded-2xl text-sm font-semibold",
              "bg-lime-500 text-ink-900 hover:bg-lime-600"
            )}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;

