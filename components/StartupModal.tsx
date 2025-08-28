import React from 'react';
import { BookOpen, FolderOpen } from 'lucide-react';

interface StartupModalProps {
  onNewProject: () => void;
  onLoadProject: () => void;
}

const StartupModal: React.FC<StartupModalProps> = ({ onNewProject, onLoadProject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Editor de Tickets</h1>
          <p className="text-gray-600">Crea y personaliza tickets con datos dinámicos</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onNewProject}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
          >
            <BookOpen size={24} />
            Nuevo Proyecto
          </button>
          
          <button
            onClick={onLoadProject}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center gap-3"
          >
            <FolderOpen size={24} />
            Cargar Proyecto
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Consejo:</strong> Puedes crear tickets con texto, tablas, códigos QR, imágenes y fórmulas JavaScript
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartupModal;
