import { useEffect, useState } from "react";
import { calculateZoneGeometry } from "../utils/zoneCalculations";

interface WindowsSnapPreviewProps {
  activeZone: string | null;
}

export function WindowsSnapPreview({ activeZone }: WindowsSnapPreviewProps) {
  const [zoneGeometry, setZoneGeometry] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    console.log('[WindowsSnapPreview] Active zone changed:', activeZone);
    if (!activeZone) {
      setZoneGeometry(null);
      return;
    }

    const geometry = calculateZoneGeometry(activeZone);
    console.log('[WindowsSnapPreview] Calculated geometry:', geometry);
    if (geometry) {
      setZoneGeometry({
        x: geometry.position.x,
        y: geometry.position.y,
        width: geometry.size.width,
        height: geometry.size.height,
      });
    } else {
      setZoneGeometry(null);
    }
  }, [activeZone]);

  // Update zone geometry on window resize
  useEffect(() => {
    if (!activeZone) return;

    const handleResize = () => {
      const geometry = calculateZoneGeometry(activeZone);
      if (geometry) {
        setZoneGeometry({
          x: geometry.position.x,
          y: geometry.position.y,
          width: geometry.size.width,
          height: geometry.size.height,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeZone]);

  if (!zoneGeometry) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }}>
      <div
        className="absolute rounded-lg border-8 border-emerald-400 bg-emerald-400/40 backdrop-blur-sm transition-all duration-150"
        style={{
          left: `${zoneGeometry.x}px`,
          top: `${zoneGeometry.y}px`,
          width: `${zoneGeometry.width}px`,
          height: `${zoneGeometry.height}px`,
        }}
      >
        <div className="flex justify-center items-center w-full h-full">
          <span className="drop-shadow-lg font-bold text-white text-4xl opacity-80">
            Drop to snap
          </span>
        </div>
      </div>
    </div>
  );
}

