import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { X } from "lucide-react";
import type { WindowsPreviewZone } from "../types";

interface LayoutZoneDefinition {
  id: string;
  target: string;
  style: CSSProperties;
}

interface LayoutDefinition {
  id: string;
  zones: LayoutZoneDefinition[];
}

const LAYOUTS: LayoutDefinition[] = [
  {
    id: "layout-halves",
    zones: [
      {
        id: "layout-halves-left",
        target: "half-left",
        style: { left: "0%", top: "0%", width: "50%", height: "100%" },
      },
      {
        id: "layout-halves-right",
        target: "half-right",
        style: { left: "50%", top: "0%", width: "50%", height: "100%" },
      },
    ],
  },
  {
    id: "layout-thirds",
    zones: [
      {
        id: "layout-thirds-left",
        target: "third-left",
        style: { left: "0%", top: "0%", width: "33.333%", height: "100%" },
      },
      {
        id: "layout-thirds-center",
        target: "third-center",
        style: { left: "33.333%", top: "0%", width: "33.333%", height: "100%" },
      },
      {
        id: "layout-thirds-right",
        target: "third-right",
        style: { left: "66.666%", top: "0%", width: "33.333%", height: "100%" },
      },
    ],
  },
  {
    id: "layout-quarters",
    zones: [
      {
        id: "layout-quarters-top-left",
        target: "quarter-tl",
        style: { left: "0%", top: "0%", width: "50%", height: "50%" },
      },
      {
        id: "layout-quarters-top-right",
        target: "quarter-tr",
        style: { left: "50%", top: "0%", width: "50%", height: "50%" },
      },
      {
        id: "layout-quarters-bottom-left",
        target: "quarter-bl",
        style: { left: "0%", top: "50%", width: "50%", height: "50%" },
      },
      {
        id: "layout-quarters-bottom-right",
        target: "quarter-br",
        style: { left: "50%", top: "50%", width: "50%", height: "50%" },
      },
    ],
  },
  {
    id: "layout-two-quarters-right",
    zones: [
      {
        id: "layout-two-quarters-left-top",
        target: "quarter-tl",
        style: { left: "0%", top: "0%", width: "50%", height: "50%" },
      },
      {
        id: "layout-two-quarters-left-bottom",
        target: "quarter-bl",
        style: { left: "0%", top: "50%", width: "50%", height: "50%" },
      },
      {
        id: "layout-two-quarters-half-right",
        target: "half-right",
        style: { left: "50%", top: "0%", width: "50%", height: "100%" },
      },
    ],
  },
];

interface WindowsLayoutSectionProps {
  isVisible: boolean;
  activeZone: string | null;
  onClose: () => void;
  onZonesChange: (zones: WindowsPreviewZone[]) => void;
}

export function WindowsLayoutSection({
  isVisible,
  activeZone,
  onClose,
  onZonesChange,
}: WindowsLayoutSectionProps) {
  const zoneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const zoneTargetsRef = useRef<Record<string, string>>({});
  const lastSerializedZonesRef = useRef<string>("");

  const assignZoneRef = useCallback(
    (zone: LayoutZoneDefinition) => (el: HTMLDivElement | null) => {
      zoneRefs.current[zone.id] = el;
      zoneTargetsRef.current[zone.id] = zone.target;
    },
    []
  );

  const updateZones = useCallback(() => {
    console.log('[WindowsLayoutSection] updateZones called, isVisible:', isVisible);
    if (!isVisible) {
      if (lastSerializedZonesRef.current !== "") {
        lastSerializedZonesRef.current = "";
        onZonesChange([]);
      }
      return;
    }

    const zones: WindowsPreviewZone[] = [];
    Object.entries(zoneRefs.current).forEach(([domId, element]) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const target = zoneTargetsRef.current[domId];
      if (!target) return;
      zones.push({
        id: domId,
        target,
        rect: {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      });
    });
    console.log('[WindowsLayoutSection] Computed zones:', zones.length);
    const serialized = JSON.stringify(zones);
    if (serialized !== lastSerializedZonesRef.current) {
      console.log('[WindowsLayoutSection] Zones changed, notifying parent');
      lastSerializedZonesRef.current = serialized;
      onZonesChange(zones);
    }
  }, [isVisible, onZonesChange]);

  useEffect(() => {
    if (!isVisible) {
      if (lastSerializedZonesRef.current !== "") {
        lastSerializedZonesRef.current = "";
        onZonesChange([]);
      }
      return;
    }

    updateZones();
    const handleResize = () => updateZones();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, updateZones, onZonesChange]);

  useEffect(() => {
    if (!isVisible) return;
    // Update zones after paint to ensure measurements are accurate when visibility toggles on
    const raf = requestAnimationFrame(() => updateZones());
    return () => cancelAnimationFrame(raf);
  }, [isVisible, updateZones]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute right-[14rem] bottom-0 flex flex-col gap-3 p-4 bg-black/85 backdrop-blur-[27px] border border-white/25 rounded-2xl shadow-[0px_12px_30px_rgba(0,0,0,0.45)] z-[9999] min-w-[220px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">Windows Layouts</span>
          <span className="text-xs font-semibold text-white/90">Drag apps into a zone</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close windows layout preview"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex gap-3">
        {LAYOUTS.map((layout) => (
          <div
            key={layout.id}
            className="relative flex-1 min-w-[60px] aspect-[3/4] rounded-xl bg-white/5 border border-white/15 overflow-hidden"
          >
            {layout.zones.map((zone) => {
              const isActive = activeZone === zone.target;
              return (
                <div
                  key={zone.id}
                  ref={assignZoneRef(zone)}
                  data-zone-target={zone.target}
                  className={[
                    "absolute rounded-[6px] border transition-colors duration-150",
                    isActive
                      ? "border-emerald-400 bg-emerald-400/40"
                      : "border-white/25 bg-white/15 hover:bg-white/25",
                  ].join(" ")}
                  style={zone.style}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


