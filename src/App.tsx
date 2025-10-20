import { useState } from "react";
import "./index.css";

type ExpandLevel = "collapsed" | "menu" | "workspaces";

export function App() {
  const [expandLevel, setExpandLevel] = useState<ExpandLevel>("collapsed");

  const workspaceButtons = [
    { name: "Create", icon: "+", shift: "-translate-x-16", delay: "delay-75" },
    { name: "Main", number: "1", shift: "-translate-x-32", delay: "delay-150" },
    { name: "Interview", number: "2", shift: "-translate-x-48", delay: "delay-[225ms]" },
    { name: "Nexus", number: "3", shift: "-translate-x-64", delay: "delay-300" },
  ];

  const handleLauncherClick = () => {
    setExpandLevel(expandLevel === "collapsed" ? "menu" : "collapsed");
  };

  const handleWorkspacesClick = () => {
    setExpandLevel("workspaces");
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-end items-end h-svh">
        <div className="flex justify-end items-end bg-black/50 p-8 w-full h-svh">
          {/* Toolbar container */}
          <div className="relative">
            {/* Main launcher button with X when expanded */}
            <div
              id="toolbar-launcher"
              role="button"
              aria-pressed={expandLevel !== "collapsed"}
              onClick={handleLauncherClick}
              className={[
                "absolute right-0 bottom-0 flex items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 cursor-pointer transition-all duration-300 z-20 rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-2xl font-bold",
                expandLevel === "collapsed" ? "w-12 h-3 hover:scale-150" : "w-12 h-12",
              ].join(" ")}
            >
              {expandLevel !== "collapsed" && "×"}
            </div>

            {/* Settings button */}
            <div
              className={[
                "absolute right-0 bottom-32 flex items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold hover:bg-white/20",
                expandLevel !== "collapsed" ? "opacity-100 translate-y-0 delay-75" : "opacity-0 translate-y-4 pointer-events-none",
              ].join(" ")}
              role="button"
            >
              Settings
            </div>

            {/* Workspaces button */}
            <div
              onClick={handleWorkspacesClick}
              className={[
                "absolute right-0 bottom-16 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-10 hover:bg-white/30",
                expandLevel === "workspaces" ? "bg-white/20" : "bg-white/10",
                expandLevel === "menu" ? "opacity-100 translate-y-0 delay-150" : "opacity-0 pointer-events-none",
                expandLevel === "workspaces" ? "opacity-100" : "",
              ].join(" ")}
              role="button"
            >
              Workspaces
            </div>

            {/* Workspace items (horizontal slide from right to left) */}
            {workspaceButtons.map((ws, i) => (
              <div
                key={i}
                className={[
                  "absolute right-0 bottom-16 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transform-gpu transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white/20",
                  expandLevel === "workspaces" ? `${ws.shift} opacity-100` : "translate-x-0 opacity-0 pointer-events-none",
                  ws.delay,
                ].join(" ")}
                role="button"
              >
                <div className="font-bold text-white text-xl">
                  {ws.icon || ws.number}
                </div>
                <div className="font-bold text-[6px] text-white">
                  {ws.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

