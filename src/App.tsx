import { useState } from "react";
import "./index.css";

export function App() {
  const [expanded, setExpanded] = useState(false);
  const itemConfigs = [
    { shift: "-translate-y-16", delay: "delay-75" },
    { shift: "-translate-y-32", delay: "delay-150" },
    { shift: "-translate-y-48", delay: "delay-200" },
    { shift: "-translate-y-64", delay: "delay-300" },
  ];
  return (
    <div className="w-full h-full">
      <div className="flex justify-end items-end h-svh">
        <div className="flex justify-end items-end bg-black/50 p-8 w-full h-svh">
          {/* Small toolbar launcher icon */}
          <div className="relative h-12">
            <div
              id="toolbar-launcher"
              role="button"
              aria-pressed={expanded}
              onClick={() => setExpanded(v => !v)}
              className={[
                "absolute right-0 bottom-0 flex items-center justify-center bg-black/30 backdrop-blur-md outline outline-white/50 cursor-pointer transition-all duration-200 z-10 rounded-xl",
                expanded ? "w-12 h-12 text-white text-2xl font-bold" : "w-12 h-3 hover:scale-150",
              ].join(" ")}
            >
              {expanded && "×"}
            </div>
            {itemConfigs.map((cfg, i) => (
              <div
                key={i}
                aria-hidden="true"
                className={[
                  "absolute right-0 top-0 bg-black/30 backdrop-blur-md outline outline-white/50 rounded-xl w-12 h-12 transform-gpu transition-all duration-300",
                  expanded ? `${cfg.shift} opacity-100` : "translate-x-0 opacity-0 pointer-events-none",
                  cfg.delay,
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
