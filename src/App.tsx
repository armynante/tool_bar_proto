import { useState } from "react";
import "./index.css";

export function App() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full h-full">
      <div className="flex justify-end items-end h-svh">
        <div className="flex justify-end items-end bg-black/50 p-8 w-full h-svh">
          {/* Small toolbar launcher icon */}
          <div
            id="toolbar-launcher"
            role="button"
            aria-pressed={expanded}
            onClick={() => setExpanded(v => !v)}
            className={[
              "flex bg-black outline outline-white/50 cursor-pointer transition-all duration-200",
              expanded ? "rounded-none w-12 h-12" : "rounded w-12 h-3 hover:scale-150",
            ].join(" ")}
          >
          </div>
        </div>
      </div>
    </div>
  )
}
