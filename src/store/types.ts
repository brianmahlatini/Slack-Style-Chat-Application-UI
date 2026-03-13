export type Presence = "online" | "away" | "offline";

export type Workspace = {
  id: string;
  name: string;
  plan: string;
  unread: number;
};

export type Channel = {
  id: string;
  workspaceId: string;
  name: string;
  topic: string;
  unread: number;
  isPinned: boolean;
};

export type User = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  status: Presence;
};

export type Attachment = {
  name: string;
  size: string;
  type: "pdf" | "image" | "doc" | "sheet" | "zip";
};

export type Message = {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  createdAt: string;
  reactions: Record<string, string[]>;
  attachments: Attachment[];
  status?: "sending" | "sent" | "failed";
  readBy?: string[];
};

export type ThreadReply = {
  id: string;
  parentId: string;
  authorId: string;
  content: string;
  createdAt: string;
  reactions: Record<string, string[]>;
};

export type TypingEvent = {
  channelId: string;
  userId: string;
  isTyping: boolean;
};

export type MessageGroup = {
  id: string;
  authorId: string;
  firstMessageId: string;
  lastMessageId: string;
  messages: Message[];
  startedAt: string;
};
