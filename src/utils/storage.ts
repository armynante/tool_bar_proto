import { AppRegistry } from '../types';

const STORAGE_KEY = 'tool_bar_proto_app_registry';

export function saveAppRegistry(registry: AppRegistry): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (error) {
    console.error('Failed to save app registry:', error);
  }
}

export function loadAppRegistry(): AppRegistry | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load app registry:', error);
  }
  return null;
}

// Debounced save function to reduce localStorage writes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function debouncedSaveAppRegistry(registry: AppRegistry, delay: number = 500): void {
  // Clear any pending save
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
  }

  // Schedule a new save
  saveTimeout = setTimeout(() => {
    saveAppRegistry(registry);
    saveTimeout = null;
  }, delay);
}

// Cleanup function to force save any pending changes (useful on unmount)
export function flushPendingSave(): void {
  if (saveTimeout !== null) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
}

