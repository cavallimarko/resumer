import { ViewMode, viewModeLabels, availableViewModes } from './types';

type ViewModeControlsProps = {
  title: string;
  currentMode: ViewMode;
  setMode: (mode: ViewMode) => void;
  columns?: 1 | 2; // Add columns prop
};

export const ViewModeControls = ({
  title,
  currentMode,
  setMode,
  columns = 2 // Default to 2 columns
}: ViewModeControlsProps) => {
  
  const gridColsClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
      {title && <div className="text-xs font-semibold mb-1">{title}</div>}
      <div className={`grid ${gridColsClass} gap-1`}>
        {availableViewModes.map(mode => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`px-2 py-1 text-xs rounded ${
              currentMode === mode 
                ? 'bg-blue-500 text-white' 
                : 'bg-transparent text-gray-700 hover:text-blue-600' 
            }`}
          >
            {viewModeLabels[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}; 