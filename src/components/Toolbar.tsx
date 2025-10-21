import { Plus, Home, MessageSquare, Box, X, Save, EyeOffIcon, Maximize2, Maximize, Columns2, Columns3, Grid2X2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Grid, Eye, LayoutGrid, SplitSquareVertical, PanelLeftClose } from "lucide-react";
import { useState, useEffect } from "react";
import { ToolbarSubmenu } from "./ToolbarSubmenu";
import { ToolbarButtonConfig } from "../types/toolbar";
import { useNestedSubmenuNavigation } from "../hooks/useSubmenuAnimation";
import { LayoutOverlay, LayoutType, Zone } from "./LayoutOverlay";

type ExpandLevel = "collapsed" | "menu" | "workspaces" | "settings";

interface ToolbarProps {
  expandLevel: ExpandLevel;
  focusedAppId: string | null;
  onLauncherClick: () => void;
  onWorkspacesClick: () => void;
  onSettingsClick: () => void;
  onWorkspaceClick: (workspace: string) => void;
  onArrangeApp: (arrangement: string) => void;
  onLayoutZoneClick?: (zone: string) => void;
  activeLayout: boolean;
  onCloseLayout?: () => void;
  onZonesReady?: (zones: Zone[]) => void;
  activeZone: string | null;
  setOnDragStartCallback?: (callback: (() => void) | null) => void;
}

