import { Plus, Home, MessageSquare, Box, X, Save, EyeOffIcon, Maximize2, Maximize, Columns2, Columns3, Grid2X2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Grid, Eye, LayoutGrid, SplitSquareVertical, PanelLeftClose } from "lucide-react";
import { useState, useEffect } from "react";
import { ToolbarSubmenu } from "./ToolbarSubmenu";
import { ToolbarButtonConfig } from "../types/toolbar";
import { useNestedSubmenuNavigation } from "../hooks/useSubmenuAnimation";
import { LayoutOverlay, LayoutType, Zone } from "./LayoutOverlay";
import { AppRegistry, WorkspaceConfig } from "../types";

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
  appRegistry?: AppRegistry;
  onClearFocus?: () => void;
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
  setOnDragStartCallback,
  appRegistry,
  onClearFocus
}: ToolbarProps) {
  const { navigationPath, currentSubmenu, navigateToSubmenu, navigateBack, getParentLabel } = useNestedSubmenuNavigation(300);
  const [arrangeSubmenu, setArrangeSubmenu] = useState<string | null>(null);
  const [activeLayoutType, setActiveLayoutType] = useState<LayoutType>(null);
  const [isSaveInputVisible, setIsSaveInputVisible] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [editingWorkspaceKey, setEditingWorkspaceKey] = useState<string | null>(null);
  const [isEditingArrangement, setIsEditingArrangement] = useState(false);
  const [workspaceButtons, setWorkspaceButtons] = useState<ToolbarButtonConfig[]>(() => {
    // Load saved workspaces from localStorage
    const savedWorkspaces = localStorage.getItem('customWorkspaces');
    const defaultButtons = [
      { name: "Create", workspace: "create", icon: Plus, opensSubmenu: "create" },
      { name: "Main", workspace: "main", icon: Home },
      { name: "Interview", workspace: "interview", icon: MessageSquare },
      { name: "Nexus", workspace: "nexus", icon: Box },
    ];
    
    if (savedWorkspaces) {
      try {
        const custom = JSON.parse(savedWorkspaces);
        // Insert custom workspaces after Create button
        const buttons: ToolbarButtonConfig[] = [defaultButtons[0]];
        custom.forEach((ws: any) => {
          const iconMap: Record<string, any> = {
            'Home': Home, 'Box': Box, 'Grid': Grid,
            'MessageSquare': MessageSquare, 'Eye': Eye, 'Grid2X2': Grid2X2,
          };
          const button: ToolbarButtonConfig = {
            name: ws.name,
            workspace: ws.key,
            icon: ws.iconName ? iconMap[ws.iconName] || Box : Box,
            emoji: ws.emoji,
            title: `${ws.name} workspace`
          };
          buttons.push(button);
        });
        buttons.push(...defaultButtons.slice(1));
        return buttons;
      } catch (e) {
        console.error('Failed to load custom workspaces:', e);
      }
    }
    return defaultButtons;
  });

  // Reset submenu when expandLevel changes
  useEffect(() => {
    if (expandLevel !== "workspaces" && navigationPath.length > 0) {
      // Reset navigation when leaving workspaces
      navigateBack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandLevel, navigationPath.length]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandLevel, navigationPath.length]);

  // Set up drag start callback when in layout mode AND viewing the layouts submenu
  useEffect(() => {
    const isInLayoutsSubmenu = currentSubmenu === "layouts" && navigationPath.length === 2;
    
    if (activeLayoutType && isInLayoutsSubmenu && setOnDragStartCallback) {
      // When dragging starts while viewing layouts submenu, navigate back to create
      setOnDragStartCallback(() => () => {
        navigateBack();
      });
    } else if (setOnDragStartCallback) {
      setOnDragStartCallback(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayoutType, currentSubmenu, navigationPath.length]);

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


  const handleWorkspaceButtonClick = (button: ToolbarButtonConfig & { originalWorkspace?: string }) => {
    if (button.opensSubmenu) {
      navigateToSubmenu(button.opensSubmenu);
    } else if (button.workspace === 'edit' && button.originalWorkspace) {
      // Handle edit mode - load workspace data into save prompt
      const workspaceToEdit = workspaceButtons.find(wb => wb.workspace === button.originalWorkspace);
      if (workspaceToEdit && workspaceToEdit.workspace) {
        setEditingWorkspaceKey(workspaceToEdit.workspace);
        setLayoutName(workspaceToEdit.name);
        setSelectedIcon(workspaceToEdit.emoji || `lucide:${workspaceToEdit.icon.name || 'Box'}`);
        setIsSaveInputVisible(true);
      }
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleCreateButtonClick = (button: ToolbarButtonConfig) => {
    if (button.isCancel) {
      if (isSaveInputVisible) {
        // Cancel from save input - handled inside modal now
        return;
      } else {
        // Cancel from create menu
        navigateBack();
        setActiveLayoutType(null);
        onCloseLayout?.();
      }
    } else if (button.name === "save") {
      if (isSaveInputVisible) {
        // Save handled inside modal now
        return;
      } else {
        // Show save input
        setIsSaveInputVisible(true);
      }
    } else if (button.opensSubmenu) {
      navigateToSubmenu(button.opensSubmenu);
    } else if (button.workspace) {
      onWorkspaceClick(button.workspace);
    }
  };

  const handleCancelSave = () => {
    setIsSaveInputVisible(false);
    setLayoutName("");
    setSelectedIcon(null);
    setEditingWorkspaceKey(null);
    setIsEditingArrangement(false);
  };

  const handleEditArrangement = () => {
    setIsEditingArrangement(true);
    navigateToSubmenu("create");
  };

  const handleUpdateLayout = () => {
    setIsEditingArrangement(false);
    onClearFocus?.();
    navigateBack();
  };

  const handleCancelArrangementEdit = () => {
    setIsEditingArrangement(false);
    setActiveLayoutType(null);
    onCloseLayout?.();
    navigateBack();
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

  const handleSaveLayout = () => {
    // Validate inputs
    if (!layoutName.trim()) {
      alert("Please enter a layout name");
      return;
    }
    if (!selectedIcon) {
      alert("Please select an icon");
      return;
    }

    // Get visible apps and their current positions/sizes
    const visibleApps = appRegistry ? Object.values(appRegistry).filter(app => app.isVisible) : [];
    
    // Use existing workspace key if editing (don't change it even if name changes), otherwise create new one
    const isEditing = !!editingWorkspaceKey;
    const workspaceKey = isEditing ? editingWorkspaceKey : layoutName.toLowerCase().replace(/\s+/g, '-');
    
    // Determine the icon component and emoji
    let iconComponent;
    let emojiIcon: string | undefined;
    
    if (selectedIcon.startsWith('lucide:')) {
      // Extract Lucide icon name and map to component
      const iconName = selectedIcon.replace('lucide:', '');
      const iconMap: Record<string, any> = {
        'Home': Home,
        'Box': Box,
        'Grid': Grid,
        'MessageSquare': MessageSquare,
        'Eye': Eye,
        'Grid2X2': Grid2X2,
      };
      iconComponent = iconMap[iconName] || Box;
    } else {
      // For emoji, store the emoji and use a fallback icon
      emojiIcon = selectedIcon;
      iconComponent = Box;
    }

    // Update or create workspace button
    const updatedButton: ToolbarButtonConfig = {
      name: layoutName,
      workspace: workspaceKey,
      icon: iconComponent,
      emoji: emojiIcon,
      title: `${layoutName} workspace`
    };
    
    setWorkspaceButtons(prev => {
      if (isEditing) {
        // Update existing button
        return prev.map(btn => 
          btn.workspace === workspaceKey ? updatedButton : btn
        );
      } else {
        // Insert after Create button (index 0)
        const newButtons = [...prev];
        newButtons.splice(1, 0, updatedButton);
        return newButtons;
      }
    });

    // Create workspace config
    const workspaceConfig: WorkspaceConfig = {
      apps: visibleApps.map(app => ({
        id: app.id,
        position: app.position,
        size: app.size
      })),
      layoutType: activeLayoutType || undefined,
      icon: selectedIcon
    };

    // Save to localStorage for persistence
    try {
      // Save workspace config
      const existingConfigs = localStorage.getItem('customWorkspaceConfigs');
      const configs = existingConfigs ? JSON.parse(existingConfigs) : {};
      configs[workspaceKey] = workspaceConfig;
      localStorage.setItem('customWorkspaceConfigs', JSON.stringify(configs));

      // Save workspace button metadata
      const existingWorkspaces = localStorage.getItem('customWorkspaces');
      let workspaces = existingWorkspaces ? JSON.parse(existingWorkspaces) : [];
      
      if (isEditing) {
        // Update existing workspace metadata
        workspaces = workspaces.map((ws: any) => 
          ws.key === workspaceKey 
            ? {
                key: workspaceKey,
                name: layoutName,
                emoji: emojiIcon,
                iconName: emojiIcon ? undefined : selectedIcon.replace('lucide:', '')
              }
            : ws
        );
      } else {
        // Add new workspace metadata
        workspaces.push({
          key: workspaceKey,
          name: layoutName,
          emoji: emojiIcon,
          iconName: emojiIcon ? undefined : selectedIcon.replace('lucide:', '')
        });
      }
      
      localStorage.setItem('customWorkspaces', JSON.stringify(workspaces));

      console.log(isEditing ? "Updated workspace:" : "Saved workspace:", workspaceKey, workspaceConfig);
    } catch (e) {
      console.error('Failed to save workspace:', e);
    }

    // Trigger workspace click to load the saved layout (only for new workspaces)
    if (!isEditing) {
      onWorkspaceClick(workspaceKey);
    }

    // Reset state
    setIsSaveInputVisible(false);
    setLayoutName("");
    setSelectedIcon(null);
    setEditingWorkspaceKey(null);
    setActiveLayoutType(null);
    onCloseLayout?.();
    
    // Navigate back to workspaces if creating new
    if (!isEditing) {
      navigateBack();
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
            "absolute right-0 bottom-0 flex items-center justify-center bg-black/80 backdrop-blur-[27px] outline outline-white/30 cursor-pointer transition-all duration-300 z-[9999] rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-2xl font-bold hover:bg-black/90",
            expandLevel === "collapsed" ? "w-12 h-3 rounded-full hover:scale-150" : "w-12 h-12",
          ].join(" ")}
        >
          {expandLevel !== "collapsed" && "×"}
        </div>


        {/* Settings button - dynamic position based on expand level */}
        <div
          onClick={onSettingsClick}
          className={[
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-[9999] hover:bg-black/90",
            // Dynamic bottom position
            expandLevel === "settings" ? "bottom-16" : "bottom-32",
            expandLevel === "settings" ? "bg-black/90 opacity-100" : "bg-black/80",
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
          // Only show when: focused app exists, toolbar expanded, no submenu active, not in layout mode, and not in any workspace submenu
          const isVisible = focusedAppId && expandLevel !== "collapsed" && !arrangeSubmenu && !activeLayout && navigationPath.length === 0;

          return (
            <div
              key={`arrange-${i}`}
              onClick={() => isVisible && handleAppArrangeButtonClick(button)}
              className={[
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-black/80 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-black/90",
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
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-black/80 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-black/90",
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
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-black/80 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-black/90",
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
                "absolute right-0 flex flex-col items-center justify-center gap-0.5 bg-black/80 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white hover:bg-black/90",
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
            "absolute right-0 flex items-center justify-center backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] text-white text-[7px] font-bold leading-tight z-[9999] hover:bg-black/90",
            // Dynamic bottom position - when workspaces is expanded, it's at bottom-16, otherwise bottom-32 when settings is expanded, or stays at bottom-16 in menu
            expandLevel === "workspaces" ? "bottom-16 bg-black/90 opacity-100" : "",
            expandLevel === "settings" ? "bottom-32 bg-black/80 opacity-50! hover:opacity-100!" : "",
            expandLevel === "menu" ? "bottom-16 bg-black/80 opacity-100 delay-150" : "",
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
          isSaveInputVisible={isSaveInputVisible && !isEditingArrangement}
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

        {/* Save Input Box - shown above create buttons when save is clicked or when editing (but not when editing arrangement) */}
        {isSaveInputVisible && !isEditingArrangement && ((currentSubmenu === "create") || editingWorkspaceKey) && (
          <div className="right-8 bottom-32 z-[9999] absolute bg-black/70 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] p-5 rounded-xl outline outline-white/30 w-[600px] transition-all duration-300">
            <div className="space-y-4">
              {/* Top Row - Layout Name Input */}
              <div>
                <label className="block mb-2 font-bold text-white text-sm">Layout Name</label>
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value.slice(0, 10))}
                  maxLength={10}
                  placeholder="Max 10 chars"
                  className="bg-black/40 px-3 py-2 border border-white/30 focus:border-white/60 rounded-lg focus:outline-none w-full text-white placeholder:text-white/40 text-base"
                />
                <div className="mt-1 text-white/60 text-xs">{layoutName.length}/10</div>
              </div>

              {/* Middle Row - Icon Picker */}
              <div>
                <label className="block mb-2 font-bold text-white text-sm">Icon</label>
                <div className="flex gap-3">
                  <div className="gap-2 grid grid-cols-6">
                    {/* Emoji icons */}
                    {['🔶', '✅', '📱', '💻', '🎨', '📊', '🏠', '💼', '🌟', '⚡', '🎯', '🚀'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedIcon(emoji)}
                        className={[
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer text-lg",
                          selectedIcon === emoji 
                            ? "bg-white/30 scale-110 ring-2 ring-white" 
                            : "bg-black/40 hover:bg-black/60"
                        ].join(" ")}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="gap-2 grid grid-cols-3">
                    {/* Lucide icons */}
                    {[Home, Box, Grid, MessageSquare, Eye, Grid2X2].map((IconComp, idx) => (
                      <button
                        key={`lucide-${idx}`}
                        onClick={() => setSelectedIcon(`lucide:${IconComp.name}`)}
                        className={[
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                          selectedIcon === `lucide:${IconComp.name}` 
                            ? "bg-white/30 scale-110 ring-2 ring-white" 
                            : "bg-black/40 hover:bg-black/60"
                        ].join(" ")}
                      >
                        <IconComp size={16} className="text-white" strokeWidth={2.5} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row - Apps in Layout */}
              <div>
                <label className="block mb-2 font-bold text-white text-sm">Apps in Layout</label>
                <div className="flex flex-wrap gap-2">
                  {appRegistry && Object.values(appRegistry)
                    .filter(app => app.isVisible)
                    .map(app => (
                      <div
                        key={app.id}
                        className="flex justify-center items-center bg-black/40 rounded-lg w-9 h-9 text-lg"
                        title={app.title}
                      >
                        {app.dockIcon || '📦'}
                      </div>
                    ))}
                  {(!appRegistry || Object.values(appRegistry).filter(app => app.isVisible).length === 0) && (
                    <div className="text-white/60 text-sm">No visible apps</div>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelSave}
                  className="flex flex-1 justify-center items-center gap-2 bg-black/60 hover:bg-black/80 px-4 py-2 rounded-lg font-bold text-white text-sm transition-all duration-200"
                >
                  <X size={16} strokeWidth={2.5} />
                  Cancel
                </button>
                {editingWorkspaceKey && !isEditingArrangement && (
                  <button
                    onClick={handleEditArrangement}
                    className="flex flex-1 justify-center items-center gap-2 bg-blue-500/60 hover:bg-blue-500/80 px-4 py-2 rounded-lg font-bold text-white text-sm transition-all duration-200"
                  >
                    <Grid size={16} strokeWidth={2.5} />
                    Edit Arrangement
                  </button>
                )}
                <button
                  onClick={handleSaveLayout}
                  className="flex flex-1 justify-center items-center gap-2 bg-black/80 hover:bg-black/90 px-4 py-2 rounded-lg font-bold text-white text-sm transition-all duration-200"
                >
                  <Save size={16} strokeWidth={2.5} />
                  {editingWorkspaceKey ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Update Layout and Cancel buttons - shown when editing arrangement */}
        {isEditingArrangement && editingWorkspaceKey && (
          <div className="bottom-8 left-1/2 z-[10000] fixed flex gap-3 -translate-x-1/2">
            <button
              onClick={handleCancelArrangementEdit}
              className="flex justify-center items-center gap-2 bg-black/60 hover:bg-black/80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] px-6 py-3 rounded-xl outline outline-white/30 font-bold text-white text-sm transition-all duration-200"
            >
              <X size={18} strokeWidth={2.5} />
              Cancel
            </button>
            <button
              onClick={handleUpdateLayout}
              className="flex justify-center items-center gap-2 bg-black/80 hover:bg-black/90 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] px-6 py-3 rounded-xl outline outline-white/30 font-bold text-white text-sm transition-all duration-200"
            >
              <Save size={18} strokeWidth={2.5} />
              Update Layout
            </button>
          </div>
        )}

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
