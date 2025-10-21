import { AppState, WorkspaceConfigs } from '../types';
import hackerNewsScreenshot from '../assets/hacker-news-screenshot.png';
import notesScreenshot from '../assets/notes-screenshot.png';
import xcodeScreenshot from '../assets/xcode-bg.png';
import linearScreenshot from '../assets/linear-screenshot.png';
import figmaScreenshot from '../assets/figma-screenshot.png';

export const DEFAULT_APPS: AppState[] = [
  {
    id: 'hacker-news',
    isLaunched: false,
    isVisible: false,
    position: { x: 100, y: 100 },
    size: { width: 800, height: 500 },
    title: 'Hacker News',
    imageSrc: hackerNewsScreenshot,
    imageAlt: 'Hacker News Screenshot',
    zIndex: 1,
    dockIcon: '🔶' // Orange diamond for Hacker News
  },
  {
    id: 'todo-list',
    isLaunched: false,
    isVisible: false,
    position: { x: 300, y: 200 },
    size: { width: 600, height: 700 },
    title: 'Todo List',
    imageSrc: notesScreenshot,
    imageAlt: 'Todo List Screenshot',
    zIndex: 1,
    dockIcon: '✅' // Check mark for todo/tasks
  },
  {
    id: 'xcode',
    isLaunched: false,
    isVisible: false,
    position: { x: 150, y: 150 },
    size: { width: 900, height: 700 },
    title: 'Xcode',
    imageSrc: xcodeScreenshot,
    imageAlt: 'Xcode Screenshot',
    zIndex: 1,
    dockIcon: '🔨' // Hammer for Xcode
  },
  {
    id: 'notes',
    isLaunched: false,
    isVisible: false,
    position: { x: 250, y: 250 },
    size: { width: 700, height: 600 },
    title: 'Notes',
    imageSrc: notesScreenshot,
    imageAlt: 'Notes Screenshot',
    zIndex: 1,
    dockIcon: '📝' // Note for Notes
  },
  {
    id: 'linear',
    isLaunched: false,
    isVisible: false,
    position: { x: 200, y: 180 },
    size: { width: 850, height: 650 },
    title: 'Linear',
    imageSrc: linearScreenshot,
    imageAlt: 'Linear Screenshot',
    zIndex: 1,
    dockIcon: '⚡' // Lightning for Linear
  },
  {
    id: 'figma',
    isLaunched: false,
    isVisible: false,
    position: { x: 180, y: 120 },
    size: { width: 920, height: 720 },
    title: 'Figma',
    imageSrc: figmaScreenshot,
    imageAlt: 'Figma Screenshot',
    zIndex: 1,
    dockIcon: '🎨' // Art palette for Figma
  }
];

export const WORKSPACE_CONFIGS: WorkspaceConfigs = {
  nexus: {
    apps: [
      {
        id: 'hacker-news',
        position: { x: 100, y: 100 },
        size: { width: 800, height: 500 }
      },
      {
        id: 'todo-list',
        position: { x: 300, y: 200 },
        size: { width: 600, height: 700 }
      },
      {
        id: 'figma',
        position: { x: 500, y: 150 },
        size: { width: 850, height: 650 }
      }
    ]
  },
  main: {
    apps: [
      {
        id: 'xcode',
        position: { x: 50, y: 50 },
        size: { width: 900, height: 700 }
      },
      {
        id: 'notes',
        position: { x: 400, y: 100 },
        size: { width: 600, height: 650 }
      },
      {
        id: 'hacker-news',
        position: { x: 150, y: 250 },
        size: { width: 750, height: 500 }
      }
    ]
  },
  interview: {
    apps: [
      {
        id: 'linear',
        position: { x: 200, y: 150 },
        size: { width: 800, height: 600 }
      },
      {
        id: 'notes',
        position: { x: 500, y: 300 },
        size: { width: 650, height: 600 }
      },
      {
        id: 'todo-list',
        position: { x: 300, y: 100 },
        size: { width: 550, height: 650 }
      }
    ]
  },
  create: {
    apps: [
      {
        id: 'figma',
        position: { x: 150, y: 200 },
        size: { width: 900, height: 700 }
      },
      {
        id: 'xcode',
        position: { x: 250, y: 100 },
        size: { width: 850, height: 650 }
      }
    ]
  }
};

export function initializeRegistry(): { [key: string]: AppState } {
  const registry: { [key: string]: AppState } = {};
  DEFAULT_APPS.forEach(app => {
    registry[app.id] = app;
  });
  return registry;
}

export function mergeNewAppsIntoRegistry(existingRegistry: { [key: string]: AppState }): { [key: string]: AppState } {
  const merged = { ...existingRegistry };
  
  // Add any new apps that don't exist in the loaded registry
  DEFAULT_APPS.forEach(defaultApp => {
    if (!merged[defaultApp.id]) {
      merged[defaultApp.id] = defaultApp;
    }
  });
  
  return merged;
}

