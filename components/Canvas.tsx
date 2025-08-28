import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TicketElement } from './types';
import ElementRenderer from './ElementRenderer';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  ticketWidth: number;
  widthUnit: string;
  zoomLevel: number;
  showDebug: boolean;
  elements: TicketElement[];
  selectedElement: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  convertWidth: (value: number, unit: string) => number;
  calculateContentHeight: () => number;
  handleElementClick: (elementId: string) => void;
  handleElementDragStart: (e: React.DragEvent, elementId: string) => void;
  handleElementDragEnd: () => void;
  handleResizeStart: (e: React.MouseEvent, elementId: string) => void;
  deleteElement: (id: string) => void;
  currentJsonData: any;
}

const Canvas: React.FC<CanvasProps> = ({
  canvasRef,
  ticketWidth,
  widthUnit,
  zoomLevel,
  showDebug,
  elements,
  selectedElement,
  onDragOver,
  onDrop,
  onClick,
  onWheel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  convertWidth,
  calculateContentHeight,
  handleElementClick,
  handleElementDragStart,
  handleElementDragEnd,
  handleResizeStart,
  deleteElement,
  currentJsonData
}) => {
  const renderElement = (element: TicketElement) => {
    return (
      <ElementRenderer
        key={element.id}
        element={element}
        isSelected={selectedElement === element.id}
        onElementClick={handleElementClick}
        onElementDragStart={handleElementDragStart}
        onElementDragEnd={handleElementDragEnd}
        onResizeStart={handleResizeStart}
        currentJsonData={currentJsonData}
        convertWidth={convertWidth}
      />
    );
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">Área de Diseño</h2>
          
          {/* Controles de zoom */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={onZoomOut}
              className="px-2 py-1 bg-white rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              title="Zoom Out (Shift + Scroll)"
            >
              <ZoomOut size={16} className="!text-gray-700" />
            </button>
            <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              className="px-2 py-1 bg-white rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              title="Zoom In (Shift + Scroll)"
            >
              <ZoomIn size={16} className="!text-gray-700" />
            </button>
            <button
              onClick={onZoomReset}
              className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
              title="Reset Zoom"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        
        <div onWheel={onWheel} className="overflow-auto border border-gray-200 rounded" style={{ height: 'calc(100vh - 200px)' }}>
          <div
            ref={canvasRef}
            className="border-2 border-dashed border-gray-300 bg-gray-50 relative"
            style={{ 
              width: `${convertWidth(ticketWidth, widthUnit)}px`,
              minHeight: '1200px',
              margin: '20px auto',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center'
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={onClick}
          >
            {/* Debug overlay - mostrar información de límites */}
            {showDebug && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded pointer-events-none z-10">
                <div>Ticket Width: {ticketWidth} {widthUnit} ({convertWidth(ticketWidth, widthUnit)}px)</div>
                <div>Canvas Width: {convertWidth(ticketWidth, widthUnit)}px</div>
                {selectedElement && (
                  <div>
                    Selected: {selectedElement}
                    <br />
                    X: {elements.find(el => el.id === selectedElement)?.x}px
                    <br />
                    Width: {elements.find(el => el.id === selectedElement)?.width}px
                    <br />
                    Max Width: {convertWidth(ticketWidth, widthUnit) - (elements.find(el => el.id === selectedElement)?.x || 0)}px
                  </div>
                )}
              </div>
            )}
            
            {/* Línea de límite derecho del ticket */}
            {showDebug && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-red-500 opacity-50 pointer-events-none"
                style={{ 
                  left: `${convertWidth(ticketWidth, widthUnit)}px`,
                  zIndex: 5
                }}
              />
            )}
            
            {elements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
