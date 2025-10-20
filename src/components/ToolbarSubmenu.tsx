import { ToolbarButtonConfig, SubmenuAnimationState } from '../types/toolbar';

interface ToolbarSubmenuProps {
  submenuId: string;
  buttons: ToolbarButtonConfig[];
  isActive: boolean;
  animationState: SubmenuAnimationState;
  bottomPosition: 'bottom-16' | 'bottom-32';
  expandLevel: string;
  onItemClick?: (button: ToolbarButtonConfig) => void;
}

export function ToolbarSubmenu({
  submenuId,
  buttons,
  isActive,
  animationState,
  bottomPosition,
  expandLevel,
  onItemClick,
}: ToolbarSubmenuProps) {
  const getAnimationClasses = (button: ToolbarButtonConfig) => {
    // When collapsed or collapsing, items should be hidden at center
    if (animationState === 'collapsed') {
      return 'translate-x-0 opacity-0 pointer-events-none';
    }
    
    if (animationState === 'collapsing') {
      return 'translate-x-0 opacity-0 pointer-events-none';
    }
    
    // When expanding or expanded, items slide out to their positions
    if (animationState === 'expanding' || animationState === 'expanded') {
      if (isActive && (expandLevel === 'workspaces' || expandLevel === 'settings')) {
        return `${button.shift} opacity-100`;
      }
    }
    
    return 'translate-x-0 opacity-0 pointer-events-none';
  };

  return (
    <>
      {buttons.map((button, i) => {
        const IconComponent = button.icon;
        
        return (
          <div
            key={`${submenuId}-${i}`}
            onClick={() => onItemClick?.(button)}
            className={[
              "absolute right-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[27px] outline outline-white/30 rounded-xl w-12 h-12 cursor-pointer transform-gpu transition-all duration-300 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-white/20",
              bottomPosition,
              getAnimationClasses(button),
              button.delay,
            ].join(" ")}
            role="button"
          >
            <IconComponent className="text-white" size={16} strokeWidth={2.5} />
            <div className="mt-0.5 font-bold text-[6px] text-white">
              {button.name}
            </div>
          </div>
        );
      })}
    </>
  );
}

