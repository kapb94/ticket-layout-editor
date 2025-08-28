import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Circle,
  CornerUpLeft, 
  CornerUpRight, 
  CornerDownLeft, 
  CornerDownRight
} from 'lucide-react';
import { TicketElement } from '../types';

interface RelativePositionPropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  elements: TicketElement[];
  selectedElement: string | null;
}

const RelativePositionProperties: React.FC<RelativePositionPropertiesProps> = ({
  element,
  updateElement,
  elements,
  selectedElement
}) => {
  return (
    <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Posicionamiento relativo
                    </label>
                    <div className="space-y-3">
                      {/* Elemento de referencia */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-2">Relativo a</label>
                        <select
                          value={element.relativeTo || ''}
                          onChange={(e) => updateElement({ 
                            relativeTo: e.target.value || undefined,
                            relativePosition: e.target.value ? (element.relativePosition || 'below') : undefined
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Ninguno (posición absoluta)</option>
                          {elements.filter(el => el.id !== selectedElement).map(el => (
                            <option key={el.id} value={el.id}>
                              {el.type === 'text' ? `Texto: ${el.content.substring(0, 20)}...` : 
                               el.type === 'table' ? `Tabla: ${el.config?.columns?.length || 0} columnas` :
                               el.type === 'qr' ? `QR: ${el.content.substring(0, 20)}...` : 
                               el.type === 'image' ? `Imagen: ${el.config?.originalName || el.content.substring(0, 20)}...` :
                               el.type === 'formula' ? `Fórmula: ${el.config?.javascriptCode?.substring(0, 20) || 'JavaScript'}...` :
                               `${el.type}: ${el.content.substring(0, 20)}...`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Posición relativa - Sistema nuevo */}
                      {element.relativeTo && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Posición Relativa:</label>
                          
                          {/* Selector de modo */}
                          <div className="mb-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateElement({ 
                                  relativePosition: undefined,
                                  relativeVertical: undefined,
                                  relativeHorizontal: undefined
                                })}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                  !element.relativePosition && !element.relativeVertical && !element.relativeHorizontal
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                              >
                                Manual
                              </button>
                              <button
                                onClick={() => updateElement({ 
                                  relativePosition: 'below',
                                  relativeVertical: undefined,
                                  relativeHorizontal: undefined
                                })}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                  element.relativePosition && !element.relativeVertical && !element.relativeHorizontal
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                              >
                                Predefinida
                              </button>
                              <button
                                onClick={() => updateElement({ 
                                  relativePosition: undefined,
                                  relativeVertical: 'bottom',
                                  relativeHorizontal: 'left'
                                })}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                  !element.relativePosition && (element.relativeVertical || element.relativeHorizontal)
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                              >
                                Personalizada
                              </button>
                            </div>
                          </div>

                          {/* Posiciones predefinidas */}
                          {(element.relativePosition && !element.relativeVertical && !element.relativeHorizontal) && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {(['top-left', 'above', 'top-right', 'left', 'center', 'right', 'bottom-left', 'below', 'bottom-right'] as const).map((pos) => (
                                <button
                                  key={pos}
                                  onClick={() => updateElement({ relativePosition: pos })}
                                  className={`p-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                    element.relativePosition === pos 
                                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                  }`}
                                  title={pos.replace('-', ' ')}
                                >
                                  {pos === 'top-left' && <CornerUpLeft size={14} />}
                                  {pos === 'above' && <ArrowUp size={14} />}
                                  {pos === 'top-right' && <CornerUpRight size={14} />}
                                  {pos === 'left' && <ArrowLeft size={14} />}
                                  {pos === 'center' && <Circle size={14} />}
                                  {pos === 'right' && <ArrowRight size={14} />}
                                  {pos === 'bottom-left' && <CornerDownLeft size={14} />}
                                  {pos === 'below' && <ArrowDown size={14} />}
                                  {pos === 'bottom-right' && <CornerDownRight size={14} />}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Posiciones personalizadas */}
                          {(!element.relativePosition && (element.relativeVertical || element.relativeHorizontal)) && (
                            <div className="space-y-3">
                              {/* Posición vertical */}
                              <div>
                                <label className="block text-xs text-gray-500 mb-2">Vertical</label>
                                <div className="flex gap-2">
                                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                                    <button
                                      key={pos}
                                      onClick={() => updateElement({ relativeVertical: pos })}
                                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                        element.relativeVertical === pos 
                                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                      }`}
                                    >
                                      {pos === 'top' && <ArrowUp size={14} />}
                                      {pos === 'center' && <Circle size={14} />}
                                      {pos === 'bottom' && <ArrowDown size={14} />}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Posición horizontal */}
                              <div>
                                <label className="block text-xs text-gray-500 mb-2">Horizontal</label>
                                <div className="flex gap-2">
                                  {(['left', 'center', 'right'] as const).map((pos) => (
                                    <button
                                      key={pos}
                                      onClick={() => updateElement({ relativeHorizontal: pos })}
                                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                        element.relativeHorizontal === pos 
                                          ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                      }`}
                                    >
                                      {pos === 'left' && <ArrowLeft size={14} />}
                                      {pos === 'center' && <Circle size={14} />}
                                      {pos === 'right' && <ArrowRight size={14} />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Offset */}
                      {element.relativeTo && (element.relativePosition || element.relativeVertical || element.relativeHorizontal) && (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">Offset (px)</label>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">X</label>
                              <input
                                type="number"
                                value={element.relativeOffset?.x || 0}
                                onChange={(e) => updateElement({ 
                                  relativeOffset: { 
                                    x: Number(e.target.value), 
                                    y: element.relativeOffset?.y || 0 
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Y</label>
                              <input
                                type="number"
                                value={element.relativeOffset?.y || 0}
                                onChange={(e) => updateElement({ 
                                  relativeOffset: { 
                                    x: element.relativeOffset?.x || 0, 
                                    y: Number(e.target.value) 
                                  } 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
  );
};

export default RelativePositionProperties;
