import React from 'react';
import { 
  Eye, 
  Save, 
  Trash2, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw, 
  FileText, 
  Table, 
  Code, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft,
  ArrowRight,
  X, 
  Move, 
  Maximize2, 
  Minus, 
  Plus,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Type,
  Database,
  Braces,
  Hash,
  Keyboard,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Circle,
  FolderOpen,
  RefreshCw,
  ClipboardList,
  Bug,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Ruler,
  Layers,
  Image
} from 'lucide-react';

interface ToolbarProps {
  sidebarHidden: boolean;
  showPreview: boolean;
  showJsonViewer: boolean;
  showDebug: boolean;
  showSizeMenu: boolean;
  showElementsMenu: boolean;
  showInfoMenu: boolean;
  onToggleSidebar: () => void;
  onTogglePreview: () => void;
  onToggleJsonViewer: () => void;
  onToggleDebug: () => void;
  onToggleSizeMenu: () => void;
  onToggleElementsMenu: () => void;
  onToggleInfoMenu: () => void;
  onGenerateHTML: () => void;
  onClearCanvas: () => void;
  onGenerateExample: () => void;
  onExportProject: () => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeProjectName: () => void;
  onDragStart: (e: React.DragEvent, elementType: string) => void;
  ticketWidth: number;
  widthUnit: string;
  onTicketWidthChange: (width: number) => void;
  onWidthUnitChange: (unit: 'px' | 'in' | 'cm') => void;
  convertWidth: (value: number, unit: string) => number;
}

