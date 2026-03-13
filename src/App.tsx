import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { mockSocket, startMockSocket } from "./lib/mockSocket";
import { useChatStore } from "./store/chatStore";
import type { Message, TypingEvent } from "./store/types";
import HomeRoute from "./routes/HomeRoute";

const App = () => {
  const activeChannelId = useChatStore((state) => state.activeChannelId);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const setTypingEvent = useChatStore((state) => state.setTypingEvent);

  useEffect(() => {
    const handleMessage = (message: Message) => appendMessage(message);
    const handleTyping = (event: TypingEvent) => setTypingEvent(event);

    mockSocket.on("message:new", handleMessage);
    mockSocket.on("typing", handleTyping);

    const stop = startMockSocket(activeChannelId, "u4");

    return () => {
      stop();
      mockSocket.off("message:new", handleMessage);
      mockSocket.off("typing", handleTyping);
    };
  }, [activeChannelId, appendMessage, setTypingEvent]);

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/workspace/:workspaceId/channel/:channelId" element={<HomeRoute />} />
    </Routes>
  );
};

export default App;
