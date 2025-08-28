import React from 'react';
import { TicketElement } from '../types';

interface SizePropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  ticketWidth: number;
  widthUnit: string;
  convertWidth: (value: number, unit: string) => number;
}

const SizeProperties: React.FC<SizePropertiesProps> = ({
  element,
  updateElement,
  ticketWidth,
  widthUnit,
  convertWidth
}) => {
  return (
    <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Tamaño (píxeles)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                        <input
                          type="number"
                          value={element.width}
                          onChange={(e) => updateElement({ width: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="150"
                          max={convertWidth(ticketWidth, widthUnit) - element.x}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Alto</label>
                        <input
                          type="number"
                          value={element.height}
                          onChange={(e) => updateElement({ height: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
  );
};

export default SizeProperties;
