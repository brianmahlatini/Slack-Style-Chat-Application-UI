import { useNavigate } from "react-router-dom";
import { useChatSelector } from "../store/chatStore";
import clsx from "clsx";

const Sidebar = () => {
  const navigate = useNavigate();
  const { workspaces, activeWorkspaceId, activeChannelId } = useChatSelector((state) => ({
    workspaces: state.workspaces,
    activeWorkspaceId: state.activeWorkspaceId,
    activeChannelId: state.activeChannelId
  }));

  return (
    <div className="flex flex-row lg:flex-col items-center gap-4 bg-ink-900/70 py-4 lg:py-6 px-4 lg:px-0 border-b border-ink-700/40 lg:border-b-0">
      <div className="text-xs uppercase tracking-[0.3em] text-ink-300">Work</div>
      {workspaces.map((ws) => {
        const isActive = ws.id === activeWorkspaceId;
        return (
          <button
            key={ws.id}
            onClick={() => navigate(`/workspace/${ws.id}/channel/${activeChannelId}`)}
            className={clsx(
              "h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-semibold transition",
              isActive
                ? "bg-lime-500/20 text-lime-500 shadow-glow"
                : "bg-ink-800/60 text-ink-200 hover:bg-ink-700/70"
            )}
          >
            {ws.name.slice(0, 2).toUpperCase()}
          </button>
        );
      })}
      <div className="mt-auto text-[11px] text-ink-400">v1.0</div>
    </div>
  );
};

export default Sidebar;
