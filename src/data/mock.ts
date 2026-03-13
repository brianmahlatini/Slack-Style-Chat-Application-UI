import { Message, ThreadReply, User, Channel, Workspace } from "../store/types";

const now = new Date("2026-03-13T18:00:00");
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60_000).toISOString();

export const users: User[] = [
  {
    id: "u1",
    name: "Ari Moreno",
    title: "Product Lead",
    avatar: "AM",
    status: "online"
  },
  {
    id: "u2",
    name: "Dex Rowe",
    title: "Frontend",
    avatar: "DR",
    status: "online"
  },
  {
    id: "u3",
    name: "Maya Singh",
    title: "Design",
    avatar: "MS",
    status: "away"
  },
  {
    id: "u4",
    name: "Theo Park",
    title: "Backend",
    avatar: "TP",
    status: "offline"
  }
];

export const workspaces: Workspace[] = [
  {
    id: "ws-aurora",
    name: "Aurora Labs",
    plan: "Enterprise",
    unread: 4
  },
  {
    id: "ws-galaxy",
    name: "Galaxy Studio",
    plan: "Pro",
    unread: 1
  }
];

export const channels: Channel[] = [
  {
    id: "c-product",
    workspaceId: "ws-aurora",
    name: "product-strategy",
    topic: "North star roadmap, launches, and feedback",
    unread: 3,
    isPinned: true
  },
  {
    id: "c-design",
    workspaceId: "ws-aurora",
    name: "design-system",
    topic: "Tokens, components, and QA",
    unread: 1,
    isPinned: false
  },
  {
    id: "c-engineering",
    workspaceId: "ws-aurora",
    name: "eng-velocity",
    topic: "Ship cadence, metrics, and incidents",
    unread: 0,
    isPinned: false
  }
];

export const threadReplies: Record<string, ThreadReply[]> = {
  "m-3": [
    {
      id: "t-1",
      parentId: "m-3",
      authorId: "u2",
      content: "We can ship this with the cached index + background hydrate. No UI changes needed.",
      createdAt: minutesAgo(140),
      reactions: { "🔥": ["u1"] }
    },
    {
      id: "t-2",
      parentId: "m-3",
      authorId: "u3",
      content: "I can provide a subtle loading pulse so the older messages feel intentional.",
      createdAt: minutesAgo(120),
      reactions: { "✅": ["u1", "u2"] }
    }
  ]
};

export const messages: Message[] = [
  {
    id: "m-1",
    channelId: "c-product",
    authorId: "u1",
    content: "Daily recap: usage up 12% WoW. Lets keep the momentum on the onboarding experiment.",
    createdAt: minutesAgo(260),
    reactions: { "🚀": ["u2", "u3"] },
    attachments: [],
    status: "sent",
    readBy: ["u1", "u2", "u3"]
  },
  {
    id: "m-2",
    channelId: "c-product",
    authorId: "u2",
    content: "Perf note: virtualization pass dropped the DOM nodes from ~4800 to 120. Scrolling is buttery.",
    createdAt: minutesAgo(220),
    reactions: { "⚡": ["u1"] },
    attachments: [],
    status: "sent",
    readBy: ["u1", "u2", "u3", "u4"]
  },
  {
    id: "m-3",
    channelId: "c-product",
    authorId: "u3",
    content: "Should we pin the migration checklist? It is still living in a doc nobody opens.",
    createdAt: minutesAgo(200),
    reactions: { "📌": ["u1", "u2", "u4"] },
    attachments: [
      { name: "Migration_Checklist.pdf", size: "1.2MB", type: "pdf" }
    ],
    status: "sent",
    readBy: ["u1", "u2", "u4"]
  },
  {
    id: "m-4",
    channelId: "c-product",
    authorId: "u1",
    content: "Pinned. Also added it to the launch channel notes.",
    createdAt: minutesAgo(195),
    reactions: {},
    attachments: [],
    status: "sent",
    readBy: ["u1", "u2"]
  },
  {
    id: "m-5",
    channelId: "c-product",
    authorId: "u4",
    content: "I can mock the websocket stream so we can QA typing + live updates without the backend.",
    createdAt: minutesAgo(170),
    reactions: { "👍": ["u1", "u2"] },
    attachments: [],
    status: "sent",
    readBy: ["u1"]
  },
  {
    id: "m-6",
    channelId: "c-product",
    authorId: "u2",
    content: "Shipping note: keyboard navigation now respects thread focus and skips system messages.",
    createdAt: minutesAgo(140),
    reactions: { "✅": ["u1", "u3"] },
    attachments: [],
    status: "sent",
    readBy: ["u1", "u2", "u3"]
  },
  {
    id: "m-7",
    channelId: "c-product",
    authorId: "u1",
    content: "We should add a mini analytics panel for message search usage.",
    createdAt: minutesAgo(120),
    reactions: {},
    attachments: [],
    status: "sent",
    readBy: ["u1", "u3"]
  },
  {
    id: "m-8",
    channelId: "c-product",
    authorId: "u3",
    content: "Here is the new empty-state illustration for attachments.",
    createdAt: minutesAgo(90),
    reactions: { "🎨": ["u2"] },
    attachments: [
      { name: "Attachments_Empty_State.png", size: "480KB", type: "image" }
    ],
    status: "sent",
    readBy: ["u1", "u2"]
  }
];
