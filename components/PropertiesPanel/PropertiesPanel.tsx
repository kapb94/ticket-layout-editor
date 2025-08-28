import React from 'react';
import { X } from 'lucide-react';
import { TicketElement } from '../types';
import TextProperties from './TextProperties';
import TableProperties from './TableProperties';
import ImageProperties from './ImageProperties';
import QRProperties from './QRProperties';
import FormulaProperties from './FormulaProperties';
import PositionXYProperties from './PositionXYProperties';
import SizeProperties from './SizeProperties';
import RelativePositionProperties from './RelativePositionProperties';

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
  draggedColumnIndex: number | null;
  isDraggingColumn: boolean;
  handleColumnDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleColumnDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleColumnDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleColumnDragEnd: () => void;
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
  generateJsonPaths,
  draggedColumnIndex,
  isDraggingColumn,
  handleColumnDragStart,
  handleColumnDragOver,
  handleColumnDrop,
  handleColumnDragEnd
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
                onClick={() => {
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            
            {(() => {
              const element = elements.find(el => el.id === selectedElement);
              if (!element) return null;
              
              return (
                <div className="space-y-6 pb-4">
                  {/* Posición X/Y */}
                  <PositionXYProperties element={element} updateElement={updateElement} />

                  {/* Tamaño */}
                  <SizeProperties element={element} updateElement={updateElement} ticketWidth={ticketWidth} widthUnit={widthUnit} convertWidth={convertWidth} />

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
                  <RelativePositionProperties element={element} updateElement={updateElement} elements={elements} selectedElement={selectedElement} />

                 <TextProperties element={element} updateElement={updateElement} generateJsonPaths={generateJsonPaths} currentJsonData={currentJsonData} />

                 <TableProperties element={element} updateElement={updateElement} draggedColumnIndex={draggedColumnIndex} isDraggingColumn={isDraggingColumn} handleColumnDragStart={handleColumnDragStart} handleColumnDragOver={handleColumnDragOver} handleColumnDrop={handleColumnDrop} handleColumnDragEnd={handleColumnDragEnd} />

                  <QRProperties element={element} updateElement={updateElement} currentJsonData={currentJsonData} generateJsonPaths={generateJsonPaths} />

                  <ImageProperties element={element} updateElement={updateElement} handleImageUpload={handleImageUpload} />

                  <FormulaProperties element={element} updateElement={updateElement} updateElementFontSize={updateElementFontSize} updateElementTextAlign={updateElementTextAlign} />
                </div>
              );
            })()}
          </div>
  );
};

export default PropertiesPanel;
