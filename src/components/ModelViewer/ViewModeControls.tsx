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
    <div className="text-white">
      {title && <div className="text-xs font-medium mb-2">{title}</div>}
      <div className={`grid ${gridColsClass} gap-1`}>
        {availableViewModes.map(mode => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              currentMode === mode 
                ? 'bg-gray-700 text-white' 
                : 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-700/50' 
            }`}
          >
            {viewModeLabels[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}; 