import React from 'react';
import { Check } from 'lucide-react';

interface ImportedProjectInfo {
  name: string;
  version: string;
  elements: number;
  createdAt: string;
  updatedAt: string;
}

interface ImportSuccessModalProps {
  importedProjectInfo: ImportedProjectInfo;
  onClose: () => void;
}

const ImportSuccessModal: React.FC<ImportSuccessModalProps> = ({ importedProjectInfo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Proyecto Cargado!</h2>
          <p className="text-gray-600">El proyecto se ha importado correctamente</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Nombre:</span>
              <span className="text-sm text-gray-900 font-semibold">{importedProjectInfo.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Versión:</span>
              <span className="text-sm text-gray-900">{importedProjectInfo.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Elementos:</span>
              <span className="text-sm text-gray-900 font-semibold">{importedProjectInfo.elements}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Creado:</span>
              <span className="text-sm text-gray-900">{new Date(importedProjectInfo.createdAt).toLocaleString()}</span>
            </div>
            {importedProjectInfo.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Actualizado:</span>
                <span className="text-sm text-gray-900">{new Date(importedProjectInfo.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ¡Perfecto!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSuccessModal;
