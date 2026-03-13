import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChannelList from "../components/ChannelList";
import TopBar from "../components/TopBar";
import MessageList from "../components/MessageList";
import ThreadPanel from "../components/ThreadPanel";
import CommandPalette from "../components/CommandPalette";
import { useChatStore } from "../store/chatStore";

const HomeRoute = () => {
  const { workspaceId, channelId } = useParams();
  const setActiveWorkspace = useChatStore((state) => state.setActiveWorkspace);
  const setActiveChannel = useChatStore((state) => state.setActiveChannel);

  useEffect(() => {
    if (workspaceId) setActiveWorkspace(workspaceId);
    if (channelId) setActiveChannel(channelId);
  }, [workspaceId, channelId, setActiveWorkspace, setActiveChannel]);

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="glass shadow-card rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[88px_260px_1fr_360px] min-h-[860px]">
          <Sidebar />
          <ChannelList />
          <div className="flex flex-col border-l border-ink-700/40">
            <TopBar />
            <MessageList />
          </div>
          <ThreadPanel />
        </div>
      </div>
      <CommandPalette />
    </div>
  );
};

export default HomeRoute;
