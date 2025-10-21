import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type LayoutType = 
  | "quarters" | "quarters-small" | "quarters-large"
  | "splits" 
  | "two-quarters-left" | "two-quarters-right" | "two-quarters-top" | "two-quarters-bottom"
  | "split-left-right" | "split-top-bottom" 
  | "thirds-vertical" | "thirds-horizontal" 
  | null;

export interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface LayoutOverlayProps {
  layoutType: LayoutType;
  activeZone: string | null;
  onClose?: () => void;
  onZonesReady?: (zones: Zone[]) => void;
}

export function LayoutOverlay({ layoutType, activeZone, onClose, onZonesReady }: LayoutOverlayProps) {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (!layoutType) {
      setZones([]);
      return;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 50;

    let newZones: Zone[] = [];

    switch (layoutType) {
      case "quarters":
        // Four boxes in each corner (medium padding)
        newZones = [
          {
            id: "quarter-tl",
            x: padding,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Left",
          },
          {
            id: "quarter-tr",
            x: screenWidth / 2 + padding / 2,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Right",
          },
          {
            id: "quarter-bl",
            x: padding,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Left",
          },
          {
            id: "quarter-br",
            x: screenWidth / 2 + padding / 2,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Right",
          },
        ];
        break;

      case "quarters-small":
        // Four boxes in each corner (small padding - tighter spacing)
        const smallPadding = padding * 0.5;
        newZones = [
          {
            id: "quarter-tl",
            x: smallPadding,
            y: smallPadding,
            width: screenWidth / 2 - smallPadding * 1.5,
            height: screenHeight / 2 - smallPadding * 1.5,
            label: "Top Left",
          },
          {
            id: "quarter-tr",
            x: screenWidth / 2 + smallPadding / 2,
            y: smallPadding,
            width: screenWidth / 2 - smallPadding * 1.5,
            height: screenHeight / 2 - smallPadding * 1.5,
            label: "Top Right",
          },
          {
            id: "quarter-bl",
            x: smallPadding,
            y: screenHeight / 2 + smallPadding / 2,
            width: screenWidth / 2 - smallPadding * 1.5,
            height: screenHeight / 2 - smallPadding * 1.5,
            label: "Bottom Left",
          },
          {
            id: "quarter-br",
            x: screenWidth / 2 + smallPadding / 2,
            y: screenHeight / 2 + smallPadding / 2,
            width: screenWidth / 2 - smallPadding * 1.5,
            height: screenHeight / 2 - smallPadding * 1.5,
            label: "Bottom Right",
          },
        ];
        break;

      case "quarters-large":
        // Four boxes in each corner (large padding - more spacing)
        const largePadding = padding * 1.5;
        newZones = [
          {
            id: "quarter-tl",
            x: largePadding,
            y: largePadding,
            width: screenWidth / 2 - largePadding * 1.5,
            height: screenHeight / 2 - largePadding * 1.5,
            label: "Top Left",
          },
          {
            id: "quarter-tr",
            x: screenWidth / 2 + largePadding / 2,
            y: largePadding,
            width: screenWidth / 2 - largePadding * 1.5,
            height: screenHeight / 2 - largePadding * 1.5,
            label: "Top Right",
          },
          {
            id: "quarter-bl",
            x: largePadding,
            y: screenHeight / 2 + largePadding / 2,
            width: screenWidth / 2 - largePadding * 1.5,
            height: screenHeight / 2 - largePadding * 1.5,
            label: "Bottom Left",
          },
          {
            id: "quarter-br",
            x: screenWidth / 2 + largePadding / 2,
            y: screenHeight / 2 + largePadding / 2,
            width: screenWidth / 2 - largePadding * 1.5,
            height: screenHeight / 2 - largePadding * 1.5,
            label: "Bottom Right",
          },
        ];
        break;

      case "splits":
        // Left and right split in thirds
        newZones = [
          {
            id: "third-left",
            x: padding,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Left Third",
          },
          {
            id: "third-center",
            x: screenWidth / 3 + padding / 2,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Center Third",
          },
          {
            id: "third-right",
            x: (screenWidth / 3) * 2 + padding / 2,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Right Third",
          },
        ];
        break;

      case "two-quarters-left":
        // Two quarters on the left and a half on the right
        newZones = [
          {
            id: "quarter-tl",
            x: padding,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Left",
          },
          {
            id: "quarter-bl",
            x: padding,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Left",
          },
          {
            id: "half-right",
            x: screenWidth / 2 + padding / 2,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight - padding * 2,
            label: "Right Half",
          },
        ];
        break;

      case "two-quarters-right":
        // Two quarters on the right and a half on the left
        newZones = [
          {
            id: "half-left",
            x: padding,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight - padding * 2,
            label: "Left Half",
          },
          {
            id: "quarter-tr",
            x: screenWidth / 2 + padding / 2,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Right",
          },
          {
            id: "quarter-br",
            x: screenWidth / 2 + padding / 2,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Right",
          },
        ];
        break;

      case "two-quarters-top":
        // Two quarters on top and a half on bottom
        newZones = [
          {
            id: "quarter-tl",
            x: padding,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Left",
          },
          {
            id: "quarter-tr",
            x: screenWidth / 2 + padding / 2,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Right",
          },
          {
            id: "half-bottom",
            x: padding,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth - padding * 2,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Half",
          },
        ];
        break;

      case "two-quarters-bottom":
        // Two quarters on bottom and a half on top
        newZones = [
          {
            id: "half-top",
            x: padding,
            y: padding,
            width: screenWidth - padding * 2,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Half",
          },
          {
            id: "quarter-bl",
            x: padding,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Left",
          },
          {
            id: "quarter-br",
            x: screenWidth / 2 + padding / 2,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Right",
          },
        ];
        break;

      case "split-left-right":
        // Left and right split (50/50)
        newZones = [
          {
            id: "half-left",
            x: padding,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight - padding * 2,
            label: "Left Half",
          },
          {
            id: "half-right",
            x: screenWidth / 2 + padding / 2,
            y: padding,
            width: screenWidth / 2 - padding * 1.5,
            height: screenHeight - padding * 2,
            label: "Right Half",
          },
        ];
        break;

      case "split-top-bottom":
        // Top and bottom split (50/50)
        newZones = [
          {
            id: "half-top",
            x: padding,
            y: padding,
            width: screenWidth - padding * 2,
            height: screenHeight / 2 - padding * 1.5,
            label: "Top Half",
          },
          {
            id: "half-bottom",
            x: padding,
            y: screenHeight / 2 + padding / 2,
            width: screenWidth - padding * 2,
            height: screenHeight / 2 - padding * 1.5,
            label: "Bottom Half",
          },
        ];
        break;

      case "thirds-vertical":
        // Vertical thirds (same as current "splits")
        newZones = [
          {
            id: "third-left",
            x: padding,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Left Third",
          },
          {
            id: "third-center",
            x: screenWidth / 3 + padding / 2,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Center Third",
          },
          {
            id: "third-right",
            x: (screenWidth / 3) * 2 + padding / 2,
            y: padding,
            width: screenWidth / 3 - padding,
            height: screenHeight - padding * 2,
            label: "Right Third",
          },
        ];
        break;

      case "thirds-horizontal":
        // Horizontal thirds
        newZones = [
          {
            id: "third-top",
            x: padding,
            y: padding,
            width: screenWidth - padding * 2,
            height: screenHeight / 3 - padding,
            label: "Top Third",
          },
          {
            id: "third-middle",
            x: padding,
            y: screenHeight / 3 + padding / 2,
            width: screenWidth - padding * 2,
            height: screenHeight / 3 - padding,
            label: "Middle Third",
          },
          {
            id: "third-bottom",
            x: padding,
            y: (screenHeight / 3) * 2 + padding / 2,
            width: screenWidth - padding * 2,
            height: screenHeight / 3 - padding,
            label: "Bottom Third",
          },
        ];
        break;
    }

    setZones(newZones);
    onZonesReady?.(newZones);
  }, [layoutType, onZonesReady]);

  if (!layoutType || zones.length === 0) {
    return null;
  }

  return (
    <div className="z-10 fixed inset-0 pointer-events-none">
      {zones.map((zone) => (
        <div
          key={zone.id}
          className={[
            "absolute rounded-lg transition-all duration-200 pointer-events-none",
            activeZone === zone.id
              ? "bg-green-500/40 border-green-400 border-8 backdrop-blur-sm"
              : "bg-white/10 border-white/40 border-4 backdrop-blur-sm",
          ].join(" ")}
          style={{
            left: `${zone.x}px`,
            top: `${zone.y}px`,
            width: `${zone.width}px`,
            height: `${zone.height}px`,
          }}
        >
          <div className="flex justify-center items-center w-full h-full">
            <span className="drop-shadow-lg font-bold text-white text-2xl">
              {zone.label}
            </span>
          </div>
        </div>
      ))}
      
      {/* Done button */}
      <div
        onClick={onClose}
        className="right-8 bottom-8 z-10000 fixed flex flex-col justify-center items-center gap-0.5 bg-white/10 hover:bg-white/20 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[27px] rounded-xl outline outline-white/30 w-12 h-12 text-white transition-all duration-300 cursor-pointer pointer-events-auto"
        role="button"
        title="Close Layout Mode"
      >
        <X size={16} strokeWidth={2.5} />
        <span className="font-bold text-[8px]">done</span>
      </div>
    </div>
  );
}

