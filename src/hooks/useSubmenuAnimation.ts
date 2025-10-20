import { useState, useEffect, useCallback } from 'react';
import { SubmenuAnimationState } from '../types/toolbar';

interface UseSubmenuAnimationReturn {
  animationState: SubmenuAnimationState;
  openSubmenu: () => void;
  closeSubmenu: () => void;
  isTransitioning: boolean;
}

export function useSubmenuAnimation(
  isParentActive: boolean,
  collapseDelay: number = 300,
  expandDelay: number = 50
): UseSubmenuAnimationReturn {
  const [animationState, setAnimationState] = useState<SubmenuAnimationState>('collapsed');

  const openSubmenu = useCallback(() => {
    setAnimationState('expanding');
    setTimeout(() => {
      setAnimationState('expanded');
    }, expandDelay);
  }, [expandDelay]);

  const closeSubmenu = useCallback(() => {
    setAnimationState('collapsing');
    setTimeout(() => {
      setAnimationState('collapsed');
    }, collapseDelay);
  }, [collapseDelay]);

  // Reset to collapsed when parent becomes inactive
  useEffect(() => {
    if (!isParentActive) {
      setAnimationState('collapsed');
    }
  }, [isParentActive]);

  const isTransitioning = animationState === 'collapsing' || animationState === 'expanding';

  return {
    animationState,
    openSubmenu,
    closeSubmenu,
    isTransitioning,
  };
}

interface UseSubmenuTransitionReturn {
  currentSubmenu: string | null;
  switchToSubmenu: (submenuId: string) => void;
  closeCurrentSubmenu: () => void;
  isTransitioning: boolean;
}

export function useSubmenuTransition(
  transitionDuration: number = 300
): UseSubmenuTransitionReturn {
  const [currentSubmenu, setCurrentSubmenu] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const switchToSubmenu = useCallback((submenuId: string) => {
    if (currentSubmenu === submenuId) return;

    setIsTransitioning(true);
    
    if (currentSubmenu !== null) {
      // First collapse the current submenu
      setTimeout(() => {
        setCurrentSubmenu(submenuId);
        setTimeout(() => {
          setIsTransitioning(false);
        }, transitionDuration);
      }, transitionDuration);
    } else {
      // No current submenu, just open the new one
      setCurrentSubmenu(submenuId);
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    }
  }, [currentSubmenu, transitionDuration]);

  const closeCurrentSubmenu = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSubmenu(null);
      setIsTransitioning(false);
    }, transitionDuration);
  }, [transitionDuration]);

  return {
    currentSubmenu,
    switchToSubmenu,
    closeCurrentSubmenu,
    isTransitioning,
  };
}

interface UseNestedSubmenuNavigationReturn {
  navigationPath: string[];
  currentSubmenu: string | null;
  navigateToSubmenu: (submenuId: string) => void;
  navigateBack: () => void;
  isTransitioning: boolean;
  getParentLabel: () => string;
}

const LABEL_MAP: { [key: string]: string } = {
  'create': 'Create',
  'arrange': 'Arrange',
};

export function useNestedSubmenuNavigation(
  transitionDuration: number = 300
): UseNestedSubmenuNavigationReturn {
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateToSubmenu = useCallback((submenuId: string) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setNavigationPath(prev => [...prev, submenuId]);
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    }, transitionDuration);
  }, [transitionDuration]);

  const navigateBack = useCallback(() => {
    if (navigationPath.length === 0) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setNavigationPath(prev => prev.slice(0, -1));
      setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration);
    }, transitionDuration);
  }, [navigationPath.length, transitionDuration]);

  const getParentLabel = useCallback(() => {
    if (navigationPath.length === 0) return 'Workspaces';
    const lastSubmenu = navigationPath[navigationPath.length - 1];
    return LABEL_MAP[lastSubmenu] || 'Workspaces';
  }, [navigationPath]);

  const currentSubmenu = navigationPath.length > 0 ? navigationPath[navigationPath.length - 1] : null;

  return {
    navigationPath,
    currentSubmenu,
    navigateToSubmenu,
    navigateBack,
    isTransitioning,
    getParentLabel,
  };
}

