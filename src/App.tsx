import { useState, useRef, useEffect } from "react";
import { Plus, Home, MessageSquare, Box } from "lucide-react";
import "./index.css";
import desktopBg from "./assets/desktop-bg.png";
import { AppState } from "./types";
import { saveAppRegistry, loadAppRegistry } from "./utils/storage";
import { initializeRegistry, WORKSPACE_CONFIGS } from "./config/workspaces";

type ExpandLevel = "collapsed" | "menu" | "workspaces";

interface WindowProps {
  id: string;
  isVisible: boolean;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  title: string;
  imageSrc: string;
  imageAlt: string;
  onClose: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AppState>) => void;
}

function DraggableWindow({ 
  id,
  isVisible,
  initialX, 
  initialY, 
  initialWidth, 
  initialHeight,
  title,
  imageSrc,
  imageAlt,
  onClose,
  onUpdate
}: WindowProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Sync position and size when props change (for workspace switching)
  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
    setSize({ width: initialWidth, height: initialHeight });
  }, [initialX, initialY, initialWidth, initialHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Handle mouse movement during drag/resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      // Save position/size changes when drag/resize finishes
      if (isDragging) {
        onUpdate(id, { position });
      } else if (isResizing) {
        onUpdate(id, { size });
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, id, position, size, onUpdate]);

  // Return null if window is not visible - AFTER all hooks
  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-white/10 shadow-2xl backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-white/10 border-b">
        <span className="font-medium text-white text-sm">{title}</span>
        <div className="flex gap-2">
          <div className="bg-yellow-500/80 hover:bg-yellow-500 rounded-full w-3 h-3"></div>
          <div className="bg-green-500/80 hover:bg-green-500 rounded-full w-3 h-3"></div>
          <div 
            className="bg-red-500/80 hover:bg-red-500 rounded-full w-3 h-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          ></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="w-full h-[calc(100%-40px)] overflow-hidden">
        <img 
          src={imageSrc} 
          alt={imageAlt}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      </div>
      
      {/* Resize handle */}
      <div
        className="right-0 bottom-0 absolute w-4 h-4 resize-handle cursor-nwse-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="right-1 bottom-1 absolute border-white/50 border-r-2 border-b-2 w-2 h-2"></div>
      </div>
    </div>
  );
}

export function App() {
  const [expandLevel, setExpandLevel] = useState<ExpandLevel>("collapsed");
  const [appRegistry, setAppRegistry] = useState(() => {
    const loaded = loadAppRegistry();
    return loaded || initializeRegistry();
  });

  // Save to localStorage whenever app registry changes
  useEffect(() => {
    saveAppRegistry(appRegistry);
  }, [appRegistry]);

  // Handler to update app position or size
  const handleAppUpdate = (id: string, updates: Partial<AppState>) => {
    setAppRegistry(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates
      }
    }));
  };

  // Handler to close an app
  const handleAppClose = (id: string) => {
    setAppRegistry(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVisible: false
      }
    }));
  };

  // Handler for workspace button clicks
  const handleWorkspaceClick = (workspace: string) => {
    const config = WORKSPACE_CONFIGS[workspace];
    if (!config) return;

    setAppRegistry(prev => {
      const updated = { ...prev };
      config.apps.forEach(appConfig => {
        if (updated[appConfig.id]) {
          updated[appConfig.id] = {
            ...updated[appConfig.id],
            isVisible: true,
            position: appConfig.position,
            size: appConfig.size
          };
        }
      });
      return updated;
    });
  };

  const workspaceButtons = [
    { name: "Create", workspace: "create", icon: Plus, shift: "-translate-x-16", delay: "delay-75" },
    { name: "Main", workspace: "main", icon: Home, shift: "-translate-x-32", delay: "delay-150" },
    { name: "Interview", workspace: "interview", icon: MessageSquare, shift: "-translate-x-48", delay: "delay-[225ms]" },
    { name: "Nexus", workspace: "nexus", icon: Box, shift: "-translate-x-64", delay: "delay-300" },
  ];

  const handleLauncherClick = () => {
    setExpandLevel(expandLevel === "collapsed" ? "menu" : "collapsed");
  };

  const handleWorkspacesClick = () => {
    setExpandLevel("workspaces");
  };

  return (
    <div className="w-full h-full">
      <div 
        className="flex justify-end items-end bg-cover bg-no-repeat bg-center h-svh"
        style={{ backgroundImage: `url(${desktopBg})` }}
      >
        {/* Render apps from registry */}
        {Object.values(appRegistry).map(app => (
          <DraggableWindow
            key={app.id}
            id={app.id}
            isVisible={app.isVisible}
            initialX={app.position.x}
            initialY={app.position.y}
            initialWidth={app.size.width}
            initialHeight={app.size.height}
            title={app.title}
            imageSrc={app.imageSrc}
            imageAlt={app.imageAlt}
            onClose={handleAppClose}
            onUpdate={handleAppUpdate}
          />
        ))}
        <div className="flex justify-end items-end p-8 w-full h-svh">
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
            {workspaceButtons.map((ws, i) => {
              const IconComponent = ws.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleWorkspaceClick(ws.workspace)}
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
          </div>
        </div>
      </div>
    </div>
  )
}

