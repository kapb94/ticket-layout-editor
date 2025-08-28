import React from 'react';
import { TicketElement, TableColumn } from './types';

interface ElementRendererProps {
  element: TicketElement;
  isSelected: boolean;
  onElementClick: (elementId: string) => void;
  onElementDragStart: (e: React.DragEvent, elementId: string) => void;
  onElementDragEnd: () => void;
  onResizeStart: (e: React.MouseEvent, elementId: string) => void;
  currentJsonData: any;
  convertWidth: (value: number, unit: string) => number;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onElementClick,
  onElementDragStart,
  onElementDragEnd,
  onResizeStart,
  currentJsonData,
  convertWidth
}) => {
  const renderTextElement = () => {
    const fontSize = element.fontSize || 14;
    const textAlign = element.textAlign || 'left';
    
    return (
      <div
        className="text-black hyphens-auto overflow-hidden absolute border-1 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          fontSize: `${fontSize}px`,
          textAlign: textAlign as any,
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        <div className="w-full h-full flex items-center px-2 py-1">
          {element.content}
        </div>
        
        {/* Controles de redimensionamiento */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize rounded-full -bottom-1 -right-1"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-e-resize rounded-full top-1/2 -right-1 transform -translate-y-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-s-resize rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
          </>
        )}
      </div>
    );
  };

  const renderQRElement = () => {
    return (
      <div
        className="absolute border-2 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
          <div className="text-center text-xs text-gray-600">
            <div className="font-bold mb-1">QR</div>
            <div className="text-xs break-words px-1">
              {element.content.substring(0, 20)}
              {element.content.length > 20 && '...'}
            </div>
          </div>
        </div>
        
        {/* Controles de redimensionamiento */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize rounded-full -bottom-1 -right-1"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-e-resize rounded-full top-1/2 -right-1 transform -translate-y-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-s-resize rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
          </>
        )}
      </div>
    );
  };

  const renderImageElement = () => {
    const hasImage = element.config?.base64Data;
    
    return (
      <div
        className="absolute border-2 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        {hasImage ? (
          <img
            src={element.config.base64Data}
            alt={element.config.originalName || 'Imagen'}
            className="w-full h-full object-contain"
            style={{
              objectFit: element.config.objectFit || 'contain'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
            <div className="text-center text-xs text-gray-600">
              <div className="font-bold mb-1">📷</div>
              <div className="text-xs">Sin imagen</div>
            </div>
          </div>
        )}
        
        {/* Controles de redimensionamiento */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize rounded-full -bottom-1 -right-1"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-e-resize rounded-full top-1/2 -right-1 transform -translate-y-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-s-resize rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
          </>
        )}
      </div>
    );
  };

  const renderFormulaElement = () => {
    const fontSize = element.fontSize || 14;
    const textAlign = element.textAlign || 'left';
    
    return (
      <div
        className="absolute border-2 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          fontSize: `${fontSize}px`,
          textAlign: textAlign as any,
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        <div className="w-full h-full flex items-center px-2 py-1 bg-yellow-50 border border-yellow-200 rounded">
          <div className="w-full">
            <div className="text-xs font-bold text-yellow-700 mb-1">⚡ Fórmula</div>
            <div className="text-xs text-yellow-800 break-words">
              {element.config?.javascriptCode ? 
                element.config.javascriptCode.substring(0, 30) + (element.config.javascriptCode.length > 30 ? '...' : '') :
                'Sin código JavaScript'
              }
            </div>
          </div>
        </div>
        
        {/* Controles de redimensionamiento */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize rounded-full -bottom-1 -right-1"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-e-resize rounded-full top-1/2 -right-1 transform -translate-y-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-s-resize rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
          </>
        )}
      </div>
    );
  };

  const renderTableElement = () => {
    const columns = element.config?.columns || [];
    const rows = element.config?.rows || [];
    
    return (
      <div
        className="absolute border-2 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        <div className="w-full h-full bg-white border border-gray-300 rounded overflow-hidden">
          {/* Encabezados */}
          <div className="bg-gray-100 border-b border-gray-300">
            <div className="flex text-xs font-medium text-gray-700">
              {columns.map((column: TableColumn, index: number) => (
                <div
                  key={index}
                  className="px-2 py-1 border-r border-gray-300 last:border-r-0"
                  style={{ width: `${100 / columns.length}%` }}
                >
                  {column.header}
                </div>
              ))}
            </div>
          </div>
          
          {/* Filas */}
          <div className="text-xs text-gray-800">
            {rows.slice(0, 3).map((row: any, rowIndex: number) => (
              <div key={rowIndex} className="flex border-b border-gray-200 last:border-b-0">
                {columns.map((column: TableColumn, colIndex: number) => (
                  <div
                    key={colIndex}
                    className="px-2 py-1 border-r border-gray-200 last:border-r-0"
                    style={{ width: `${100 / columns.length}%` }}
                  >
                    {row[column.key] || ''}
                  </div>
                ))}
              </div>
            ))}
            {rows.length > 3 && (
              <div className="px-2 py-1 text-center text-gray-500 text-xs">
                +{rows.length - 3} filas más...
              </div>
            )}
          </div>
        </div>
        
        {/* Controles de redimensionamiento */}
        {isSelected && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-se-resize rounded-full -bottom-1 -right-1"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-e-resize rounded-full top-1/2 -right-1 transform -translate-y-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 cursor-s-resize rounded-full -bottom-1 left-1/2 transform -translate-x-1/2"
              onMouseDown={(e) => onResizeStart(e, element.id)}
            />
          </>
        )}
      </div>
    );
  };

  // Renderizar según el tipo de elemento
  switch (element.type) {
    case 'text':
      return renderTextElement();
    case 'qr':
      return renderQRElement();
    case 'image':
      return renderImageElement();
    case 'formula':
      return renderFormulaElement();
    case 'table':
      return renderTableElement();
    default:
      return null;
  }
};

export default ElementRenderer;
