import React from 'react';
import { TicketElement } from '../types';

interface PositionXYPropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
}

const PositionXYProperties: React.FC<PositionXYPropertiesProps> = ({
  element,
  updateElement
}) => {
  return (
    <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">
      Posición (píxeles)
    </label>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">X</label>
        <input
          type="number"
          value={element.x}
          onChange={(e) => updateElement({ x: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Y</label>
        <input
          type="number"
          value={element.y}
          onChange={(e) => updateElement({ y: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="0"
        />
      </div>
    </div>
  </div>
  );
};

export default PositionXYProperties;
