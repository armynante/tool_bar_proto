import { useEffect, useState } from "react";

export type LayoutType = "quarters" | "splits" | "two-quarters-left" | null;

interface LayoutOverlayProps {
  layoutType: LayoutType;
  onZoneClick?: (zone: string) => void;
}

interface Zone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export function LayoutOverlay({ layoutType, onZoneClick }: LayoutOverlayProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

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
        // Four boxes in each corner
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
    }

    setZones(newZones);
  }, [layoutType]);

  if (!layoutType || zones.length === 0) {
    return null;
  }

  return (
    <div className="z-[9998] fixed inset-0 pointer-events-none">
      {zones.map((zone) => (
        <div
          key={zone.id}
          className={[
            "absolute border-4 rounded-lg transition-all duration-200 pointer-events-auto cursor-pointer",
            hoveredZone === zone.id
              ? "bg-blue-500/30 border-blue-400 backdrop-blur-sm"
              : "bg-white/10 border-white/40 backdrop-blur-sm",
          ].join(" ")}
          style={{
            left: `${zone.x}px`,
            top: `${zone.y}px`,
            width: `${zone.width}px`,
            height: `${zone.height}px`,
          }}
          onMouseEnter={() => setHoveredZone(zone.id)}
          onMouseLeave={() => setHoveredZone(null)}
          onClick={() => onZoneClick?.(zone.id)}
        >
          <div className="flex justify-center items-center w-full h-full">
            <span className="drop-shadow-lg font-bold text-white text-2xl">
              {zone.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

