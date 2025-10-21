import { Plus, Home, MessageSquare, Box, Settings2, EyeOff, Move, X, Save, Grid, EyeOffIcon, Maximize2, Maximize, Columns2, Columns3, Grid2X2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { ToolbarSubmenu } from "./ToolbarSubmenu";
import { ToolbarButtonConfig } from "../types/toolbar";
import { useNestedSubmenuNavigation } from "../hooks/useSubmenuAnimation";

type ExpandLevel = "collapsed" | "menu" | "workspaces" | "settings";

interface ToolbarProps {
  expandLevel: ExpandLevel;
  focusedAppId: string | null;
  onLauncherClick: () => void;
  onWorkspacesClick: () => void;
  onSettingsClick: () => void;
  onWorkspaceClick: (workspace: string) => void;
  onArrangeApp: (arrangement: string) => void;
}

export function Toolbar({ 
  expandLevel,
  focusedAppId,
  onLauncherClick, 
  onWorkspacesClick,
  onSettingsClick,
  onWorkspaceClick,
  onArrangeApp
}: ToolbarProps) {
  const { navigationPath, currentSubmenu, navigateToSubmenu, navigateBack, getParentLabel } = useNestedSubmenuNavigation(300);
  const [arrangeSubmenu, setArrangeSubmenu] = useState<string | null>(null);

  // Reset submenu when expandLevel changes
  useEffect(() => {
    if (expandLevel !== "workspaces") {
      // Reset navigation when leaving workspaces
      while (navigationPath.length > 0) {
        navigateBack();
      }
    }
  }, [expandLevel, navigationPath.length, navigateBack]);

  // Reset arrange submenu when app loses focus or toolbar collapses
  useEffect(() => {
    if (!focusedAppId || expandLevel === "collapsed") {
      setArrangeSubmenu(null);
    }
  }, [focusedAppId, expandLevel]);

  const workspaceButtons: ToolbarButtonConfig[] = [
    { name: "Create", workspace: "create", icon: Plus, opensSubmenu: "create" },
    { name: "Main", workspace: "main", icon: Home },
    { name: "Interview", workspace: "interview", icon: MessageSquare },
    { name: "Nexus", workspace: "nexus", icon: Box },
  ];

  const createModeButtons: ToolbarButtonConfig[] = [
    { name: "cancel", workspace: "create", icon: X, isCancel: true },
    { name: "save", workspace: "create", icon: Save },
    { name: "arrange", workspace: "create", icon: Grid, opensSubmenu: "arrange" },
    { name: "hide all", workspace: "create", icon: EyeOffIcon },
  ];

  const arrangeButtons: ToolbarButtonConfig[] = [
    { name: "cancel", workspace: "arrange", icon: X, isCancel: true },
    { name: "center", workspace: "arrange", icon: Maximize2 },
    { name: "maximize", workspace: "arrange", icon: Maximize },
    { name: "halves", workspace: "arrange", icon: Columns2 },
    { name: "quarters", workspace: "arrange", icon: Grid2X2 },
    { name: "thirds", workspace: "arrange", icon: Columns3 },
  ];

  const settingsButtons: ToolbarButtonConfig[] = [
    { name: "Edit", icon: Settings2 },
    { name: "Hide", icon: EyeOff },
    { name: "Move", icon: Move },
  ];

  // Arrangement buttons for focused apps
  const mainArrangeButtons: ToolbarButtonConfig[] = [
    { name: "Cntr", icon: Maximize2, workspace: "center", title: "Center" },
    { name: "Max", icon: Maximize, workspace: "maximize", title: "Maximize" },
    { name: "Half", icon: Columns2, opensSubmenu: "halves", title: "Halves" },
    { name: "Qrtr", icon: Grid2X2, opensSubmenu: "quarters", title: "Quarters" },
    { name: "3rd", icon: Columns3, opensSubmenu: "thirds", title: "Thirds" },
  ];

  const halvesButtons: ToolbarButtonConfig[] = [
    { name: "Back", icon: X, isCancel: true, title: "Back" },
    { name: "Left", icon: ArrowLeft, workspace: "half-left", title: "Left Half" },
    { name: "Right", icon: ArrowRight, workspace: "half-right", title: "Right Half" },
  ];

  const quartersButtons: ToolbarButtonConfig[] = [
    { name: "Back", icon: X, isCancel: true, title: "Back" },
    { name: "TL", icon: ArrowUp, workspace: "quarter-tl", title: "Top Left" },
    { name: "TR", icon: ArrowUp, workspace: "quarter-tr", title: "Top Right" },
    { name: "BL", icon: ArrowDown, workspace: "quarter-bl", title: "Bottom Left" },
    { name: "BR", icon: ArrowDown, workspace: "quarter-br", title: "Bottom Right" },
  ];

  const thirdsButtons: ToolbarButtonConfig[] = [
    { name: "Back", icon: X, isCancel: true, title: "Back" },
    { name: "L3", icon: ArrowLeft, workspace: "third-left", title: "Left Third" },
    { name: "C3", icon: Maximize2, workspace: "third-center", title: "Center Third" },
    { name: "R3", icon: ArrowRight, workspace: "third-right", title: "Right Third" },
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
    } else if (button.opensSubmenu) {
      navigateToSubmenu(button.opensSubmenu);
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleWorkspaceArrangeButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      navigateBack();
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleArrangeButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      setArrangeSubmenu(null);
    } else if (button.opensSubmenu) {
      setArrangeSubmenu(button.opensSubmenu);
    } else if (button.workspace) {
      onArrangeApp(button.workspace);
      setArrangeSubmenu(null);
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

  const getArrangeAnimationState = () => {
    if (currentSubmenu === "arrange" && navigationPath.length === 2) return "expanded";
    return "collapsed";
  };

  const getSettingsAnimationState = () => {
    if (expandLevel === "settings") return "expanded";
    return "collapsed";
  };

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
            expandLevel === "workspaces" ? "opacity-50! translate-y-0 delay-0 hover:opacity-100!" : "",
            expandLevel === "settings" ? "opacity-50! translate-y-0 delay-0 hover:opacity-100!" : "",
            expandLevel === "menu" ? "opacity-100! translate-y-0 delay-0" : "",
            expandLevel === "collapsed" ? "opacity-0 translate-y-4 pointer-events-none" : "",
          ].join(" ")}
          role="button"
        >
          Utilities
        </div>

        {/* Settings button - dynamic position based on expand level */}
        <div
          onClick={onSettingsClick}
          className={[
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-10 hover:bg-white/30",
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

        {/* Arrangement buttons - appear when app is focused and toolbar is expanded */}
        {focusedAppId && expandLevel !== "collapsed" && !arrangeSubmenu && (
          <>
            {mainArrangeButtons.map((button, i) => {
              const IconComponent = button.icon;
              const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons

              return (
                <div
                  key={`arrange-${i}`}
                  onClick={() => handleArrangeButtonClick(button)}
                  className={[
                    "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                    "bottom-0 opacity-100 z-10"
                  ].join(" ")}
                  style={{
                    transform: `translateX(-${distance}rem)`,
                    transitionDelay: `${75 + i * 75}ms`,
                  }}
                  role="button"
                  title={button.title || button.name}
                >
                  <IconComponent size={16} strokeWidth={2.5} />
                  <span className="text-[8px] font-bold">{button.name}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Halves submenu for arrangement */}
        {focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "halves" && (
          <>
            {halvesButtons.map((button, i) => {
              const IconComponent = button.icon;
              const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons

              return (
                <div
                  key={`halves-${i}`}
                  onClick={() => handleArrangeButtonClick(button)}
                  className={[
                    "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                    "bottom-0 opacity-100 z-10"
                  ].join(" ")}
                  style={{
                    transform: `translateX(-${distance}rem)`,
                    transitionDelay: `${75 + i * 75}ms`,
                  }}
                  role="button"
                  title={button.title || button.name}
                >
                  <IconComponent size={16} strokeWidth={2.5} />
                  <span className="text-[8px] font-bold">{button.name}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Quarters submenu for arrangement */}
        {focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "quarters" && (
          <>
            {quartersButtons.map((button, i) => {
              const IconComponent = button.icon;
              const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons

              return (
                <div
                  key={`quarters-${i}`}
                  onClick={() => handleArrangeButtonClick(button)}
                  className={[
                    "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                    "bottom-0 opacity-100 z-10"
                  ].join(" ")}
                  style={{
                    transform: `translateX(-${distance}rem)`,
                    transitionDelay: `${75 + i * 75}ms`,
                  }}
                  role="button"
                  title={button.title || button.name}
                >
                  <IconComponent size={16} strokeWidth={2.5} />
                  <span className="text-[8px] font-bold">{button.name}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Thirds submenu for arrangement */}
        {focusedAppId && expandLevel !== "collapsed" && arrangeSubmenu === "thirds" && (
          <>
            {thirdsButtons.map((button, i) => {
              const IconComponent = button.icon;
              const distance = (i + 1) * 3.5; // 3.5rem spacing for square buttons

              return (
                <div
                  key={`thirds-${i}`}
                  onClick={() => handleArrangeButtonClick(button)}
                  className={[
                    "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-white/20",
                    "bottom-0 opacity-100 z-10"
                  ].join(" ")}
                  style={{
                    transform: `translateX(-${distance}rem)`,
                    transitionDelay: `${75 + i * 75}ms`,
                  }}
                  role="button"
                  title={button.title || button.name}
                >
                  <IconComponent size={16} strokeWidth={2.5} />
                  <span className="text-[8px] font-bold">{button.name}</span>
                </div>
              );
            })}
          </>
        )}

        {/* Workspaces button - dynamic position based on expand level */}
        <div
          onClick={onWorkspacesClick}
          className={[
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-10 hover:bg-white/30",
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

        {/* Arrange Submenu */}
        <ToolbarSubmenu
          submenuId="arrange"
          buttons={arrangeButtons}
          isActive={expandLevel === "workspaces" && currentSubmenu === "arrange"}
          animationState={getArrangeAnimationState()}
          bottomPosition="bottom-16"
          expandLevel={expandLevel}
          onItemClick={handleWorkspaceArrangeButtonClick}
        />

        {/* Settings Submenu */}
        <ToolbarSubmenu
          submenuId="settings"
          buttons={settingsButtons}
          isActive={expandLevel === "settings"}
          animationState={getSettingsAnimationState()}
          bottomPosition="bottom-16"
          expandLevel={expandLevel}
        />
      </div>
    </div>
  );
}
