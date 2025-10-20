import { AppState } from "../types";

interface DockProps {
  appRegistry: Record<string, AppState>;
  onDockClick: (id: string) => void;
}

export function Dock({ appRegistry, onDockClick }: DockProps) {
  return (
    <div className="bottom-2 left-1/2 z-50 fixed flex items-end gap-2 bg-white/10 shadow-2xl backdrop-blur-2xl px-3 py-2 border border-white/20 rounded-2xl -translate-x-1/2 transform">
      {Object.values(appRegistry).map(app => (
        <div
          key={app.id}
          onClick={(e) => {
            e.stopPropagation();
            onDockClick(app.id);
          }}
          className="group relative hover:scale-110 transition-all hover:-translate-y-2 duration-200 cursor-pointer"
          title={app.title}
        >
          <div className="flex justify-center items-center bg-white/20 shadow-lg backdrop-blur-sm border-2 border-white/40 rounded-xl w-14 h-14 overflow-hidden text-4xl">
            {/* Use the app's dock icon (emoji) */}
            {app.dockIcon || '📱'}
          </div>
          {/* Indicator dot for launched apps only */}
          {app.isLaunched && (
            <div className="-bottom-1 left-1/2 absolute bg-white/80 shadow-lg rounded-full w-1.5 h-1.5 -translate-x-1/2 transform"></div>
          )}
        </div>
      ))}
    </div>
  );
}

