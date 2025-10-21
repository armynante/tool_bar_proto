import { ToolbarButtonConfig, SubmenuAnimationState } from '../types/toolbar';
import { useState } from 'react';
import { Edit, ArrowLeftRight, ArrowUpDown, Columns3, Columns } from 'lucide-react';

interface SplitOption {
  name: string;
  icon: typeof ArrowLeftRight;
  workspace: string;
  title: string;
}

const splitOptions: SplitOption[] = [
  { name: "L/R", icon: ArrowLeftRight, workspace: "split-left-right", title: "Left / Right Split" },
  { name: "T/B", icon: ArrowUpDown, workspace: "split-top-bottom", title: "Top / Bottom Split" },
  { name: "3V", icon: Columns3, workspace: "thirds-vertical", title: "Thirds Vertical" },
  { name: "3H", icon: Columns, workspace: "thirds-horizontal", title: "Thirds Horizontal" },
];

interface ToolbarSubmenuProps {
  submenuId: string;
  buttons: ToolbarButtonConfig[];
  isActive: boolean;
  animationState: SubmenuAnimationState;
  bottomPosition: 'bottom-16' | 'bottom-32';
  expandLevel: string;
  onItemClick?: (button: ToolbarButtonConfig) => void;
}

// Calculate transform distance based on button index
// Each button is 64px (4rem) apart
const getTransformDistance = (index: number): number => {
  return (index + 1) * 4; // Returns 4, 8, 12, 16, 20, 24 (in rem units)
};

// Calculate animation delay based on button index
// First button: 75ms, then +75ms for each subsequent button
const getAnimationDelay = (index: number): number => {
  return 75 + (index * 75); // Returns 75, 150, 225, 300, 375, 450
};

export function ToolbarSubmenu({
  submenuId,
  buttons,
  isActive,
  animationState,
  bottomPosition,
  expandLevel,
  onItemClick,
}: ToolbarSubmenuProps) {
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState<number | null>(null);
  const [splitsMenuOpen, setSplitsMenuOpen] = useState(false);

  const getAnimationClasses = (index: number) => {
    // When collapsed or collapsing, items should be hidden at center
    if (animationState === 'collapsed' || animationState === 'collapsing') {
      return 'translate-x-0 opacity-0 pointer-events-none';
    }
    
    // When expanding or expanded, items slide out to their positions
    if (animationState === 'expanding' || animationState === 'expanded') {
      if (isActive && (expandLevel === 'workspaces' || expandLevel === 'settings')) {
        return `opacity-100`;
      }
    }
    
    return 'translate-x-0 opacity-0 pointer-events-none';
  };

  const handleEditClick = (e: React.MouseEvent, button: ToolbarButtonConfig) => {
    e.stopPropagation();
    onItemClick?.({ ...button, workspace: 'edit', name: 'Edit' });
  };

  return (
    <>
      {buttons.map((button, i) => {
        const IconComponent = button.icon;
        const transformDistance = getTransformDistance(i);
        const animationDelay = getAnimationDelay(i);
        const isHovered = hoveredButtonIndex === i;
        // Show edit button only for workspaces (not for create button which has opensSubmenu)
        const showEditButton = isHovered && !button.opensSubmenu && submenuId === 'workspaces';
        // Check if this is the splits button
        const isSplitsButton = button.workspace === 'splits';
        const showSplitOptions = (isHovered || splitsMenuOpen) && isSplitsButton && submenuId === 'layouts';
        
        return (
          <div
            key={`${submenuId}-${i}`}
            className={[
              "absolute right-0 transform-gpu transition-all duration-300",
              bottomPosition,
              getAnimationClasses(i),
            ].join(" ")}
            style={{
              transform: animationState === 'expanded' || animationState === 'expanding' 
                ? `translateX(-${transformDistance}rem)` 
                : 'translateX(0)',
              transitionDelay: `${animationDelay}ms`,
            }}
          >
            {/* Main workspace button with hover container */}
            <div
              onMouseEnter={() => setHoveredButtonIndex(i)}
              onMouseLeave={() => setHoveredButtonIndex(null)}
              className="relative"
            >
              <div
                onClick={() => {
                  if (isSplitsButton) {
                    // Toggle the splits menu instead of closing
                    setSplitsMenuOpen(!splitsMenuOpen);
                  } else {
                    onItemClick?.(button);
                  }
                }}
                className={[
                  "flex flex-col justify-center items-center bg-white/10 hover:bg-white/20 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] rounded-xl outline outline-white/30 w-12 h-12 transition-all duration-300 cursor-pointer",
                  isSplitsButton && splitsMenuOpen ? "opacity-50" : "opacity-100"
                ].join(" ")}
                role="button"
              >
              <IconComponent className="text-white" size={16} strokeWidth={2.5} />
              <div className="mt-0.5 font-bold text-[6px] text-white">
                {button.name}
              </div>
            </div>
            
            {/* Invisible bridge to maintain hover state in the gap */}
            <div className="w-full h-1" />
            
            {/* Edit pill button - appears on hover for workspace buttons */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(e, button);
                }}
                className={[
                  "absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white cursor-pointer transition-all duration-200 flex items-center gap-1 whitespace-nowrap",
                  showEditButton 
                    ? "bg-white/20 hover:bg-white/40 opacity-70 hover:opacity-100" 
                    : "bg-white/10 opacity-0 pointer-events-none"
                ].join(" ")}
                role="button"
              >
                <Edit size={10} strokeWidth={2.5} />
                <span>edit</span>
              </div>
              
              {/* Split options - slide up when hovering splits button */}
              {isSplitsButton && splitOptions.map((splitOption, idx) => {
                const SplitIcon = splitOption.icon;
                const bottomDistance = (idx + 1) * 3.75; // 3.75rem spacing between options (48px button + 12px gap)
                // When just hovering, use 50% opacity. When menu is open (clicked), use 100% opacity
                const optionOpacity = showSplitOptions 
                  ? (splitsMenuOpen ? "opacity-100" : "opacity-50") 
                  : "opacity-0";
                
                return (
                  <div
                    key={splitOption.workspace}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Keep the menu open so you can toggle between different split layouts
                      onItemClick?.({ ...button, workspace: splitOption.workspace, name: splitOption.name });
                    }}
                    className={[
                      "absolute left-0 flex flex-col justify-center items-center bg-white/10 hover:bg-white/30 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] rounded-xl outline outline-white/30 w-12 h-12 transition-all duration-300 cursor-pointer",
                      optionOpacity,
                      showSplitOptions ? "pointer-events-auto" : "pointer-events-none"
                    ].join(" ")}
                    style={{
                      bottom: showSplitOptions ? `${bottomDistance}rem` : '0',
                      transitionDelay: showSplitOptions ? `${idx * 50}ms` : `${(splitOptions.length - idx) * 50}ms`,
                    }}
                    role="button"
                    title={splitOption.title}
                  >
                    <SplitIcon className="text-white" size={16} strokeWidth={2.5} />
                    <div className="mt-0.5 font-bold text-[6px] text-white">
                      {splitOption.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

