import React from 'react';
import { FileText } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  elementsCount: number;
  ticketWidth: number;
  widthUnit: string;
}

const Header: React.FC<HeaderProps> = ({ projectName, elementsCount, ticketWidth, widthUnit }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{projectName}</h1>
            <p className="text-sm text-gray-500">Editor de Tickets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Elementos: {elementsCount}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">Ancho: {ticketWidth}{widthUnit}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
