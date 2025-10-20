export interface AppState {
  id: string;
  isLaunched: boolean; // Is the app running?
  isVisible: boolean; // Is the window visible on screen?
  position: { x: number; y: number };
  size: { width: number; height: number };
  title: string;
  imageSrc: string;
  imageAlt: string;
  zIndex: number;
  dockIcon?: string; // emoji or icon for dock
}

export interface WorkspaceAppConfig {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface WorkspaceConfig {
  apps: WorkspaceAppConfig[];
}

export interface AppRegistry {
  [appId: string]: AppState;
}

export interface WorkspaceConfigs {
  [workspaceName: string]: WorkspaceConfig;
}

