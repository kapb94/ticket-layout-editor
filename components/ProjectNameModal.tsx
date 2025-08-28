import React from 'react';

interface ProjectNameModalProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ProjectNameModal: React.FC<ProjectNameModalProps> = ({ 
  projectName, 
  onProjectNameChange, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📝 Nombre del Proyecto</h2>
          <p className="text-gray-600">Asigna un nombre a tu proyecto</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="Mi Proyecto de Ticket"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
          />
          <div className="flex space-x-3">
            <button
              onClick={onSubmit}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ✅ Continuar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectNameModal;
