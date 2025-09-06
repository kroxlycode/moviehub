import React from 'react';
import { Grid, List } from 'lucide-react';

interface LayoutToggleProps {
  layout: 'grid' | 'horizontal';
  onLayoutChange: (layout: 'grid' | 'horizontal') => void;
}

const LayoutToggle: React.FC<LayoutToggleProps> = ({ layout, onLayoutChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
      <button
        onClick={() => onLayoutChange('grid')}
        className={`p-2 rounded-md transition-all duration-200 ${
          layout === 'grid'
            ? 'bg-secondary text-dark shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
        title="Grid görünümü"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onLayoutChange('horizontal')}
        className={`p-2 rounded-md transition-all duration-200 ${
          layout === 'horizontal'
            ? 'bg-secondary text-dark shadow-md'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
        title="Yatay kaydırma görünümü"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LayoutToggle;
