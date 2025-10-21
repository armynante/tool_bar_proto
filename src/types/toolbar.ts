import { LucideIcon } from "lucide-react";

export interface ToolbarButtonConfig {
  name: string;
  workspace?: string;
  icon: LucideIcon;
  emoji?: string; // Optional emoji icon to display instead of Lucide icon
  /** @deprecated Will be auto-calculated based on button index */
  shift?: string;
  /** @deprecated Will be auto-calculated based on button index */
  delay?: string;
  isCancel?: boolean;
  opensSubmenu?: string; // ID of submenu this button opens
  onClick?: () => void;
  title?: string; // Tooltip text for the button
}

export interface SubmenuConfig {
  buttons: ToolbarButtonConfig[];
  parentLabel: string;
  onItemClick?: (button: ToolbarButtonConfig) => void;
}

export type SubmenuAnimationState = 'collapsed' | 'collapsing' | 'expanding' | 'expanded';

export interface SubmenuState {
  animationState: SubmenuAnimationState;
  isActive: boolean;
}

export interface SubmenuNavigation {
  path: string[]; // Navigation path e.g., ['create', 'arrange']
  currentSubmenu: string | null;
  parentLabel: string;
}

export interface NestedSubmenuConfig extends SubmenuConfig {
  id: string;
  parentSubmenuId?: string;
}

