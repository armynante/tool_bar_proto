import { LucideIcon } from "lucide-react";

export interface ToolbarButtonConfig {
  name: string;
  workspace?: string;
  icon: LucideIcon;
  shift: string;
  delay: string;
  isCancel?: boolean;
  onClick?: () => void;
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

