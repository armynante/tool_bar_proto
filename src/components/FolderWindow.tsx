import { useState, useRef, useEffect } from "react";
import { AppState, Folder, WindowsPreviewZone } from "../types";

interface FolderWindowProps {
  folder: Folder;
  appRegistry: { [key: string]: AppState };
  isFocused: boolean;
  isLayoutMode: boolean;
  layoutZones: any[];
  onQuit: (folderId: string) => void;
  onMinimize: (folderId: string) => void;
  onUpdate: (folderId: string, updates: Partial<Folder>) => void;
  onFocus: (folderId: string) => void;
  onDragOverZone?: (zoneId: string | null) => void;
  onSnapToZone?: (folderId: string, zoneId: string) => void;
  onDragStart?: () => void;
  onTabSwitch: (folderId: string, appId: string) => void;
  windowsPreviewZones?: WindowsPreviewZone[];
  onDragOverPreviewZone?: (zoneId: string | null) => void;
  activeWindowsPreviewZone?: string | null;
}

export function FolderWindow({
  folder,
  appRegistry,
  isFocused,
  isLayoutMode,
  layoutZones,
  onQuit,
  onMinimize,
  onUpdate,
  onFocus,
  onDragOverZone,
  onSnapToZone,
  onDragStart,
  onTabSwitch,
  windowsPreviewZones,
  onDragOverPreviewZone,
  activeWindowsPreviewZone = null
}: FolderWindowProps) {
  const [position, setPosition] = useState(folder.position);
  const [size, setSize] = useState(folder.size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const currentZoneRef = useRef<string | null>(null);
  const currentPreviewZoneRef = useRef<string | null>(null);
  const hasNotifiedDragStartRef = useRef(false);

  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    setPosition(folder.position);
    setSize(folder.size);
  }, [folder.position, folder.size]);

  useEffect(() => {
    if (!activeWindowsPreviewZone) {
      currentPreviewZoneRef.current = null;
    } else {
      currentPreviewZoneRef.current = activeWindowsPreviewZone;
    }
  }, [activeWindowsPreviewZone]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🖱️ [FolderWindow] Mouse down on folder:', folder.id);
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      console.log('🖱️ [FolderWindow] Clicked resize handle, not dragging');
      return;
    }
    if ((e.target as HTMLElement).closest('.tab-bar')) {
      console.log('🖱️ [FolderWindow] Clicked tab bar, not dragging');
      return;
    }
    console.log('🖱️ [FolderWindow] Starting drag');
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    currentPreviewZoneRef.current = null;
    onDragOverPreviewZone?.(null);
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (isLayoutMode && !hasNotifiedDragStartRef.current) {
          hasNotifiedDragStartRef.current = true;
          onDragStart?.();
        }
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
        const centerX = newX + size.width / 2;
        const centerY = newY + size.height / 2;
        
        // For Windows preview zones, use MOUSE POSITION instead of window center
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        console.log('🔄 [FolderWindow] Dragging at:', { centerX, centerY, mouseX, mouseY }, 'Preview zones count:', windowsPreviewZones?.length);
        
        if (isLayoutMode && layoutZones.length > 0) {
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
          
          if (foundZone !== currentZoneRef.current) {
            currentZoneRef.current = foundZone;
            onDragOverZone?.(foundZone);
          }
        }

        if (windowsPreviewZones && windowsPreviewZones.length > 0) {
          console.log('[FolderWindow] Checking preview zones, count:', windowsPreviewZones.length);
          console.log('[FolderWindow] Mouse position:', { mouseX, mouseY });
          let foundPreviewZone: string | null = null;
          for (const previewZone of windowsPreviewZones) {
            const { left, right, top, bottom } = previewZone.rect;
            console.log('[FolderWindow] Checking zone:', previewZone.target, previewZone.rect);
            // Check if MOUSE CURSOR is over the zone preview box (not window center)
            if (
              mouseX >= left &&
              mouseX <= right &&
              mouseY >= top &&
              mouseY <= bottom
            ) {
              foundPreviewZone = previewZone.target;
              console.log('[FolderWindow] ✓ Found zone:', foundPreviewZone);
              break;
            }
          }

          if (foundPreviewZone !== currentPreviewZoneRef.current) {
            console.log('[FolderWindow] Zone changed:', currentPreviewZoneRef.current, '->', foundPreviewZone);
            currentPreviewZoneRef.current = foundPreviewZone;
            onDragOverPreviewZone?.(foundPreviewZone);
          }
        } else if (currentPreviewZoneRef.current) {
          console.log('[FolderWindow] No preview zones, clearing current zone');
          currentPreviewZoneRef.current = null;
          onDragOverPreviewZone?.(null);
        }
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      console.log('[FolderWindow] Mouse up, isDragging:', isDragging);
      if (isDragging) {
        hasNotifiedDragStartRef.current = false;
      }
      
      const previewZoneToSnap = currentPreviewZoneRef.current || activeWindowsPreviewZone;
      console.log('[FolderWindow] Preview zone to snap:', previewZoneToSnap);
      console.log('[FolderWindow] Active preview zone:', activeWindowsPreviewZone);
      console.log('[FolderWindow] Current preview zone ref:', currentPreviewZoneRef.current);

      if (isDragging && previewZoneToSnap && onSnapToZone) {
        console.log('[FolderWindow] ✓ Snapping to preview zone:', previewZoneToSnap);
        onSnapToZone(folder.id, previewZoneToSnap);
        currentPreviewZoneRef.current = null;
        onDragOverPreviewZone?.(null);
        onDragOverZone?.(null);
      } else if (isDragging && isLayoutMode && currentZoneRef.current && onSnapToZone) {
        console.log('[FolderWindow] ✓ Snapping to layout zone:', currentZoneRef.current);
        onSnapToZone(folder.id, currentZoneRef.current);
        currentZoneRef.current = null;
        onDragOverZone?.(null);
        onDragOverPreviewZone?.(null);
      } else if (isDragging) {
        console.log('[FolderWindow] No snap, just updating position');
        onUpdate(folder.id, { position: positionRef.current });
        currentPreviewZoneRef.current = null;
        onDragOverPreviewZone?.(null);
      } else if (isResizing) {
        onUpdate(folder.id, { size: sizeRef.current });
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
  }, [isDragging, isResizing, dragStart, resizeStart, folder.id, onUpdate, isLayoutMode, layoutZones, size.width, size.height, onDragOverZone, onSnapToZone, onDragStart, windowsPreviewZones, onDragOverPreviewZone]);

  const activeApp = appRegistry[folder.activeAppId];
  if (!activeApp) return null;

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
        zIndex: folder.zIndex,
      }}
      onMouseDown={(e) => {
        handleMouseDown(e);
        onFocus(folder.id);
      }}
    >
      {/* Chrome-style Tab Bar */}
      <div className="flex items-end gap-1 bg-white/5 px-2 pt-2 border-white/10 border-b tab-bar">
        {folder.apps.map((appId) => {
          const app = appRegistry[appId];
          if (!app) return null;
          
          const isActive = appId === folder.activeAppId;
          
          return (
            <div
              key={appId}
              onClick={(e) => {
                e.stopPropagation();
                onTabSwitch(folder.id, appId);
              }}
              className={[
                "px-3 py-1.5 rounded-t-lg cursor-pointer transition-all duration-200 flex items-center gap-2 text-xs max-w-[150px]",
                isActive 
                  ? "bg-white/10 text-white font-medium" 
                  : "bg-white/5 text-white/60 hover:bg-white/8 hover:text-white/80"
              ].join(" ")}
            >
              <span className="text-sm">{app.dockIcon || '📱'}</span>
              <span className="truncate">{app.title}</span>
            </div>
          );
        })}
      </div>

      {/* Title bar with window controls */}
      <div className="flex justify-between items-center bg-white/5 px-4 py-2 border-white/10 border-b">
        <span className="font-medium text-white text-sm">{activeApp.title}</span>
        <div className="flex gap-2">
          <div 
            className="bg-yellow-500/80 hover:bg-yellow-500 rounded-full w-3 h-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(folder.id);
            }}
            title="Minimize"
          ></div>
          <div className="bg-green-500/80 hover:bg-green-500 rounded-full w-3 h-3"></div>
          <div 
            className="bg-red-500/80 hover:bg-red-500 rounded-full w-3 h-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onQuit(folder.id);
            }}
            title="Quit"
          ></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="w-full h-[calc(100%-88px)] overflow-hidden">
        <img 
          src={activeApp.imageSrc} 
          alt={activeApp.imageAlt}
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