export function Toolbar({ 
  expandLevel,
  focusedAppId,
  onLauncherClick, 
  onWorkspacesClick,
  onSettingsClick,
  onWorkspaceClick,
  onArrangeApp,
  onLayoutZoneClick,
  activeLayout,
  onCloseLayout,
  onZonesReady,
  activeZone,
  setOnDragStartCallback
}: ToolbarProps) {
  const { navigationPath, currentSubmenu, navigateToSubmenu, navigateBack, getParentLabel } = useNestedSubmenuNavigation(300);
  const [arrangeSubmenu, setArrangeSubmenu] = useState<string | null>(null);
  const [activeLayoutType, setActiveLayoutType] = useState<LayoutType>(null);

  // Reset submenu when expandLevel changes
  useEffect(() => {
    if (expandLevel !== "workspaces" && navigationPath.length > 0) {
      // Reset navigation when leaving workspaces
      navigateBack();
    }
  }, [expandLevel, navigationPath.length, navigateBack]);

  // Reset arrange submenu when app loses focus or toolbar collapses
  useEffect(() => {
    if (!focusedAppId || expandLevel === "collapsed") {
      setArrangeSubmenu(null);
    }
  }, [focusedAppId, expandLevel]);

  // Reset active layout when expandLevel changes
  useEffect(() => {
    if (expandLevel === "collapsed" || navigationPath.length === 0) {
      setActiveLayoutType(null);
      onCloseLayout?.();
    }
  }, [expandLevel, navigationPath.length, onCloseLayout]);

  // Set up drag start callback when in layout mode
  useEffect(() => {
    if (activeLayoutType && setOnDragStartCallback) {
      // When dragging starts, navigate back from layouts to create
      setOnDragStartCallback(() => () => {
        navigateBack();
      });
    } else if (setOnDragStartCallback) {
      setOnDragStartCallback(null);
    }
  }, [activeLayoutType, setOnDragStartCallback, navigateBack]);

  const workspaceButtons: ToolbarButtonConfig[] = [
    { name: "Create", workspace: "create", icon: Plus, opensSubmenu: "create" },
    { name: "Main", workspace: "main", icon: Home },
    { name: "Interview", workspace: "interview", icon: MessageSquare },
    { name: "Nexus", workspace: "nexus", icon: Box },
  ];

  const createModeButtons: ToolbarButtonConfig[] = [
    { name: "cancel", workspace: "create", icon: X, isCancel: true },
    { name: "save", workspace: "create", icon: Save },
    { name: "hide all", workspace: "create", icon: EyeOffIcon },
    { name: "show all", workspace: "show-all", icon: Eye },
    { name: "layouts", workspace: "layouts", icon: Grid, opensSubmenu: "layouts" },
  ];

  // Main arrangement buttons for focused apps - appear at bottom when app is selected
  const appArrangeButtons: ToolbarButtonConfig[] = [
    { name: "thirds", icon: Columns3, opensSubmenu: "thirds", title: "Thirds" },
    { name: "quarters", icon: Grid2X2, opensSubmenu: "quarters", title: "Quarters" },
    { name: "halves", icon: Columns2, opensSubmenu: "halves", title: "Halves" },
    { name: "maximize", workspace: "maximize", icon: Maximize, title: "Maximize" },
    { name: "center", workspace: "center", icon: Maximize2, title: "Center" },
    { name: "cancel", workspace: "cancel", icon: X, title: "Cancel", isCancel: true },
  ];

  // Submenu buttons for halves arrangement
  const halvesButtons: ToolbarButtonConfig[] = [
    { name: "cancel", icon: X, isCancel: true, title: "Back" },
    { name: "left", workspace: "half-left", icon: ArrowLeft, title: "Left Half" },
    { name: "right", workspace: "half-right", icon: ArrowRight, title: "Right Half" },
  ];

  // Submenu buttons for quarters arrangement
  const quartersButtons: ToolbarButtonConfig[] = [
    { name: "cancel", icon: X, isCancel: true, title: "Back" },
    { name: "top-left", workspace: "quarter-tl", icon: ArrowUp, title: "Top Left" },
    { name: "top-right", workspace: "quarter-tr", icon: ArrowUp, title: "Top Right" },
    { name: "bot-left", workspace: "quarter-bl", icon: ArrowDown, title: "Bottom Left" },
    { name: "bot-right", workspace: "quarter-br", icon: ArrowDown, title: "Bottom Right" },
  ];

  // Submenu buttons for thirds arrangement
  const thirdsButtons: ToolbarButtonConfig[] = [
    { name: "cancel", icon: X, isCancel: true, title: "Back" },
    { name: "left", workspace: "third-left", icon: ArrowLeft, title: "Left Third" },
    { name: "center", workspace: "third-center", icon: Maximize2, title: "Center Third" },
    { name: "right", workspace: "third-right", icon: ArrowRight, title: "Right Third" },
  ];

  // Layouts submenu buttons
  const layoutsButtons: ToolbarButtonConfig[] = [
    { name: "cancel", icon: X, isCancel: true, title: "Back" },
    { name: "quarters", workspace: "quarters", icon: LayoutGrid, title: "Quarters" },
    { name: "splits", workspace: "splits", icon: SplitSquareVertical, title: "Thirds" },
    { name: "2Q+1H", workspace: "two-quarters-left", icon: PanelLeftClose, title: "Two Quarters + Half" },
  ];


  const handleWorkspaceButtonClick = (button: ToolbarButtonConfig) => {
    if (button.opensSubmenu) {
      navigateToSubmenu(button.opensSubmenu);
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleCreateButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      navigateBack();
      setActiveLayoutType(null);
      onCloseLayout?.(); // This will clear the zones when cancel is pressed in create menu
    } else if (button.opensSubmenu) {
      navigateToSubmenu(button.opensSubmenu);
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleLayoutsButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      navigateBack();
      setActiveLayoutType(null);
      onCloseLayout?.();
    } else if (button.workspace) {
      // Set the active layout to show the overlay
      setActiveLayoutType(button.workspace as LayoutType);
    }
  };

  const handleAppArrangeButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      setArrangeSubmenu(null);
    } else if (button.opensSubmenu) {
      setArrangeSubmenu(button.opensSubmenu);
    } else if (button.workspace && button.workspace !== "cancel") {
      onArrangeApp(button.workspace);
      // Don't reset submenu - keep it open after action
    }
  };

  const getWorkspaceAnimationState = () => {
    if (navigationPath.length === 0 && expandLevel === "workspaces") return "expanded";
    if (navigationPath.length > 0) return "collapsing";
    return "collapsed";
  };

  const getCreateAnimationState = () => {
    if (currentSubmenu === "create" && navigationPath.length === 1) return "expanded";
    if (currentSubmenu === "create") return "collapsing";
    if (navigationPath.length === 0 || navigationPath[0] !== "create") return "collapsed";
    return "collapsing";
  };

  const getLayoutsAnimationState = () => {
    // Layouts is a submenu of "create", so path should be ['create', 'layouts']
    if (currentSubmenu === "layouts" && navigationPath.length === 2 && navigationPath[1] === "layouts") {
      return "expanded";
    }
    if (navigationPath.length === 2 && navigationPath[1] === "layouts") {
      return "expanding";
    }
    if (navigationPath.length < 2 || navigationPath[1] !== "layouts") {
      return "collapsed";
    }
    return "collapsing";
  };


  return (
    <div className="flex justify-end items-end p-8 w-full h-svh">
      {/* Toolbar container */}
      <div className="z-[9999] relative">
        {/* Main launcher button with X when expanded */}
        <div
          id="toolbar-launcher"
          role="button"
          aria-pressed={expandLevel !== "collapsed"}
          onClick={onLauncherClick}
          className={[
            "absolute right-0 bottom-0 flex items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 cursor-pointer transition-all duration-300 z-[9999] rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-2xl font-bold",
            expandLevel === "collapsed" ? "w-12 h-3 rounded-full hover:scale-150" : "w-12 h-12",
          ].join(" ")}
        >
          {expandLevel !== "collapsed" && "×"}
        </div>


        {/* Settings button - dynamic position based on expand level */}
        <div
          onClick={onSettingsClick}
          className={[
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-[9999]hover:bg-white/30",
            // Dynamic bottom position
            expandLevel === "settings" ? "bottom-16" : "bottom-32",
            expandLevel === "settings" ? "bg-white/20 opacity-100" : "bg-white/10",
            expandLevel === "workspaces" ? "opacity-50! translate-y-0 delay-75 hover:opacity-100!" : "",
            expandLevel === "menu" ? "opacity-100! translate-y-0 delay-75" : "",
            expandLevel === "collapsed" ? "opacity-0 translate-y-4 pointer-events-none" : "",
          ].join(" ")}
          role="button"
        >
          Settings
        </div>

        {/* Main arrangement buttons - appear when app is focused and toolbar is expanded */}
        {appArrangeButtons.map((button, i) => {
          const IconComponent = button.icon;
          const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons
          const isVisible = focusedAppId && expandLevel !== "collapsed" && !arrangeSubmenu && !activeLayout;

          return (
            <div
              key={`arrange-${i}`}
              onClick={() => isVisible && handleAppArrangeButtonClick(button)}
              className={[
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                "bottom-0 z-[9999]",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              ].join(" ")}
              style={{
                transform: isVisible ? `translateX(-${distance}rem)` : `translateX(0)`,
                transitionDelay: isVisible ? `${75 + i * 75}ms` : `${(6 - i) * 75}ms`,
              }}
              role="button"
              title={button.title || button.name}
            >
              <IconComponent size={16} strokeWidth={2.5} />
              <span className="font-bold text-[8px]">{button.name}</span>
            </div>
          );
        })}

        {/* Halves submenu for arrangement */}
        {halvesButtons.map((button, i) => {
          const IconComponent = button.icon;
          const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons
          const isVisible = focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "halves";

          return (
            <div
              key={`halves-${i}`}
              onClick={() => isVisible && handleAppArrangeButtonClick(button)}
              className={[
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                "bottom-0 z-[9999]",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              ].join(" ")}
              style={{
                transform: isVisible ? `translateX(-${distance}rem)` : `translateX(0)`,
                transitionDelay: isVisible ? `${75 + i * 75}ms` : `${(3 - i) * 75}ms`,
              }}
              role="button"
              title={button.title || button.name}
            >
              <IconComponent size={16} strokeWidth={2.5} />
              <span className="font-bold text-[8px]">{button.name}</span>
            </div>
          );
        })}

        {/* Quarters submenu for arrangement */}
        {quartersButtons.map((button, i) => {
          const IconComponent = button.icon;
          const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons
          const isVisible = focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "quarters";

          return (
            <div
              key={`quarters-${i}`}
              onClick={() => isVisible && handleAppArrangeButtonClick(button)}
              className={[
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                "bottom-0 z-[9999]",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              ].join(" ")}
              style={{
                transform: isVisible ? `translateX(-${distance}rem)` : `translateX(0)`,
                transitionDelay: isVisible ? `${75 + i * 75}ms` : `${(5 - i) * 75}ms`,
              }}
              role="button"
              title={button.title || button.name}
            >
              <IconComponent size={16} strokeWidth={2.5} />
              <span className="font-bold text-[8px]">{button.name}</span>
            </div>
          );
        })}

        {/* Thirds submenu for arrangement */}
        {thirdsButtons.map((button, i) => {
          const IconComponent = button.icon;
          const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons
          const isVisible = focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "thirds";

          return (
            <div
              key={`thirds-${i}`}
              onClick={() => isVisible && handleAppArrangeButtonClick(button)}
              className={[
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                "bottom-0 z-[9999]",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              ].join(" ")}
              style={{
                transform: isVisible ? `translateX(-${distance}rem)` : `translateX(0)`,
                transitionDelay: isVisible ? `${75 + i * 75}ms` : `${(4 - i) * 75}ms`,
              }}
              role="button"
              title={button.title || button.name}
            >
              <IconComponent size={16} strokeWidth={2.5} />
              <span className="font-bold text-[8px]">{button.name}</span>
            </div>
          );
        })}

        {/* Workspaces button - dynamic position based on expand level */}
        <div
          onClick={onWorkspacesClick}
          className={[
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-[9999]hover:bg-white/30",
            // Dynamic bottom position - when workspaces is expanded, it's at bottom-16, otherwise bottom-32 when settings is expanded, or stays at bottom-16 in menu
            expandLevel === "workspaces" ? "bottom-16 bg-white/20 opacity-100" : "",
            expandLevel === "settings" ? "bottom-32 bg-white/10 opacity-50! hover:opacity-100!" : "",
            expandLevel === "menu" ? "bottom-16 bg-white/10 opacity-100 delay-150" : "",
            expandLevel === "collapsed" ? "opacity-0 pointer-events-none" : "",
          ].join(" ")}
          role="button"
        >
          {getParentLabel()}
        </div>

        {/* Workspace Submenu */}
        <ToolbarSubmenu
          submenuId="workspaces"
          buttons={workspaceButtons}
          isActive={expandLevel === "workspaces" && navigationPath.length === 0}
          animationState={getWorkspaceAnimationState()}
          bottomPosition="bottom-16"
          expandLevel={expandLevel}
          onItemClick={handleWorkspaceButtonClick}
        />

        {/* Create Submenu */}
        <ToolbarSubmenu
          submenuId="create"
          buttons={createModeButtons}
          isActive={expandLevel === "workspaces" && currentSubmenu === "create"}
          animationState={getCreateAnimationState()}
          bottomPosition="bottom-16"
          expandLevel={expandLevel}
          onItemClick={handleCreateButtonClick}
        />

        {/* Layouts Submenu */}
        <ToolbarSubmenu
          submenuId="layouts"
          buttons={layoutsButtons}
          isActive={expandLevel === "workspaces" && currentSubmenu === "layouts"}
          animationState={getLayoutsAnimationState()}
          bottomPosition="bottom-16"
          expandLevel={expandLevel}
          onItemClick={handleLayoutsButtonClick}
        />

      </div>

      {/* Layout Overlay - shown when a layout is selected */}
      <LayoutOverlay 
        layoutType={activeLayoutType}
        activeZone={activeZone}
        onClose={() => {
          setActiveLayoutType(null);
          onCloseLayout?.();
          navigateBack();
        }}
        onZonesReady={onZonesReady}
      />
    </div>
  );
}
