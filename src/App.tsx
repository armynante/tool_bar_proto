import { useState, useRef, useEffect } from "react";
import "./index.css";
import desktopBg from "./assets/desktop-bg.png";
import { AppState, Folder, FolderRegistry } from "./types";
import { debouncedSaveAppRegistry, loadAppRegistry, saveAppRegistry, flushPendingSave } from "./utils/storage";
import { initializeRegistry, mergeNewAppsIntoRegistry, WORKSPACE_CONFIGS } from "./config/workspaces";
import { Dock } from "./components/Dock";
import { Toolbar } from "./components/Toolbar";
import { Zone } from "./components/LayoutOverlay";
import { FolderWindow } from "./components/FolderWindow";

type ExpandLevel = "collapsed" | "menu" | "workspaces" | "settings";

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
  zIndex: number;
  isFocused: boolean;
  isLayoutMode: boolean;
  layoutZones: Zone[];
  onQuit: (id: string) => void;
  onMinimize: (id: string) => void;
  onUpdate: (id: string, updates: Partial<AppState>) => void;
  onFocus: (id: string) => void;
  onDragOverZone?: (zoneId: string | null) => void;
  onSnapToZone?: (appId: string, zoneId: string) => void;
  onDragStart?: () => void;
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
  zIndex,
  isFocused,
  isLayoutMode,
  layoutZones,
  onQuit,
  onMinimize,
  onUpdate,
  onFocus,
  onDragOverZone,
  onSnapToZone,
  onDragStart
}: WindowProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const currentZoneRef = useRef<string | null>(null);
  const hasNotifiedDragStartRef = useRef(false);

  // Use refs to capture latest position/size values for the mouseUp handler
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  // Update refs when position/size changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

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
        // Notify parent when drag starts in layout mode (only once)
        if (isLayoutMode && !hasNotifiedDragStartRef.current) {
          hasNotifiedDragStartRef.current = true;
          onDragStart?.();
        }
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
        
        // Check for zone intersection when in layout mode
        if (isLayoutMode && layoutZones.length > 0) {
          // Calculate window center point
          const centerX = newX + size.width / 2;
          const centerY = newY + size.height / 2;
          
          // Find which zone (if any) contains the center point
          let foundZone: string | null = null;
          for (const zone of layoutZones) {
            if (
              centerX >= zone.x &&
              centerX <= zone.x + zone.width &&
              centerY >= zone.y &&
              centerY <= zone.y + zone.height
            ) {
              foundZone = zone.id;
              break;
            }
          }
          
          // Only call callback if zone changed
          if (foundZone !== currentZoneRef.current) {
            currentZoneRef.current = foundZone;
            onDragOverZone?.(foundZone);
          }
        }
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      // Reset drag start notification flag
      if (isDragging) {
        hasNotifiedDragStartRef.current = false;
      }
      
      // Handle snap to zone when in layout mode
      if (isDragging && isLayoutMode && currentZoneRef.current && onSnapToZone) {
        onSnapToZone(id, currentZoneRef.current);
        currentZoneRef.current = null;
        onDragOverZone?.(null);
      } else if (isDragging) {
        // Save position/size changes when drag/resize finishes using refs
        onUpdate(id, { position: positionRef.current });
      } else if (isResizing) {
        onUpdate(id, { size: sizeRef.current });
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
  }, [isDragging, isResizing, dragStart, resizeStart, id, onUpdate, isLayoutMode, layoutZones, size.width, size.height, onDragOverZone, onSnapToZone, onDragStart]);

  // Return null if window is not visible - AFTER all hooks
  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={[
        "absolute bg-white/10 shadow-2xl backdrop-blur-xl rounded-lg overflow-hidden",
        !isDragging && !isResizing ? "transition-all" : "",
        isFocused ? "border-4 border-blue-400 ring-4 ring-blue-300/50" : "border border-white/20"
      ].join(" ")}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: zIndex,
      }}
      onMouseDown={(e) => {
        handleMouseDown(e);
        onFocus(id);
      }}
    >
      {/* Title bar */}
      <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-white/10 border-b">
        <span className="font-medium text-white text-sm">{title}</span>
        <div className="flex gap-2">
          <div 
            className="bg-yellow-500/80 hover:bg-yellow-500 rounded-full w-3 h-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
            title="Minimize"
          ></div>
          <div className="bg-green-500/80 hover:bg-green-500 rounded-full w-3 h-3"></div>
          <div 
            className="bg-red-500/80 hover:bg-red-500 rounded-full w-3 h-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onQuit(id);
            }}
            title="Quit"
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
  const [focusedAppId, setFocusedAppId] = useState<string | null>(null);
  const [activeLayoutZone, setActiveLayoutZone] = useState<string | null>(null);
  const [layoutZones, setLayoutZones] = useState<Zone[]>([]);
  const [onDragStartCallback, setOnDragStartCallback] = useState<(() => void) | null>(null);
  const [folderRegistry, setFolderRegistry] = useState<FolderRegistry>({});
  const [appRegistry, setAppRegistry] = useState(() => {
    const loaded = loadAppRegistry();
    if (loaded) {
      // Merge new apps into loaded registry to ensure new apps appear
      return mergeNewAppsIntoRegistry(loaded);
    }
    return initializeRegistry();
  });

  // Save to localStorage whenever app registry changes (debounced)
  useEffect(() => {
    debouncedSaveAppRegistry(appRegistry);
  }, [appRegistry]);

  // Save immediately on unmount to ensure no data loss
  useEffect(() => {
    return () => {
      flushPendingSave();
      saveAppRegistry(appRegistry);
    };
  }, [appRegistry]);

  // Reset focused app when toolbar is collapsed
  useEffect(() => {
    if (expandLevel === "collapsed") {
      setFocusedAppId(null);
    }
  }, [expandLevel]);

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

  // Handler to quit an app (red X button)
  const handleAppQuit = (id: string) => {
    setAppRegistry(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isLaunched: false,
        isVisible: false
      }
    }));
  };

  // Handler to minimize an app (yellow button)
  const handleAppMinimize = (id: string) => {
    setAppRegistry(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isVisible: false
        // isLaunched stays true
      }
    }));
  };

  // Handler to bring app to front
  const handleAppFocus = (id: string) => {
    // Only allow focusing when toolbar is expanded
    if (expandLevel !== "collapsed") {
      setFocusedAppId(id);
    }
    
    setAppRegistry(prev => {
      const maxZ = Math.max(...Object.values(prev).map(app => app.zIndex));
      return {
        ...prev,
        [id]: {
          ...prev[id],
          zIndex: maxZ + 1
        }
      };
    });
  };

  // Handler for dock icon click
  const handleDockClick = (id: string) => {
    // Only allow focusing when toolbar is expanded
    if (expandLevel !== "collapsed") {
      setFocusedAppId(id);
    }
    
    setAppRegistry(prev => {
      const app = prev[id];
      const maxZ = Math.max(...Object.values(prev).map(a => a.zIndex));
      
      if (!app.isLaunched) {
        // Launch the app
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isLaunched: true,
            isVisible: true,
            zIndex: maxZ + 1
          }
        };
      } else if (!app.isVisible) {
        // Show minimized app
        return {
          ...prev,
          [id]: {
            ...prev[id],
            isVisible: true,
            zIndex: maxZ + 1
          }
        };
      } else {
        // Already visible, just bring to front
        return {
          ...prev,
          [id]: {
            ...prev[id],
            zIndex: maxZ + 1
          }
        };
      }
    });
  };

  // Handler for workspace button clicks
  const handleWorkspaceClick = (workspace: string) => {
    let config = WORKSPACE_CONFIGS[workspace];
    
    // If not in default configs, check custom workspace configs
    if (!config) {
      try {
        const customConfigs = localStorage.getItem('customWorkspaceConfigs');
        if (customConfigs) {
          const configs = JSON.parse(customConfigs);
          config = configs[workspace];
        }
      } catch (e) {
        console.error('Failed to load custom workspace config:', e);
      }
    }
    
    if (!config) return;

    setAppRegistry(prev => {
      const updated = { ...prev };
      const maxZ = Math.max(...Object.values(prev).map(app => app.zIndex));
      let currentZ = maxZ;
      
      config.apps.forEach(appConfig => {
        if (updated[appConfig.id]) {
          currentZ += 1;
          updated[appConfig.id] = {
            ...updated[appConfig.id],
            isLaunched: true,
            isVisible: true,
            position: appConfig.position,
            size: appConfig.size,
            zIndex: currentZ
          };
        }
      });
      return updated;
    });

    // Restore folders from saved config
    if (config.folders && config.folders.length > 0) {
      setFolderRegistry(prev => {
        const updated = { ...prev };
        const appMaxZ = Math.max(
          ...Object.values(appRegistry).map(app => app.zIndex),
          ...Object.values(prev).map(folder => folder.zIndex)
        );
        let currentFolderZ = appMaxZ;

        config.folders?.forEach(folderConfig => {
          const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          currentFolderZ += 1;

          // Make sure all apps in the folder are hidden
          setAppRegistry(prevApps => {
            const updatedApps = { ...prevApps };
            folderConfig.apps.forEach(appId => {
              if (updatedApps[appId]) {
                updatedApps[appId] = {
                  ...updatedApps[appId],
                  isVisible: false,
                };
              }
            });
            return updatedApps;
          });

          updated[folderId] = {
            id: folderId,
            apps: folderConfig.apps,
            activeAppId: folderConfig.activeAppId,
            position: folderConfig.position,
            size: folderConfig.size,
            zIndex: currentFolderZ,
          };
        });

        return updated;
      });
    }
  };

  // Handler for arranging the focused app
  const handleArrangeApp = (arrangement: string) => {
    if (!focusedAppId) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 50;

    let newPosition = { x: 0, y: 0 };
    let newSize = { width: 800, height: 600 };

    switch (arrangement) {
      case "center":
        newSize = { width: 800, height: 600 };
        newPosition = {
          x: (screenWidth - newSize.width) / 2,
          y: (screenHeight - newSize.height) / 2,
        };
        break;
      case "maximize":
        newSize = {
          width: screenWidth - padding * 2,
          height: screenHeight - padding * 2,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "half-left":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "half-right":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        };
        break;
      case "quarter-tl":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "quarter-tr":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        };
        break;
      case "quarter-bl":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: padding,
          y: screenHeight / 2 + padding / 2,
        };
        break;
      case "quarter-br":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: screenHeight / 2 + padding / 2,
        };
        break;
      case "third-left":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "third-center":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: screenWidth / 3 + padding / 2,
          y: padding,
        };
        break;
      case "third-right":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: (screenWidth / 3) * 2 + padding / 2,
          y: padding,
        };
        break;
      default:
        return;
    }

    setAppRegistry(prev => ({
      ...prev,
      [focusedAppId]: {
        ...prev[focusedAppId],
        position: newPosition,
        size: newSize,
      },
    }));
  };

  // Handler for layout zone clicks (from LayoutOverlay)
  const handleLayoutZoneClick = (zone: string) => {
    // When a zone is clicked, arrange the focused app to that zone
    // Or if no app is focused, this could be used for other purposes
    handleArrangeApp(zone);
  };

  // Handler for snapping app to zone during drag
  const handleSnapToZone = (appIdOrFolderId: string, zoneId: string) => {
    const isFolder = appIdOrFolderId.startsWith('folder-');
    
    // Temporarily set focused app for the arrangement
    const previousFocused = focusedAppId;
    if (!isFolder) {
      setFocusedAppId(appIdOrFolderId);
    }
    
    // Calculate zone position and size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 50;

    let newPosition = { x: 0, y: 0 };
    let newSize = { width: 800, height: 600 };

    switch (zoneId) {
      case "half-left":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "half-right":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        };
        break;
      case "quarter-tl":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "quarter-tr":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: padding,
        };
        break;
      case "quarter-bl":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: padding,
          y: screenHeight / 2 + padding / 2,
        };
        break;
      case "quarter-br":
        newSize = {
          width: screenWidth / 2 - padding * 1.5,
          height: screenHeight / 2 - padding * 1.5,
        };
        newPosition = {
          x: screenWidth / 2 + padding / 2,
          y: screenHeight / 2 + padding / 2,
        };
        break;
      case "third-left":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = { x: padding, y: padding };
        break;
      case "third-center":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: screenWidth / 3 + padding / 2,
          y: padding,
        };
        break;
      case "third-right":
        newSize = {
          width: screenWidth / 3 - padding,
          height: screenHeight - padding * 2,
        };
        newPosition = {
          x: (screenWidth / 3) * 2 + padding / 2,
          y: padding,
        };
        break;
      default:
        // Restore previous focused app if zone not recognized
        setFocusedAppId(previousFocused);
        return;
    }

    // Check for collision with existing apps or folders in the same zone
    const existingAppInZone = Object.values(appRegistry).find(app => 
      app.isVisible && 
      app.id !== appIdOrFolderId &&
      Math.abs(app.position.x - newPosition.x) < 10 &&
      Math.abs(app.position.y - newPosition.y) < 10
    );

    const existingFolderInZone = Object.values(folderRegistry).find(folder =>
      Math.abs(folder.position.x - newPosition.x) < 10 &&
      Math.abs(folder.position.y - newPosition.y) < 10
    );

    if (isFolder) {
      // Moving a folder
      setFolderRegistry(prev => ({
        ...prev,
        [appIdOrFolderId]: {
          ...prev[appIdOrFolderId],
          position: newPosition,
          size: newSize,
        },
      }));
    } else if (existingFolderInZone) {
      // Add app to existing folder
      setFolderRegistry(prev => ({
        ...prev,
        [existingFolderInZone.id]: {
          ...prev[existingFolderInZone.id],
          apps: [...prev[existingFolderInZone.id].apps, appIdOrFolderId],
        },
      }));
      
      // Hide the app
      setAppRegistry(prev => ({
        ...prev,
        [appIdOrFolderId]: {
          ...prev[appIdOrFolderId],
          isVisible: false,
        },
      }));
    } else if (existingAppInZone) {
      // Create new folder with both apps
      const folderId = `folder-${Date.now()}`;
      const maxZ = Math.max(
        ...Object.values(appRegistry).map(app => app.zIndex),
        ...Object.values(folderRegistry).map(folder => folder.zIndex)
      );
      
      setFolderRegistry(prev => ({
        ...prev,
        [folderId]: {
          id: folderId,
          apps: [existingAppInZone.id, appIdOrFolderId],
          activeAppId: existingAppInZone.id,
          position: newPosition,
          size: newSize,
          zIndex: maxZ + 1,
        },
      }));
      
      // Hide both apps
      setAppRegistry(prev => ({
        ...prev,
        [existingAppInZone.id]: {
          ...prev[existingAppInZone.id],
          isVisible: false,
        },
        [appIdOrFolderId]: {
          ...prev[appIdOrFolderId],
          isVisible: false,
        },
      }));
    } else {
      // No collision, just position the app normally
      setAppRegistry(prev => ({
        ...prev,
        [appIdOrFolderId]: {
          ...prev[appIdOrFolderId],
          position: newPosition,
          size: newSize,
        },
      }));
    }
    
    // Restore previous focused app
    setFocusedAppId(previousFocused);
  };

  const handleLauncherClick = () => {
    setExpandLevel(expandLevel === "collapsed" ? "menu" : "collapsed");
  };

  const handleWorkspacesClick = () => {
    // Toggle between workspaces and other states
    if (expandLevel === "workspaces") {
      setExpandLevel("menu");
    } else {
      setExpandLevel("workspaces");
    }
  };

  const handleSettingsClick = () => {
    // Toggle between settings and other states
    if (expandLevel === "settings") {
      setExpandLevel("menu");
    } else {
      setExpandLevel("settings");
    }
  };

  // Handler for folder operations
  const handleFolderUpdate = (folderId: string, updates: Partial<Folder>) => {
    setFolderRegistry(prev => ({
      ...prev,
      [folderId]: {
        ...prev[folderId],
        ...updates
      }
    }));
  };

  const handleFolderQuit = (folderId: string) => {
    const folder = folderRegistry[folderId];
    if (!folder) return;
    
    // Show all apps in the folder again
    setAppRegistry(prev => {
      const updated = { ...prev };
      folder.apps.forEach(appId => {
        if (updated[appId]) {
          updated[appId] = {
            ...updated[appId],
            isVisible: true,
            isLaunched: true,
          };
        }
      });
      return updated;
    });
    
    // Remove the folder
    setFolderRegistry(prev => {
      const updated = { ...prev };
      delete updated[folderId];
      return updated;
    });
  };

  const handleFolderMinimize = (folderId: string) => {
    setFolderRegistry(prev => {
      const updated = { ...prev };
      delete updated[folderId];
      return updated;
    });
  };

  const handleFolderFocus = (folderId: string) => {
    setFolderRegistry(prev => {
      const maxZ = Math.max(...Object.values(prev).map(f => f.zIndex));
      return {
        ...prev,
        [folderId]: {
          ...prev[folderId],
          zIndex: maxZ + 1
        }
      };
    });
  };

  const handleTabSwitch = (folderId: string, appId: string) => {
    setFolderRegistry(prev => ({
      ...prev,
      [folderId]: {
        ...prev[folderId],
        activeAppId: appId
      }
    }));
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
            zIndex={app.zIndex}
            isFocused={focusedAppId === app.id}
            isLayoutMode={layoutZones.length > 0}
            layoutZones={layoutZones}
            onQuit={handleAppQuit}
            onMinimize={handleAppMinimize}
            onUpdate={handleAppUpdate}
            onFocus={handleAppFocus}
            onDragOverZone={setActiveLayoutZone}
            onSnapToZone={handleSnapToZone}
            onDragStart={() => {
              // Notify callback when drag starts
              onDragStartCallback?.();
            }}
          />
        ))}

        {/* Render folders */}
        {Object.values(folderRegistry).map(folder => (
          <FolderWindow
            key={folder.id}
            folder={folder}
            appRegistry={appRegistry}
            isFocused={focusedAppId === folder.id}
            isLayoutMode={layoutZones.length > 0}
            layoutZones={layoutZones}
            onQuit={handleFolderQuit}
            onMinimize={handleFolderMinimize}
            onUpdate={handleFolderUpdate}
            onFocus={handleFolderFocus}
            onDragOverZone={setActiveLayoutZone}
            onSnapToZone={handleSnapToZone}
            onDragStart={() => {
              onDragStartCallback?.();
            }}
            onTabSwitch={handleTabSwitch}
          />
        ))}
        
        {/* macOS-style Dock */}
        <Dock 
          appRegistry={appRegistry} 
          onDockClick={handleDockClick}
          focusedAppId={focusedAppId}
        />

        <Toolbar 
          expandLevel={expandLevel}
          focusedAppId={focusedAppId}
          onLauncherClick={handleLauncherClick}
          onWorkspacesClick={handleWorkspacesClick}
          onSettingsClick={handleSettingsClick}
          onWorkspaceClick={handleWorkspaceClick}
          onArrangeApp={handleArrangeApp}
          onLayoutZoneClick={handleLayoutZoneClick}
          activeLayout={layoutZones.length > 0}
          onCloseLayout={() => setLayoutZones([])}
          onZonesReady={setLayoutZones}
          activeZone={activeLayoutZone}
          setOnDragStartCallback={setOnDragStartCallback}
          appRegistry={appRegistry}
          onClearFocus={() => setFocusedAppId(null)}
          folderRegistry={folderRegistry}
        />
      </div>
    </div>
  )
}

