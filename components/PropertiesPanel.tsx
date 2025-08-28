import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight, Circle, GripVertical, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic } from 'lucide-react';
import { TicketElement, TableColumn } from './types';
import CodeMirrorEditor from './CodeMirrorEditor';

interface PropertiesPanelProps {
  propertiesWidth: number;
  selectedElement: string | null;
  elements: TicketElement[];
  currentJsonData: any;
  ticketWidth: number;
  widthUnit: string;
  showDebug: boolean;
  onClose: () => void;
  onUpdateElement: (id: string, updates: Partial<TicketElement>) => void;
  onDeleteElement: (id: string) => void;
  convertWidth: (value: number, unit: string) => number;
  generateJsonPaths: (obj: any) => string[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  propertiesWidth,
  selectedElement,
  elements,
  currentJsonData,
  ticketWidth,
  widthUnit,
  showDebug,
  onClose,
  onUpdateElement,
  onDeleteElement,
  convertWidth,
  generateJsonPaths
}) => {
  if (!selectedElement) return null;

  const element = elements.find(el => el.id === selectedElement);
  if (!element) return null;

  const updateElement = (updates: Partial<TicketElement>) => {
    onUpdateElement(selectedElement, updates);
  };

  const updateElementFontSize = (fontSize: number) => {
    updateElement({ fontSize });
  };

  const updateElementTextAlign = (textAlign: 'left' | 'center' | 'right' | 'justify') => {
    updateElement({ textAlign });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          updateElement({
            content: file.name,
            config: {
              ...element.config,
              base64Data,
              originalName: file.name,
              mimeType: file.type
            }
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error al convertir imagen a base64:', error);
        alert('Error al procesar la imagen. Inténtalo de nuevo.');
      }
    }
    // Limpiar el input
    e.target.value = '';
  };

  return (
    <div 
      className="bg-white shadow-lg p-6 border-l border-gray-200 overflow-y-auto max-h-screen properties-panel"
      style={{ width: `${propertiesWidth}px` }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Propiedades</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
          title="Cerrar"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-6 pb-4">
        {/* Posición X/Y */}
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

        {/* Tamaño */}
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

        {/* Información de límites */}
        {showDebug && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 space-y-1">
              <div className="font-medium">Límites del ticket:</div>
              <div>Ancho máximo: {convertWidth(ticketWidth, widthUnit)}px</div>
              <div>Ancho disponible: {convertWidth(ticketWidth, widthUnit) - element.x}px</div>
              <div>Ancho actual: {element.width}px</div>
              {element.width >= convertWidth(ticketWidth, widthUnit) - element.x && (
                <div className="text-red-600 font-medium">⚠️ Elemento en ancho máximo</div>
              )}
            </div>
          </div>
        )}

        {/* Posicionamiento relativo */}
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

        {/* Propiedades específicas según el tipo de elemento */}
        {element.type === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Contenido</label>
              <textarea
                value={element.content}
                onChange={(e) => updateElement({ content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                rows={3}
                placeholder="Texto del elemento..."
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
          </div>
        )}

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
          </div>
        )}

        {element.type === 'image' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Seleccionar imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {element.config?.originalName && (
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
          </div>
        )}

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
          </div>
        )}

        {/* Botón de eliminar */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => onDeleteElement(element.id)}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all duration-200 shadow-sm"
          >
            🗑️ Eliminar Elemento
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
