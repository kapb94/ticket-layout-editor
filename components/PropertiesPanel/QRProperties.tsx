import React from 'react';
import { TicketElement } from '../types';

interface QRPropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  currentJsonData: any;
  generateJsonPaths: (obj: any) => string[];
}

const QRProperties: React.FC<QRPropertiesProps> = ({
  element,
  updateElement,
  currentJsonData,
  generateJsonPaths
}) => {
  return (
    <>
      {element.type === 'qr' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Contenido del QR</label>
                        <textarea
                          value={element.content}
                          onChange={(e) => updateElement({ content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          rows={3}
                          placeholder="URL, texto, o datos para el código QR..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tamaño del QR</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={element.width}
                            onChange={(e) => updateElement({ 
                              width: Number(e.target.value),
                              height: Number(e.target.value) // Mantener cuadrado
                            })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <span className="text-sm text-gray-700 w-12 text-center font-medium">
                            {element.width}px
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Propiedades JSON disponibles</label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const currentContent = element.content;
                              const newContent = currentContent + `{{${e.target.value}}}`;
                              updateElement({ content: newContent });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          defaultValue=""
                        >
                          <option value="">Seleccionar propiedad...</option>
                          {currentJsonData && generateJsonPaths(currentJsonData).map(path => (
                            <option key={path} value={path}>{path}</option>
                          ))}
                        </select>
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm8 2h6v6h-6v-6zm2 2v2h2v-2h-2z"/>
                          </svg>
                          <span className="text-sm font-medium text-purple-800">Información del QR</span>
                        </div>
                        <div className="text-xs text-purple-700 space-y-1">
                          <div>• El código QR se genera automáticamente</div>
                          <div>• Soporta URLs, texto y datos JSON</div>
                          <div>• Tamaño recomendado: 100-150px</div>
                          <div>• Se mantiene cuadrado automáticamente</div>
                        </div>
                      </div>
                    </div>
                  )}
    </>
  );
};

export default QRProperties;