const Toolbar: React.FC<ToolbarProps> = ({
  sidebarHidden,
  showPreview,
  showJsonViewer,
  showDebug,
  showSizeMenu,
  showElementsMenu,
  showInfoMenu,
  onToggleSidebar,
  onTogglePreview,
  onToggleJsonViewer,
  onToggleDebug,
  onToggleSizeMenu,
  onToggleElementsMenu,
  onToggleInfoMenu,
  onGenerateHTML,
  onClearCanvas,
  onGenerateExample,
  onExportProject,
  onImportProject,
  onChangeProjectName,
  onDragStart,
  ticketWidth,
  widthUnit,
  onTicketWidthChange,
  onWidthUnitChange,
  convertWidth
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg border border-gray-200 p-3">
      <div className="flex items-center space-x-2">
        {/* Botón para ocultar/mostrar sidebar */}
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded text-lg transition-colors relative group ${
            sidebarHidden 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {sidebarHidden ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {sidebarHidden ? 'Mostrar Sidebar' : 'Ocultar Sidebar'}
          </div>
        </button>
        
        <button
          onClick={onTogglePreview}
          className={`p-2 rounded text-lg transition-colors relative group ${
            showPreview 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <Eye size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
          </div>
        </button>

        <button
          onClick={onToggleJsonViewer}
          className={`p-2 rounded text-lg relative group transition-colors flex items-center justify-center ${
            showJsonViewer 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <Braces size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {showJsonViewer ? 'Ocultar JSON' : 'Mostrar JSON'}
          </div>
        </button>

        <button
          onClick={onGenerateHTML}
          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 text-lg relative group"
        >
          <Save size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Generar Plantilla HTML
          </div>
        </button>
        
        <button
          onClick={onClearCanvas}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 text-lg relative group"
        >
          <Trash2 size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Limpiar Todo
          </div>
        </button>
        
        <button
          onClick={onGenerateExample}
          className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-lg relative group"
        >
          <BookOpen size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ejemplo de uso
          </div>
        </button>
        
        {/* Exportar/Importar Configuración */}
        <button
          onClick={onExportProject}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg relative group"
        >
          <Download size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Exportar Proyecto
          </div>
        </button>
        
        <div className="relative group">
          <input
            type="file"
            accept=".json"
            onChange={onImportProject}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <button
            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-lg flex items-center justify-center"
          >
            <FolderOpen size={20} />
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Importar Proyecto
          </div>
        </div>
        
        <button
          onClick={onChangeProjectName}
          className="p-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-lg relative group"
        >
          <Type size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Cambiar Nombre del Proyecto
          </div>
        </button>
        
        {/* Opciones adicionales cuando la sidebar está oculta */}
        {sidebarHidden && (
          <>
            {/* Opción 1: Cambiar tamaño de página */}
            <div className="relative group toolbar-submenu">
              <button
                onClick={onToggleSizeMenu}
                className="p-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-lg relative group"
              >
                <Ruler size={20} />
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity whitespace-nowrap pointer-events-none ${showSizeMenu ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  Cambiar Tamaño de Página
                </div>
              </button>
              
              {/* Submenú de tamaños */}
              {showSizeMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] toolbar-submenu">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Ancho del ticket:</div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      value={ticketWidth}
                      onChange={(e) => onTicketWidthChange(Number(e.target.value))}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                      min="50"
                      max="1000"
                    />
                    <select
                      value={widthUnit}
                      onChange={(e) => onWidthUnitChange(e.target.value as 'px' | 'in' | 'cm')}
                      className="px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="px">px</option>
                      <option value="in">pulgadas</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                  <div className="text-xs text-gray-600">
                    Ancho actual: <span className="font-medium">{convertWidth(ticketWidth, widthUnit).toFixed(0)}px</span>
                  </div>
                  <button
                    onClick={onToggleSizeMenu}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Opción 2: Lista de elementos */}
            <div className="relative group toolbar-submenu">
              <button
                onClick={onToggleElementsMenu}
                className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-lg relative group"
              >
                <Layers size={20} />
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity whitespace-nowrap pointer-events-none ${showElementsMenu ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  Elementos Disponibles
                </div>
              </button>
              
              {/* Submenú de elementos */}
              {showElementsMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[250px] toolbar-submenu">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Arrastra elementos al área de diseño:</div>
                  <div className="space-y-2">
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'text')}
                      className="p-2 bg-blue-50 border border-blue-200 rounded cursor-move hover:bg-blue-100 transition-colors text-black text-xs flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                        <FileText size={12} className="text-blue-600" />
                      </div>
                      <span className="font-medium">Etiqueta de texto</span>
                    </div>
                    
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'table')}
                      className="p-2 bg-green-50 border border-green-200 rounded cursor-move hover:bg-green-100 transition-colors text-black text-xs flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                        <Table size={12} className="text-green-600" />
                      </div>
                      <span className="font-medium">Tabla</span>
                    </div>
                    
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'qr')}
                      className="p-2 bg-purple-50 border border-purple-200 rounded cursor-move hover:bg-purple-100 transition-colors text-black text-xs flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 11h6v6H3v-6zm2 2v2h2v-2H5zm8 2h6v6h-6v-6zm2 2v2h2v-2h-2z"/>
                        </svg>
                      </div>
                      <span className="font-medium">Código QR</span>
                    </div>
                    
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'image')}
                      className="p-2 bg-orange-50 border border-orange-200 rounded cursor-move hover:bg-orange-100 transition-colors text-black text-xs flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                        <Image size={12} className="text-orange-600" />
                      </div>
                      <span className="font-medium">Imagen</span>
                    </div>
                    
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, 'formula')}
                      className="p-2 bg-red-50 border border-red-200 rounded cursor-move hover:bg-red-100 transition-colors text-black text-xs flex items-center gap-2"
                    >
                      <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                        <Code size={12} className="text-red-600" />
                      </div>
                      <span className="font-medium">Fórmula JavaScript</span>
                    </div>
                  </div>
                  <button
                    onClick={onToggleElementsMenu}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Opción 3: Información */}
            <div className="relative group toolbar-submenu">
              <button
                onClick={onToggleInfoMenu}
                className="p-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-lg relative group"
              >
                <Info size={20} />
                <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity whitespace-nowrap pointer-events-none ${showInfoMenu ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                  Información
                </div>
              </button>
              
              {/* Submenú de información */}
              {showInfoMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px] toolbar-submenu">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Instrucciones:</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Arrastra elementos al área de diseño</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Haz clic para seleccionar elementos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Arrastra para mover elementos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Usa las esquinas para redimensionar</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Haz clic en tablas para configurar</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Atajos de Teclado:</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Mover elemento:</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">Flechas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Redimensionar:</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">Shift + Flechas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zoom:</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">Shift + Scroll</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onToggleInfoMenu}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        
        <button
          onClick={onToggleDebug}
          className={`p-2 rounded text-lg relative group transition-colors flex items-center justify-center ${
            showDebug 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          <Bug size={20} />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {showDebug ? 'Ocultar Debugging' : 'Mostrar Debugging'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
