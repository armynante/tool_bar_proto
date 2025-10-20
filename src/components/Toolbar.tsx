import { Plus, Home, MessageSquare, Box, Settings2, EyeOff, Move, X, Save, Grid, EyeOffIcon, Maximize2, Maximize, Columns2, Columns3, Grid2X2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ToolbarSubmenu } from "./ToolbarSubmenu";
import { ToolbarButtonConfig } from "../types/toolbar";
import { useNestedSubmenuNavigation } from "../hooks/useSubmenuAnimation";

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
  const { navigationPath, currentSubmenu, navigateToSubmenu, navigateBack, getParentLabel } = useNestedSubmenuNavigation(300);

  // Reset submenu when expandLevel changes
  useEffect(() => {
    if (expandLevel !== "workspaces") {
      // Reset navigation when leaving workspaces
      while (navigationPath.length > 0) {
        navigateBack();
      }
    }
  }, [expandLevel, navigationPath.length, navigateBack]);

  const workspaceButtons: ToolbarButtonConfig[] = [
    { name: "Create", workspace: "create", icon: Plus, shift: "-translate-x-16", delay: "delay-75", opensSubmenu: "create" },
    { name: "Main", workspace: "main", icon: Home, shift: "-translate-x-32", delay: "delay-150" },
    { name: "Interview", workspace: "interview", icon: MessageSquare, shift: "-translate-x-48", delay: "delay-[225ms]" },
    { name: "Nexus", workspace: "nexus", icon: Box, shift: "-translate-x-64", delay: "delay-300" },
  ];

  const createModeButtons: ToolbarButtonConfig[] = [
    { name: "cancel", workspace: "create", icon: X, shift: "-translate-x-16", delay: "delay-75", isCancel: true },
    { name: "save", workspace: "create", icon: Save, shift: "-translate-x-32", delay: "delay-150" },
    { name: "arrange", workspace: "create", icon: Grid, shift: "-translate-x-48", delay: "delay-[225ms]", opensSubmenu: "arrange" },
    { name: "hide all", workspace: "create", icon: EyeOffIcon, shift: "-translate-x-64", delay: "delay-300" },
  ];

  const arrangeButtons: ToolbarButtonConfig[] = [
    { name: "cancel", workspace: "arrange", icon: X, shift: "-translate-x-16", delay: "delay-75", isCancel: true },
    { name: "center", workspace: "arrange", icon: Maximize2, shift: "-translate-x-32", delay: "delay-150" },
    { name: "maximize", workspace: "arrange", icon: Maximize, shift: "-translate-x-48", delay: "delay-[225ms]" },
    { name: "halves", workspace: "arrange", icon: Columns2, shift: "-translate-x-64", delay: "delay-300" },
    { name: "quarters", workspace: "arrange", icon: Grid2X2, shift: "-translate-x-80", delay: "delay-[375ms]" },
    { name: "thirds", workspace: "arrange", icon: Columns3, shift: "-translate-x-96", delay: "delay-[450ms]" },
  ];

  const settingsButtons: ToolbarButtonConfig[] = [
    { name: "Edit", icon: Settings2, shift: "-translate-x-16", delay: "delay-75" },
    { name: "Hide", icon: EyeOff, shift: "-translate-x-32", delay: "delay-150" },
    { name: "Move", icon: Move, shift: "-translate-x-48", delay: "delay-[225ms]" },
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

  const handleArrangeButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      navigateBack();
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
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
          onItemClick={handleArrangeButtonClick}
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
