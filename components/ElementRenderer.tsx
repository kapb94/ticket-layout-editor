import React from 'react';
import { TicketElement, TableColumn } from './types';
import { Braces, Table } from 'lucide-react';

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
        className="text-blue-900 hyphens-auto overflow-hidden absolute border-1 border-transparent hover:border-blue-400 cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          fontSize: `${fontSize}px`,
          textAlign: textAlign as any,
          justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          borderColor: isSelected ? '#3B82F6' : 'transparent',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
        <div className="w-full h-full flex items-center px-2 py-1">
        {element.content || (currentJsonData ? "Texto... Usa {{propiedad}} o {{arreglo;propiedad;condición=valor}} o {{propiedad | formateador}} para datos JSON" : "Texto...")}
        {element.content.includes('{{') && (
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded pointer-events-none flex items-center gap-1">
            <Braces size={10} />
            JSON
          </div>
        )}            
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
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
        }}
        onClick={() => onElementClick(element.id)}
        draggable
        onDragStart={(e) => onElementDragStart(e, element.id)}
        onDragEnd={onElementDragEnd}
      >
       <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300 rounded">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 bg-purple-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm8 2h6v6h-6v-6zm2 2v2h2v-2h-2z"/>
                </svg>
              </div>
              <div className="text-xs text-gray-600 font-medium">QR Code</div>
              
            </div>
          </div>
          {element.content.includes('{{') && (
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-1 rounded pointer-events-none flex items-center gap-1">
              <Braces size={10} />
              JSON
            </div>
          )}
        </div>
        
        {/* Controles de redimensionamiento */}
        
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
        <div className="w-full h-full text-center flex items-center px-2 py-1 bg-yellow-50 border border-red-200 rounded">
          <div className="w-full">
            <div className="text-xs font-bold text-red-700">⚡ Fórmula</div>
            <div className="text-[8px] text-red-800 break-words">
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
       <div 
          className="text-xs h-full flex items-center justify-center  font-medium text-green-500"
          style={{ fontSize: `${element.fontSize || 12}px`}}
        >
         <Table className="mr-1 " size={10} /> Tabla: {element.config?.columns?.length || 0} columnas
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
