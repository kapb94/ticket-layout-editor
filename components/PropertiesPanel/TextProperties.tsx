import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { TicketElement } from '../types';

interface TextPropertiesProps {
  element: TicketElement;
  currentJsonData: any;
  updateElement: (updates: Partial<TicketElement>) => void;
  generateJsonPaths: (obj: any) => string[];
}

const TextProperties: React.FC<TextPropertiesProps> = ({
  element,
  currentJsonData,
  updateElement,
  generateJsonPaths
}) => {
  const updateElementFontSize = (fontSize: number) => {
    updateElement({ fontSize });
  };

  const updateElementTextAlign = (textAlign: 'left' | 'center' | 'right' | 'justify') => {
    updateElement({ textAlign });
  };

  return (
    <>
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
      </>
  );
};

export default TextProperties;
