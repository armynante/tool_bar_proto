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

