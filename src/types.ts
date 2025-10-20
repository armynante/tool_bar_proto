export interface AppState {
  id: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  title: string;
  imageSrc: string;
  imageAlt: string;
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

