import React from 'react';

interface PreviewPanelProps {
  previewHTML: string;
  ticketWidth: number;
  widthUnit: string;
  elementsCount: number;
  convertWidth: (value: number, unit: string) => number;
  calculateContentHeight: () => number;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewHTML,
  ticketWidth,
  widthUnit,
  elementsCount,
  convertWidth,
  calculateContentHeight
}) => {
  return (
    <div className="w-96 bg-white shadow-lg p-4 border-l border-gray-200 overflow-y-auto max-h-screen">
      <h3 className="text-lg font-bold mb-4 text-black">Vista Previa</h3>
      <div className="mb-4 text-sm text-black">
        <p>Vista previa del ticket final:</p>
        <div className="mt-2 text-xs text-gray-600">
          <p>Dimensiones: {convertWidth(ticketWidth, widthUnit)}px × {calculateContentHeight()}px</p>
          <p>Elementos: {elementsCount}</p>
        </div>
      </div>
      <div className="flex justify-center items-center border border-gray-300 rounded p-2 bg-gray-50">
        <iframe
          srcDoc={previewHTML}
          className="w-full"
          style={{ 
            height: `${Math.min(calculateContentHeight() + 100, 600)}px`,
            border: 'none',
            backgroundColor: 'white'
          }}
          title="Vista previa del ticket"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
