import { AppState, WorkspaceConfigs } from '../types';
import hackerNewsScreenshot from '../assets/hacker-news-screenshot.png';
import notesScreenshot from '../assets/notes-screenshot.png';

export const DEFAULT_APPS: AppState[] = [
  {
    id: 'hacker-news',
    isVisible: false,
    position: { x: 100, y: 100 },
    size: { width: 800, height: 500 },
    title: 'Hacker News',
    imageSrc: hackerNewsScreenshot,
    imageAlt: 'Hacker News Screenshot'
  },
  {
    id: 'todo-list',
    isVisible: false,
    position: { x: 300, y: 200 },
    size: { width: 600, height: 700 },
    title: 'Todo List',
    imageSrc: notesScreenshot,
    imageAlt: 'Todo List Screenshot'
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
      }
    ]
  },
  main: {
    apps: [
      {
        id: 'hacker-news',
        position: { x: 50, y: 50 },
        size: { width: 900, height: 600 }
      },
      {
        id: 'todo-list',
        position: { x: 400, y: 100 },
        size: { width: 500, height: 800 }
      }
    ]
  },
  interview: {
    apps: [
      {
        id: 'hacker-news',
        position: { x: 200, y: 150 },
        size: { width: 700, height: 450 }
      },
      {
        id: 'todo-list',
        position: { x: 500, y: 300 },
        size: { width: 550, height: 650 }
      }
    ]
  },
  create: {
    apps: [
      {
        id: 'hacker-news',
        position: { x: 150, y: 200 },
        size: { width: 750, height: 550 }
      },
      {
        id: 'todo-list',
        position: { x: 250, y: 100 },
        size: { width: 650, height: 750 }
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

