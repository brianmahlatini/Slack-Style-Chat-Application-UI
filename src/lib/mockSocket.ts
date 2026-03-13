import type { Message, TypingEvent } from "../store/types";

type Listener = (payload: unknown) => void;

type EventMap = {
  "message:new": Message;
  "typing": TypingEvent;
};

class MockSocket {
  private listeners: Record<string, Listener[]> = {};

  on<T extends keyof EventMap>(event: T, cb: (payload: EventMap[T]) => void) {
    this.listeners[event] = [...(this.listeners[event] ?? []), cb as Listener];
  }

  off<T extends keyof EventMap>(event: T, cb: (payload: EventMap[T]) => void) {
    this.listeners[event] = (this.listeners[event] ?? []).filter((listener) => listener !== cb);
  }

  emit<T extends keyof EventMap>(event: T, payload: EventMap[T]) {
    (this.listeners[event] ?? []).forEach((listener) => listener(payload));
  }
}

export const mockSocket = new MockSocket();

export const startMockSocket = (channelId: string, userId: string) => {
  const typingInterval = setInterval(() => {
    const shouldType = Math.random() > 0.6;
    mockSocket.emit("typing", { channelId, userId, isTyping: shouldType });
  }, 2200);

  const messageInterval = setInterval(() => {
    if (Math.random() < 0.5) return;
    const message: Message = {
      id: `m-live-${Date.now()}`,
      channelId,
      authorId: userId,
      content: "Live update: mock websocket event delivered. UI stays buttery under load.",
      createdAt: new Date().toISOString(),
      reactions: {},
      attachments: [],
      status: "sent",
      readBy: [userId]
    };
    mockSocket.emit("message:new", message);
  }, 5200);

  return () => {
    clearInterval(typingInterval);
    clearInterval(messageInterval);
  };
};
