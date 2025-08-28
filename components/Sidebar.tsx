import React from 'react';
import { 
  Settings, 
  Database, 
  Plus, 
  Keyboard, 
  HelpCircle, 
  FileText, 
  Table, 
  Code, 
  Image,
  Upload,
  Check,
  Info
} from 'lucide-react';

interface SidebarProps {
  sidebarWidth: number;
  ticketWidth: number;
  widthUnit: string;
  hasCustomJson: boolean;
  currentJsonData: any;
  onTicketWidthChange: (width: number) => void;
  onWidthUnitChange: (unit: 'px' | 'in' | 'cm') => void;
  onJsonUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJsonDragOver: (e: React.DragEvent) => void;
  onJsonDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, elementType: string) => void;
  convertWidth: (value: number, unit: string) => number;
  isConverting: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarWidth,
  ticketWidth,
  widthUnit,
  hasCustomJson,
  currentJsonData,
  onTicketWidthChange,
  onWidthUnitChange,
  onJsonUpload,
  onJsonDragOver,
  onJsonDrop,
  onDragStart,
  convertWidth,
  isConverting
}) => {
  return (
    <div 
      className="bg-gradient-to-b from-gray-50 to-white shadow-xl border-r border-gray-200 overflow-y-auto sidebar"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Herramientas</h2>
            <p className="text-xs text-gray-500">Configuración y elementos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Sección 1: Configuración del Ticket */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Configuración del Ticket</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-700">Ancho del ticket:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={ticketWidth}
                  onChange={(e) => onTicketWidthChange(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="50"
                  max="1000"
                />
                <select
                  value={widthUnit}
                  onChange={(e) => onWidthUnitChange(e.target.value as 'px' | 'in' | 'cm')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="px">px</option>
                  <option value="in">pulgadas</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Ancho actual: <span className="font-medium">{convertWidth(ticketWidth, widthUnit).toFixed(0)}px</span>
                {widthUnit !== 'px' && (
                  <span className="text-blue-600 ml-2">
                    ({ticketWidth.toFixed(2)} {widthUnit})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info size={12} />
                Al cambiar la unidad, el valor se convierte automáticamente
              </div>
              {isConverting && (
                <div className="text-xs text-green-600 mt-1 animate-pulse flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-spin"></div>
                  Convirtiendo elementos...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección 2: Datos JSON */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-green-600" />
            <h3 className="text-sm font-semibold text-gray-900">Datos JSON</h3>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={onJsonUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="json-file-input"
              />
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer group"
                onDragOver={onJsonDragOver}
                onDrop={onJsonDrop}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Upload size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                      Seleccionar archivo JSON
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Arrastra aquí o haz clic para buscar
                    </p>
                  </div>
                </div>
              </div>
              
              {hasCustomJson && (
                <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Check size={12} />
                  Archivo JSON cargado correctamente
                </div>
              )}
              
              {currentJsonData && !hasCustomJson && (
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Usando datos de ejemplo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección 3: Elementos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900">Elementos</h3>
          </div>
          
          <div className="space-y-2">
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'text')}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move hover:bg-blue-100 transition-colors text-black font-medium flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Etiqueta de texto</p>
                <p className="text-xs text-gray-500">Texto con formato y variables</p>
              </div>
            </div>
            
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'table')}
              className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move hover:bg-green-100 transition-colors text-black font-medium flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Table size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Tabla</p>
                <p className="text-xs text-gray-500">Datos dinámicos en formato tabla</p>
              </div>
            </div>
            
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'qr')}
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-move hover:bg-purple-100 transition-colors text-black font-medium flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm8 2h6v6h-6v-6zm2 2v2h2v-2h-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Código QR</p>
                <p className="text-xs text-gray-500">Genera códigos QR dinámicos</p>
              </div>
            </div>
            
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'image')}
              className="p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-move hover:bg-orange-100 transition-colors text-black font-medium flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Image size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Imagen</p>
                <p className="text-xs text-gray-500">Imágenes convertidas a base64</p>
              </div>
            </div>
            
            <div
              draggable
              onDragStart={(e) => onDragStart(e, 'formula')}
              className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-move hover:bg-red-100 transition-colors text-black font-medium flex items-center gap-3 group"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Code size={16} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Fórmula JavaScript</p>
                <p className="text-xs text-gray-500">Manipula datos JSON con JavaScript</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Atajos de Teclado */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Keyboard size={16} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-900">Atajos de Teclado</h3>
          </div>
          
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex justify-between items-center">
              <span>Mover elemento:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Flechas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Redimensionar:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Shift + Flechas</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Zoom:</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Shift + Scroll</span>
            </div>
          </div>
        </div>

        {/* Sección 5: Información */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={16} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Instrucciones</h3>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Arrastra elementos al área de diseño</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Haz clic para seleccionar elementos</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Arrastra para mover elementos</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Usa las esquinas para redimensionar</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Haz clic en tablas para configurar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
