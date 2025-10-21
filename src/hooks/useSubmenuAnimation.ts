import { useState, useEffect, useCallback, useRef } from 'react';
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubmenu = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    setAnimationState('expanding');
    timeoutRef.current = setTimeout(() => {
      setAnimationState('expanded');
      timeoutRef.current = null;
    }, expandDelay);
  }, [expandDelay]);

  const closeSubmenu = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    setAnimationState('collapsing');
    timeoutRef.current = setTimeout(() => {
      setAnimationState('collapsed');
      timeoutRef.current = null;
    }, collapseDelay);
  }, [collapseDelay]);

  // Reset to collapsed when parent becomes inactive
  useEffect(() => {
    if (!isParentActive) {
      setAnimationState('collapsed');
    }
  }, [isParentActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
  const timeout1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const switchToSubmenu = useCallback((submenuId: string) => {
    if (currentSubmenu === submenuId) return;

    // Clear any existing timeouts
    if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);

    setIsTransitioning(true);

    if (currentSubmenu !== null) {
      // First collapse the current submenu
      timeout1Ref.current = setTimeout(() => {
        setCurrentSubmenu(submenuId);
        timeout2Ref.current = setTimeout(() => {
          setIsTransitioning(false);
          timeout2Ref.current = null;
        }, transitionDuration);
        timeout1Ref.current = null;
      }, transitionDuration);
    } else {
      // No current submenu, just open the new one
      setCurrentSubmenu(submenuId);
      timeout1Ref.current = setTimeout(() => {
        setIsTransitioning(false);
        timeout1Ref.current = null;
      }, transitionDuration);
    }
  }, [currentSubmenu, transitionDuration]);

  const closeCurrentSubmenu = useCallback(() => {
    // Clear any existing timeouts
    if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);

    setIsTransitioning(true);
    timeout1Ref.current = setTimeout(() => {
      setCurrentSubmenu(null);
      setIsTransitioning(false);
      timeout1Ref.current = null;
    }, transitionDuration);
  }, [transitionDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);
    };
  }, []);

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
  'layouts': 'Layouts',
};

export function useNestedSubmenuNavigation(
  transitionDuration: number = 300
): UseNestedSubmenuNavigationReturn {
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeout1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateToSubmenu = useCallback((submenuId: string) => {
    // Clear any existing timeouts
    if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);

    setIsTransitioning(true);

    timeout1Ref.current = setTimeout(() => {
      setNavigationPath(prev => [...prev, submenuId]);
      timeout2Ref.current = setTimeout(() => {
        setIsTransitioning(false);
        timeout2Ref.current = null;
      }, transitionDuration);
      timeout1Ref.current = null;
    }, transitionDuration);
  }, [transitionDuration]);

  const navigateBack = useCallback(() => {
    if (navigationPath.length === 0) return;

    // Clear any existing timeouts
    if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
    if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);

    setIsTransitioning(true);

    timeout1Ref.current = setTimeout(() => {
      setNavigationPath(prev => prev.slice(0, -1));
      timeout2Ref.current = setTimeout(() => {
        setIsTransitioning(false);
        timeout2Ref.current = null;
      }, transitionDuration);
      timeout1Ref.current = null;
    }, transitionDuration);
  }, [navigationPath.length, transitionDuration]);

  const getParentLabel = useCallback(() => {
    if (navigationPath.length === 0) return 'Workspaces';
    const lastSubmenu = navigationPath[navigationPath.length - 1];
    return LABEL_MAP[lastSubmenu] || 'Workspaces';
  }, [navigationPath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeout1Ref.current !== null) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current !== null) clearTimeout(timeout2Ref.current);
    };
  }, []);

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

