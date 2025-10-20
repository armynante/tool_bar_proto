import { Plus, Home, MessageSquare, Box, Settings2, EyeOff, Move } from "lucide-react";

type ExpandLevel = "collapsed" | "menu" | "workspaces" | "settings";

interface ToolbarProps {
  expandLevel: ExpandLevel;
  onLauncherClick: () => void;
  onWorkspacesClick: () => void;
  onSettingsClick: () => void;
  onWorkspaceClick: (workspace: string) => void;
}

export function Toolbar({ 
  expandLevel, 
  onLauncherClick, 
  onWorkspacesClick,
  onSettingsClick,
  onWorkspaceClick 
}: ToolbarProps) {
  const workspaceButtons = [
    { name: "Create", workspace: "create", icon: Plus, shift: "-translate-x-16", delay: "delay-75" },
    { name: "Main", workspace: "main", icon: Home, shift: "-translate-x-32", delay: "delay-150" },
    { name: "Interview", workspace: "interview", icon: MessageSquare, shift: "-translate-x-48", delay: "delay-[225ms]" },
    { name: "Nexus", workspace: "nexus", icon: Box, shift: "-translate-x-64", delay: "delay-300" },
  ];

  const settingsButtons = [
    { name: "Edit", icon: Settings2, shift: "-translate-x-16", delay: "delay-75" },
    { name: "Hide", icon: EyeOff, shift: "-translate-x-32", delay: "delay-150" },
    { name: "Move", icon: Move, shift: "-translate-x-48", delay: "delay-[225ms]" },
  ];

  return (
    <div className="flex justify-end items-end p-8 w-full h-svh">
      {/* Toolbar container */}
      <div className="relative">
        {/* Main launcher button with X when expanded */}
        <div
          id="toolbar-launcher"
          role="button"
          aria-pressed={expandLevel !== "collapsed"}
          onClick={onLauncherClick}
          className={[
            "absolute right-0 bottom-0 flex items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 cursor-pointer transition-all duration-300 z-20 rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-2xl font-bold",
            expandLevel === "collapsed" ? "w-12 h-3 hover:scale-150" : "w-12 h-12",
          ].join(" ")}
        >
          {expandLevel !== "collapsed" && "×"}
        </div>

        {/* Utilities button */}
        <div
          className={[
            "absolute right-0 bottom-48 flex items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold hover:bg-white/20",
            expandLevel === "workspaces" ? "opacity-50 translate-y-0 delay-0 hover:opacity-100" : "",
            expandLevel === "settings" ? "opacity-50 translate-y-0 delay-0 hover:opacity-100" : "",
            expandLevel === "menu" ? "opacity-100 translate-y-0 delay-0" : "",
            expandLevel === "collapsed" ? "opacity-0 translate-y-4 pointer-events-none" : "",
          ].join(" ")}
          role="button"
        >
          Utilities
        </div>

        {/* Settings button */}
        <div
          onClick={onSettingsClick}
          className={[
            "absolute right-0 bottom-32 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-10",
            expandLevel === "settings" ? "bg-white/20 opacity-100 hover:bg-white/30" : "bg-white/10 hover:bg-white/30",
            expandLevel === "workspaces" ? "opacity-50 translate-y-0 delay-75 hover:opacity-100" : "",
            expandLevel === "menu" ? "opacity-100 translate-y-0 delay-75" : "",
            expandLevel === "collapsed" ? "opacity-0 translate-y-4 pointer-events-none" : "",
          ].join(" ")}
          role="button"
        >
          Settings
        </div>

        {/* Workspaces button */}
        <div
          onClick={onWorkspacesClick}
          className={[
            "absolute right-0 bottom-16 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-10",
            expandLevel === "workspaces" ? "bg-white/20 opacity-100 hover:bg-white/30" : "bg-white/10 hover:bg-white/30",
            expandLevel === "settings" ? "opacity-50 translate-y-0 delay-150 hover:opacity-100" : "",
            expandLevel === "menu" ? "opacity-100 translate-y-0 delay-150" : "opacity-0 pointer-events-none",
          ].join(" ")}
          role="button"
        >
          Workspaces
        </div>

        {/* Workspace items (horizontal slide from right to left) */}
        {workspaceButtons.map((ws, i) => {
          const IconComponent = ws.icon;
          return (
            <div
              key={i}
              onClick={() => onWorkspaceClick(ws.workspace)}
              className={[
                "absolute right-0 bottom-16 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transform-gpu transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white/20",
                expandLevel === "workspaces" ? `${ws.shift} opacity-100` : "translate-x-0 opacity-0 pointer-events-none",
                ws.delay,
              ].join(" ")}
              role="button"
            >
              <IconComponent className="text-white" size={16} strokeWidth={2.5} />
              <div className="mt-0.5 font-bold text-[6px] text-white">
                {ws.name}
              </div>
            </div>
          );
        })}

        {/* Settings items (horizontal slide from right to left) */}
        {settingsButtons.map((setting, i) => {
          const IconComponent = setting.icon;
          return (
            <div
              key={i}
              className={[
                "absolute right-0 bottom-32 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transform-gpu transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white/20",
                expandLevel === "settings" ? `${setting.shift} opacity-100` : "translate-x-0 opacity-0 pointer-events-none",
                setting.delay,
              ].join(" ")}
              role="button"
            >
              <IconComponent className="text-white" size={16} strokeWidth={2.5} />
              <div className="mt-0.5 font-bold text-[6px] text-white">
                {setting.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

