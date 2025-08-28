import React from 'react';
import { generateJsonPaths, formatJsonValue } from '../utils';

interface JsonViewerProps {
  currentJsonData: any;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ currentJsonData }) => {
  const generateJsonViewerHTML = () => {
    if (!currentJsonData) return '<p class="text-gray-500">No hay datos JSON disponibles</p>';
    
    const paths = generateJsonPaths(currentJsonData);
    
    let html = `
      <div class="json-viewer">
        <h4 class="font-bold text-black mb-3">Propiedades disponibles:</h4>
        <div class="space-y-2">
    `;
    
    paths.forEach(path => {
      const value = path.split('.').reduce((obj, key) => obj && obj[key], currentJsonData);
      const formattedValue = formatJsonValue(value);
      
      html += `
        <div class="json-path p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-pointer hover:bg-blue-100 transition-colors" 
             onclick="copyToClipboard('${path}', this)"
             title="Haz clic para copiar la ruta">
          <div class="font-mono text-blue-800 font-medium">${path}</div>
          <div class="text-gray-600 mt-1">Valor: ${formattedValue}</div>
        </div>
      `;
    });
    
    html += `
        </div>
        <div class="mt-4 p-3 bg-gray-100 rounded">
          <h5 class="font-bold text-black mb-2">JSON completo:</h5>
          <pre class="text-xs text-gray-700 overflow-auto max-h-40">${JSON.stringify(currentJsonData, null, 2)}</pre>
        </div>
        <div class="mt-3 text-xs text-gray-600">
          💡 <strong>Consejo:</strong> Haz clic en cualquier ruta para copiarla al portapapeles
        </div>
      </div>
    `;
    
    return html;
  };

  return (
    <div className="w-82 bg-white shadow-lg p-4 border-l border-gray-200 overflow-y-auto max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-black">Visor de JSON</h3>
      </div>
      <div 
        className="json-container"
        dangerouslySetInnerHTML={{ __html: generateJsonViewerHTML() }}
      />
    </div>
  );
};

export default JsonViewer;
