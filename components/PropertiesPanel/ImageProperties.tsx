import React from 'react';
import { Image } from 'lucide-react';
import { TicketElement } from '../types';

interface ImagePropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageProperties: React.FC<ImagePropertiesProps> = ({
  element,
  updateElement,
  handleImageUpload
}) => {
  return (
    <>
       {element.type === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Seleccionar imagen</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        {element.config?.originalName && (
                          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Archivo: {element.config.originalName}
                          </div>
                        )}
                      </div>
                      
                      {element.config?.base64Data && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Vista previa</label>
                            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                              <img
                                src={element.config.base64Data}
                                alt="Vista previa"
                                className="max-w-full max-h-32 object-contain mx-auto"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Tamaño</label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                                <input
                                  type="number"
                                  value={element.width}
                                  onChange={(e) => updateElement({ width: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  min="10"
                                  max="500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Alto</label>
                                <input
                                  type="number"
                                  value={element.height}
                                  onChange={(e) => updateElement({ height: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  min="10"
                                  max="500"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Ajuste de imagen</label>
                            <select
                              value={element.config?.objectFit || 'contain'}
                              onChange={(e) => updateElement({
                                config: {
                                  ...element.config,
                                  objectFit: e.target.value as 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="contain">Contener (mantener proporción)</option>
                              <option value="cover">Cubrir (cortar si es necesario)</option>
                              <option value="fill">Llenar (estirar)</option>
                              <option value="none">Ninguno (tamaño original)</option>
                              <option value="scale-down">Reducir (si es necesario)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-3 text-sm font-medium mb-2 text-gray-700">
                              <input
                                type="checkbox"
                                checked={element.config?.maintainAspectRatio !== false}
                                onChange={(e) => updateElement({
                                  config: {
                                    ...element.config,
                                    maintainAspectRatio: e.target.checked
                                  }
                                })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              Mantener proporción al redimensionar
                            </label>
                          </div>
                        </>
                      )}

                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Image size={18} className="text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Información de la imagen</span>
                        </div>
                        <div className="text-xs text-orange-700 space-y-1">
                          <div>• Formatos soportados: JPG, PNG, GIF, WebP</div>
                          <div>• Tamaño recomendado: 150-300px</div>
                        </div>
                      </div>
                    </div>
                  )}
    </>
  );
};

export default ImageProperties;
