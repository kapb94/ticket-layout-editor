import React from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Code 
} from 'lucide-react';
import { TicketElement } from '../types';
import CodeMirrorEditor from '../CodeMirrorEditor';

interface FormulaPropertiesProps {
  element: TicketElement;
  updateElement: (updates: Partial<TicketElement>) => void;
  updateElementFontSize: (fontSize: number) => void;
  updateElementTextAlign: (textAlign: 'left' | 'center' | 'right' | 'justify') => void;
}

const FormulaProperties: React.FC<FormulaPropertiesProps> = ({
  element,
  updateElement,
  updateElementFontSize,
  updateElementTextAlign
}) => {
  return (
    <>
       {element.type === 'formula' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Código JavaScript</label>
                        <CodeMirrorEditor
                          value={element.config?.javascriptCode || ''}
                          onChange={(value) => updateElement({ 
                            config: { 
                              ...element.config, 
                              javascriptCode: value 
                            } 
                          })}
                          placeholder="// Ejemplo:&#10;const total = data.venta.items.reduce((sum, item) => sum + item.precio, 0);&#10;return total.toFixed(2);"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Formato de salida</label>
                        <select
                          value={element.config?.outputFormat || 'text'}
                          onChange={(e) => updateElement({ 
                            config: { 
                              ...element.config, 
                              outputFormat: e.target.value as 'text' | 'number' | 'boolean' | 'json'
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="boolean">Booleano</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Manejo de errores</label>
                        <select
                          value={element.config?.errorHandling || 'show-default'}
                          onChange={(e) => updateElement({ 
                            config: { 
                              ...element.config, 
                              errorHandling: e.target.value as 'show-error' | 'hide-error' | 'show-default'
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="show-error">Mostrar error</option>
                          <option value="hide-error">Ocultar error</option>
                          <option value="show-default">Mostrar valor por defecto</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Valor por defecto</label>
                        <input
                          type="text"
                          value={element.config?.defaultValue || ''}
                          onChange={(e) => updateElement({ 
                            config: { 
                              ...element.config, 
                              defaultValue: e.target.value 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Valor a mostrar si hay error"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Timeout (ms)</label>
                        <input
                          type="number"
                          value={element.config?.timeout || 5000}
                          onChange={(e) => updateElement({ 
                            config: { 
                              ...element.config, 
                              timeout: Number(e.target.value) 
                            } 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          min="1000"
                          max="30000"
                          step="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Tamaño de fuente</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="8"
                            max="32"
                            value={element.fontSize || 14}
                            onChange={(e) => updateElementFontSize(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <span className="text-sm text-gray-700 w-12 text-center font-medium">
                            {element.fontSize || 14}px
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Alineación</label>
                        <div className="flex gap-2">
                          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => updateElementTextAlign(align)}
                              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                element.textAlign === align 
                                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                              title={`Alinear ${align === 'left' ? 'izquierda' : align === 'center' ? 'centro' : align === 'right' ? 'derecha' : 'justificar'}`}
                            >
                              {align === 'left' ? <AlignLeft size={16} /> : align === 'center' ? <AlignCenter size={16} /> : align === 'right' ? <AlignRight size={16} /> : <AlignJustify size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Code size={18} className="text-red-600" />
                          <span className="text-sm font-medium text-red-800">Información de la fórmula</span>
                        </div>
                        <div className="text-xs text-red-700 space-y-1">
                          <div>• Usa JavaScript básico para manipular datos JSON</div>
                          <div>• Variable <code className="bg-red-100 px-1 rounded">data</code> contiene el JSON cargado</div>
                          <div>• Debes usar <code className="bg-red-100 px-1 rounded">return</code> para devolver el resultado</div>
                          <div>• Ejecución segura con timeout configurable</div>
                          <div>• Soporta operaciones matemáticas, strings y arrays</div>
                        </div>
                      </div>
                    </div>
                  )}
    </>
  );
};

export default FormulaProperties;
