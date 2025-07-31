import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

interface TicketElement {
  id: string;
  type: 'text' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  config?: any;
  relativeTo?: string; // ID del elemento al que está relacionado
  relativePosition?: 'below' | 'above' | 'left' | 'right' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  relativeOffset?: { x: number; y: number }; // Offset desde la posición relativa
}

interface TableColumn {
  header: string;
  property: string;
  textAlign?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  // Nuevas propiedades para formateo avanzado
  format?: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'datetime' | 'uppercase' | 'lowercase' | 'capitalize' | 'custom';
  formatOptions?: {
    // Para moneda
    currency?: 'USD' | 'MXN' | 'EUR';
    // Para números
    decimals?: number;
    thousandsSeparator?: boolean;
    // Para fechas
    dateFormat?: string;
    // Para valores personalizados
    customFormat?: string;
    // Para valores por defecto
    defaultValue?: string;
    // Para transformaciones
    transform?: 'truncate' | 'wrap' | 'ellipsis';
    maxLength?: number;
  };
}

interface TableConfig {
  dataPath: string;
  columns: TableColumn[];
  fontSize?: number;
  showBorders?: boolean;
  showHeader?: boolean;
  showHeaderBackground?: boolean;
}

// Interfaz para la configuración completa del proyecto
interface ProjectConfig {
  version: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ticketWidth: number;
  widthUnit: 'px' | 'in' | 'cm';
  elements: TicketElement[];
  jsonData?: any;
}

export default function TicketEditor() {
  const [ticketWidth, setTicketWidth] = useState(300);
  const [widthUnit, setWidthUnit] = useState<'px' | 'in' | 'cm'>('px');
  const [elements, setElements] = useState<TicketElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showProperties, setShowProperties] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [relativeMode, setRelativeMode] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Datos JSON por defecto (hardcodeados)
  const defaultJsonData = {
    "empresa": {
      "nombre": "Mi Empresa S.A.",
      "direccion": "Calle Principal 123",
      "telefono": "(555) 123-4567",
      "email": "info@miempresa.com",
      "rfc": "ABC123456789"
    },
    "venta": {
      "numero": "TICK-2024-001",
      "fecha": "2024-01-15",
      "hora": "14:30:25",
      "total": 1250.75,
      "subtotal": 1087.61,
      "iva": 163.14,
      "metodoPago": "Tarjeta de Crédito",
      "cajero": "Juan Pérez"
    },
    "productos": {
      "items": [
        {
          "codigo": "PROD001",
          "nombre": "Laptop HP Pavilion",
          "descripcion": "Laptop 15.6\" Intel i5 8GB RAM",
          "precio": 899.99,
          "cantidad": 1,
          "subtotal": 899.99,
          "categoria": "Electrónicos"
        },
        {
          "codigo": "PROD002",
          "nombre": "Mouse Inalámbrico",
          "descripcion": "Mouse óptico inalámbrico USB",
          "precio": 25.50,
          "cantidad": 2,
          "subtotal": 51.00,
          "categoria": "Accesorios"
        },
        {
          "codigo": "PROD003",
          "nombre": "Teclado Mecánico",
          "descripcion": "Teclado mecánico RGB switches blue",
          "precio": 89.99,
          "cantidad": 1,
          "subtotal": 89.99,
          "categoria": "Accesorios"
        },
        {
          "codigo": "PROD004",
          "nombre": "Monitor 24\"",
          "descripcion": "Monitor LED 24 pulgadas Full HD",
          "precio": 199.99,
          "cantidad": 1,
          "subtotal": 199.99,
          "categoria": "Monitores"
        }
      ],
      "totalItems": 5
    },
    "empleado": {
      "nombre": "María González",
      "id": "EMP001",
      "departamento": "Ventas",
      "puesto": "Vendedor Senior"
    },
    "cliente": {
      "nombre": "Carlos Rodríguez",
      "email": "carlos.rodriguez@email.com",
      "telefono": "(555) 987-6543",
      "direccion": "Av. Reforma 456, Col. Centro"
    },
    "configuracion": {
      "moneda": "MXN",
      "impresora": "EPSON TM-T88VI",
      "version": "1.0.0"
    }
  };

  // Usar datos cargados o datos por defecto
  const currentJsonData = jsonData || defaultJsonData;

  // Actualizar posiciones relativas cuando cambien los elementos
  useEffect(() => {
    updateRelativePositions();
  }, [elements.length]); // Se ejecuta cuando cambia el número de elementos

  // Manejar movimiento y redimensionado con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;

      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      let newX = element.x;
      let newY = element.y;
      let newWidth = element.width;
      let newHeight = element.height;
      const step = e.shiftKey ? 20 : 5; // Shift + flecha = movimiento más rápido

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + flecha izquierda = reducir ancho
            newWidth = Math.max(30, element.width - step);
          } else {
            // Solo flecha izquierda = mover a la izquierda
            newX -= step;
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + flecha derecha = aumentar ancho
            newWidth = Math.min(800, element.width + step);
          } else {
            // Solo flecha derecha = mover a la derecha
            newX += step;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + flecha arriba = reducir altura
            newHeight = Math.max(30, element.height - step);
          } else {
            // Solo flecha arriba = mover hacia arriba
            newY -= step;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (e.shiftKey) {
            // Shift + flecha abajo = aumentar altura
            newHeight = Math.min(600, element.height + step);
          } else {
            // Solo flecha abajo = mover hacia abajo
            newY += step;
          }
          break;
        default:
          return;
      }

      // Mantener el elemento dentro de los límites del canvas
      const canvasWidth = convertWidth(ticketWidth, widthUnit);
      const canvasHeight = 600;
      const maxX = canvasWidth - newWidth;
      const maxY = canvasHeight - newHeight;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      // Actualizar el elemento con los nuevos valores
      const updates: Partial<TicketElement> = { x: newX, y: newY };
      if (e.shiftKey) {
        updates.width = newWidth;
        updates.height = newHeight;
      }

      updateElement(selectedElement, updates);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, ticketWidth, widthUnit]);

  // Convertir unidades
  const convertWidth = (value: number, unit: string) => {
    switch (unit) {
      case 'in':
        return value * 96; // 1 inch = 96px
      case 'cm':
        return value * 37.795; // 1 cm = 37.795px
      default:
        return value;
    }
  };

  // Convertir de px a otra unidad
  const convertFromPx = (pxValue: number, targetUnit: string) => {
    switch (targetUnit) {
      case 'in':
        return pxValue / 96; // 1 inch = 96px
      case 'cm':
        return pxValue / 37.795; // 1 cm = 37.795px
      default:
        return pxValue;
    }
  };

  // Convertir entre unidades
  const convertBetweenUnits = (value: number, fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return value;
    
    // Primero convertir a px
    const pxValue = convertWidth(value, fromUnit);
    // Luego convertir a la unidad objetivo
    return convertFromPx(pxValue, toUnit);
  };

  // Manejar cambio de unidad con conversión automática
  const handleUnitChange = (newUnit: 'px' | 'in' | 'cm') => {
    if (newUnit === widthUnit) return; // No hacer nada si es la misma unidad
    
    setIsConverting(true);
    
    // Convertir el ancho actual a la nueva unidad
    const convertedWidth = convertBetweenUnits(ticketWidth, widthUnit, newUnit);
    
    // Convertir posiciones y tamaños de elementos
    convertElementPositions(widthUnit, newUnit);
    
    // Actualizar el estado
    setWidthUnit(newUnit);
    setTicketWidth(convertedWidth);
    
    console.log(`Conversión completa: ${ticketWidth}${widthUnit} → ${convertedWidth.toFixed(2)}${newUnit}`);
    
    // Ocultar el indicador de conversión después de un momento
    setTimeout(() => setIsConverting(false), 2000);
  };

  // Convertir posiciones y tamaños de elementos cuando se cambie la unidad
  const convertElementPositions = (fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return;
    
    const updatedElements = elements.map(element => {
      // Convertir posiciones X e Y
      const convertedX = convertBetweenUnits(element.x, fromUnit, toUnit);
      const convertedY = convertBetweenUnits(element.y, fromUnit, toUnit);
      
      // Convertir ancho y alto
      const convertedWidth = convertBetweenUnits(element.width, fromUnit, toUnit);
      const convertedHeight = convertBetweenUnits(element.height, fromUnit, toUnit);
      
      // Convertir offset relativo si existe
      let convertedRelativeOffset = element.relativeOffset;
      if (element.relativeOffset) {
        convertedRelativeOffset = {
          x: convertBetweenUnits(element.relativeOffset.x, fromUnit, toUnit),
          y: convertBetweenUnits(element.relativeOffset.y, fromUnit, toUnit)
        };
      }
      
      return {
        ...element,
        x: convertedX,
        y: convertedY,
        width: convertedWidth,
        height: convertedHeight,
        relativeOffset: convertedRelativeOffset
      };
    });
    
    setElements(updatedElements);
    console.log(`Elementos convertidos de ${fromUnit} a ${toUnit}`);
  };

  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    setDraggedElement(elementType);
    e.dataTransfer.setData('text/plain', `new-${elementType}`);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain');
    
    if (elementType.startsWith('new-')) {
      const type = elementType.replace('new-', '') as 'text' | 'table';
      const rect = canvasRef.current?.getBoundingClientRect();
      
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Si está en modo relativo y hay elementos, posicionar relativamente al último
        let relativeConfig = {};
        if (relativeMode && elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          relativeConfig = {
            relativeTo: lastElement.id,
            relativePosition: 'below' as const,
            relativeOffset: { x: 0, y: 10 }
          };
        }
        
        const newElement: TicketElement = {
          id: `element-${Date.now()}`,
          type,
          x: relativeMode && elements.length > 0 ? 0 : x, // En modo relativo, la posición se calcula automáticamente
          y: relativeMode && elements.length > 0 ? 0 : y,
          width: type === 'text' ? 150 : 200,
          height: type === 'text' ? 30 : 100,
          content: type === 'text' ? 'Texto de ejemplo' : '',
          fontSize: type === 'text' ? 14 : 12,
          textAlign: type === 'text' ? 'left' : undefined,
          config: type === 'table' ? {
            dataPath: '',
            columns: [],
            fontSize: 12,
            showBorders: true,
            showHeader: true
          } : undefined,
          ...relativeConfig
        };
        
        setElements([...elements, newElement]);
      }
    } else if (elementType.startsWith('move-')) {
      const elementId = elementType.replace('move-', '');
      const rect = canvasRef.current?.getBoundingClientRect();
      
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Mantener el elemento dentro de los límites del canvas
        const maxX = rect.width - 50;
        const maxY = rect.height - 50;
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));
        
        updateElement(elementId, { x: constrainedX, y: constrainedY });
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Solo deseleccionar si se hace clic directamente en el canvas (no en un elemento)
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
      setShowProperties(false);
    }
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    setShowProperties(true);
    const element = elements.find(el => el.id === elementId);
    if (element?.type === 'table') {
      // setTableConfig(element.config || { dataPath: '', columns: [], fontSize: 12 }); // Eliminado
      // setShowTableConfig(true); // Eliminado
    }
  };

  const handleElementDragStart = (e: React.DragEvent, elementId: string) => {
    setIsDragging(true);
    setSelectedElement(elementId);
    e.dataTransfer.setData('text/plain', `move-${elementId}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleElementDragEnd = () => {
    setIsDragging(false);
  };

  const handleElementDrag = (e: React.DragEvent, elementId: string) => {
    if (!canvasRef.current || !isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Limitar la posición dentro del área de diseño
    const maxX = rect.width - element.width;
    const maxY = rect.height - element.height;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    updateElement(elementId, { x, y });
  };

  const handleResizeStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setSelectedElement(elementId);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height
      });
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !selectedElement || !canvasRef.current) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = Math.max(50, resizeStart.width + deltaX);
    let newHeight = Math.max(30, resizeStart.height + deltaY);

    // Limitar el tamaño máximo al área de diseño
    const maxWidth = rect.width - element.x;
    const maxHeight = rect.height - element.y;
    
    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    updateElement(selectedElement, { width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, selectedElement, resizeStart]);

  // Actualizar vista previa cuando cambien los elementos o el JSON
  useEffect(() => {
    if (showPreview) {
      // Forzar re-render de la vista previa
      const previewContainer = document.querySelector('[data-preview]');
      if (previewContainer) {
        previewContainer.innerHTML = generatePreviewHTML();
      }
    }
  }, [elements, currentJsonData, ticketWidth, widthUnit, showPreview]);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setJsonData(data);
        } catch (error) {
          alert('Error al cargar el archivo JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateElement = (id: string, updates: Partial<TicketElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const updateElementFontSize = (elementId: string, fontSize: number) => {
    updateElement(elementId, { fontSize });
  };

  const updateElementTextAlign = (elementId: string, textAlign: 'left' | 'center' | 'right' | 'justify') => {
    updateElement(elementId, { textAlign });
  };

  const replaceJsonReferences = (content: string, data: any): string => {
    if (!data) return content;
    
    // Buscar patrones como {{propiedad}} o {{ruta.propiedad}}
    return content.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      try {
        const value = path.split('.').reduce((obj: any, key: string) => obj && obj[key], data);
        return value !== undefined && value !== null ? String(value) : match;
      } catch (error) {
        return match; // Si hay error, mantener el texto original
      }
    });
  };

  // Función para formatear valores de columnas según las opciones configuradas
  const formatColumnValue = (value: any, column: TableColumn): string => {
    if (value === null || value === undefined) {
      return column.formatOptions?.defaultValue || '';
    }

    const format = column.format || 'text';
    const options = column.formatOptions || {};

    try {
      switch (format) {
        case 'number':
          const num = Number(value);
          if (isNaN(num)) return options.defaultValue || '0';
          
          let formatted = num.toFixed(options.decimals || 0);
          if (options.thousandsSeparator) {
            formatted = num.toLocaleString('es-MX', {
              minimumFractionDigits: options.decimals || 0,
              maximumFractionDigits: options.decimals || 0
            });
          }
          return formatted;

        case 'currency':
          const currencyValue = Number(value);
          if (isNaN(currencyValue)) return options.defaultValue || '$0.00';
          
          const currency = options.currency || 'MXN';
          const currencySymbols = { USD: '$', MXN: '$', EUR: '€' };
          const symbol = currencySymbols[currency];
          
          return symbol + currencyValue.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

        case 'percentage':
          const percentValue = Number(value);
          if (isNaN(percentValue)) return options.defaultValue || '0%';
          
          return percentValue.toFixed(options.decimals || 0) + '%';

        case 'date':
          if (!value) return options.defaultValue || '';
          
          const date = new Date(value);
          if (isNaN(date.getTime())) return options.defaultValue || '';
          
          const dateFormat = options.dateFormat || 'DD/MM/YYYY';
          // Implementación básica de formateo de fechas
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          
          return dateFormat
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year.toString());

        case 'datetime':
          if (!value) return options.defaultValue || '';
          
          const dateTime = new Date(value);
          if (isNaN(dateTime.getTime())) return options.defaultValue || '';
          
          const timeFormat = options.dateFormat || 'DD/MM/YYYY HH:mm';
          const hours = dateTime.getHours().toString().padStart(2, '0');
          const minutes = dateTime.getMinutes().toString().padStart(2, '0');
          
          return timeFormat
            .replace('DD', dateTime.getDate().toString().padStart(2, '0'))
            .replace('MM', (dateTime.getMonth() + 1).toString().padStart(2, '0'))
            .replace('YYYY', dateTime.getFullYear().toString())
            .replace('HH', hours)
            .replace('mm', minutes);

        case 'uppercase':
          return String(value).toUpperCase();

        case 'lowercase':
          return String(value).toLowerCase();

        case 'capitalize':
          return String(value).replace(/\b\w/g, l => l.toUpperCase());

        case 'custom':
          if (options.customFormat) {
            // Implementación básica de formato personalizado
            let result = options.customFormat;
            result = result.replace('{value}', String(value));
            result = result.replace('{length}', String(String(value).length));
            return result;
          }
          return String(value);

        default:
          let textValue = String(value);
          
          // Aplicar transformaciones de texto
          if (options.transform === 'truncate' && options.maxLength) {
            if (textValue.length > options.maxLength) {
              textValue = textValue.substring(0, options.maxLength);
            }
          } else if (options.transform === 'ellipsis' && options.maxLength) {
            if (textValue.length > options.maxLength) {
              textValue = textValue.substring(0, options.maxLength - 3) + '...';
            }
          }
          
          return textValue;
      }
    } catch (error) {
      console.error('Error formateando valor:', error);
      return options.defaultValue || String(value);
    }
  };

  const generateJsonPaths = (obj: any, path: string = ''): string[] => {
    const paths: string[] = [];
    
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        paths.push(currentPath);
        
        if (obj[key] && typeof obj[key] === 'object') {
          paths.push(...generateJsonPaths(obj[key], currentPath));
        }
      });
    } else if (Array.isArray(obj)) {
      paths.push(path);
    }
    
    return paths;
  };

  const formatJsonValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return `Array[${value.length}]`;
    if (typeof value === 'object') return 'Object';
    return String(value);
  };

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
      <script>
        function copyToClipboard(text, element) {
          // Método moderno con navigator.clipboard
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
              element.style.backgroundColor = '#bef3be';
              setTimeout(() => {
                element.style.backgroundColor = '#dbeafe';
              }, 500);
            }).catch(err => {
              console.error('Error al copiar:', err);
              fallbackCopyToClipboard(text, element);
            });
          } else {
            // Método fallback para navegadores antiguos o contextos no seguros
            fallbackCopyToClipboard(text, element);
          }
        }
        
        function fallbackCopyToClipboard(text, element) {
          // Crear un textarea temporal
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              element.style.backgroundColor = '#bef3be';
              setTimeout(() => {
                element.style.backgroundColor = '#dbeafe';
              }, 500);
            } else {
              alert('No se pudo copiar al portapapeles. Copia manual: ' + text);
            }
          } catch (err) {
            console.error('Error en fallback copy:', err);
            alert('No se pudo copiar al portapapeles. Copia manual: ' + text);
          }
          
          document.body.removeChild(textArea);
        }
      </script>
    `;
    
    return html;
  };

  const calculateContentHeight = () => {
    if (elements.length === 0) return 200; // Altura mínima por defecto
    
    const maxY = Math.max(...elements.map(el => el.y + el.height));
    const minY = Math.min(...elements.map(el => el.y));
    const contentHeight = maxY - minY + 100; // Agregar más padding para mejor visualización
    
    return Math.max(contentHeight, 200); // Mínimo 200px
  };

  const generatePreviewHTML = () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .ticket {
            width: ${widthPx}px;
            border: 1px solid #000;
            position: relative;
            background: white;
            margin: 0 auto;
            min-height: ${contentHeight}px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .element {
            position: absolute;
            border: 1px solid #ccc;
            padding: 5px;
            box-sizing: border-box;
            background: transparent;
        }
        .text-element {
            font-size: 14px;
            word-wrap: break-word;
            color: #000000;
            font-weight: 500;
            border: none !important;
            background: transparent !important;
        }
        .table {
            border-collapse: collapse;
            width: 100%;
            font-size: 12px;
            color: #000000;
        }
        .table th, .table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
            color: #000000;
        }
        .table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .table.no-borders th, .table.no-borders td {
            border: none;
        }
        .loading-message {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div class="ticket">`;

    elements.forEach(element => {
      const style = `left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;`;
      const fontSize = element.fontSize || (element.type === 'text' ? 14 : 12);
      
      if (element.type === 'text') {
        const processedContent = replaceJsonReferences(element.content, currentJsonData);
        html += `
        <div class="element text-element" style="${style} font-size: ${fontSize}px; color: #000000; position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; text-align: ${element.textAlign || 'left'}; display: flex; align-items: center; justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : element.textAlign === 'justify' ? 'stretch' : 'flex-start'};">${processedContent}</div>`;
      } else if (element.type === 'table') {
        const tableFontSize = element.config?.fontSize || 12;
        const showBorders = element.config?.showBorders !== false;
        const showHeader = element.config?.showHeader !== false;
        const showHeaderBackground = element.config?.showHeaderBackground !== false;
        const tableClass = showBorders ? 'table' : 'table no-borders';
        html += `
        <div class="element" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; min-height: 30px;">
            <table class="${tableClass}" style="font-size: ${tableFontSize}px; color: #000000; border-collapse: collapse; width: 100%; background: transparent;">`;
        if (element.config?.columns?.length > 0) {
          if (showHeader) {
            html += `
                <thead><tr>`;
            element.config.columns.forEach((col: TableColumn) => {
              const headerStyle = `color: #000000; ${showBorders ? 'border: 1px solid #000;' : ''} padding: 3px; text-align: ${col.textAlign || 'left'}; ${showHeaderBackground ? 'background-color: #f0f0f0;' : 'background-color: transparent;'} font-weight: ${col.bold ? 'bold' : 'bold'}; font-style: ${col.italic ? 'italic' : 'normal'};`;
              html += `
                    <th style="${headerStyle}">${col.header}</th>`;
            });
            html += `
                </tr></thead>`;
          }
          html += `
                <tbody id="table-data-${element.id}">
                    <tr><td colspan="${element.config.columns.length}" class="loading-message">Cargando datos...</td></tr>
                </tbody>`;
        }
        html += `
            </table>
        </div>`;
      }
    });

    html += `
    </div>
    <script>
        // Función para obtener valor de objeto por ruta
        function getValueByPath(obj, path) {
            try {
                return path.split('.').reduce((current, key) => current && current[key], obj);
            } catch (error) {
                console.error('Error al obtener valor por ruta:', path, error);
                return null;
            }
        }
        
        // Función para formatear valores de columnas
        function formatColumnValue(value, column) {
            if (value === null || value === undefined) {
                return column.formatOptions?.defaultValue || '';
            }

            const format = column.format || 'text';
            const options = column.formatOptions || {};

            try {
                switch (format) {
                    case 'number':
                        const num = Number(value);
                        if (isNaN(num)) return options.defaultValue || '0';
                        
                        let formatted = num.toFixed(options.decimals || 0);
                        if (options.thousandsSeparator) {
                            formatted = num.toLocaleString('es-MX', {
                                minimumFractionDigits: options.decimals || 0,
                                maximumFractionDigits: options.decimals || 0
                            });
                        }
                        return formatted;

                    case 'currency':
                        const currencyValue = Number(value);
                        if (isNaN(currencyValue)) return options.defaultValue || '$0.00';
                        
                        const currency = options.currency || 'MXN';
                        const currencySymbols = { USD: '$', MXN: '$', EUR: '€' };
                        const symbol = currencySymbols[currency];
                        
                        return symbol + currencyValue.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'percentage':
                        const percentValue = Number(value);
                        if (isNaN(percentValue)) return options.defaultValue || '0%';
                        
                        return percentValue.toFixed(options.decimals || 0) + '%';

                    case 'date':
                        if (!value) return options.defaultValue || '';
                        
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return options.defaultValue || '';
                        
                        const dateFormat = options.dateFormat || 'DD/MM/YYYY';
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year = date.getFullYear();
                        
                        return dateFormat
                            .replace('DD', day)
                            .replace('MM', month)
                            .replace('YYYY', year.toString());

                    case 'datetime':
                        if (!value) return options.defaultValue || '';
                        
                        const dateTime = new Date(value);
                        if (isNaN(dateTime.getTime())) return options.defaultValue || '';
                        
                        const timeFormat = options.dateFormat || 'DD/MM/YYYY HH:mm';
                        const hours = dateTime.getHours().toString().padStart(2, '0');
                        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
                        
                        return timeFormat
                            .replace('DD', dateTime.getDate().toString().padStart(2, '0'))
                            .replace('MM', (dateTime.getMonth() + 1).toString().padStart(2, '0'))
                            .replace('YYYY', dateTime.getFullYear().toString())
                            .replace('HH', hours)
                            .replace('mm', minutes);

                    case 'uppercase':
                        return String(value).toUpperCase();

                    case 'lowercase':
                        return String(value).toLowerCase();

                    case 'capitalize':
                        return String(value).replace(/\\b\\w/g, l => l.toUpperCase());

                    case 'custom':
                        if (options.customFormat) {
                            let result = options.customFormat;
                            result = result.replace('{value}', String(value));
                            result = result.replace('{length}', String(String(value).length));
                            return result;
                        }
                        return String(value);

                    default:
                        let textValue = String(value);
                        
                        if (options.transform === 'truncate' && options.maxLength) {
                            if (textValue.length > options.maxLength) {
                                textValue = textValue.substring(0, options.maxLength);
                            }
                        } else if (options.transform === 'ellipsis' && options.maxLength) {
                            if (textValue.length > options.maxLength) {
                                textValue = textValue.substring(0, options.maxLength - 3) + '...';
                            }
                        }
                        
                        return textValue;
                }
            } catch (error) {
                console.error('Error formateando valor:', error);
                return options.defaultValue || String(value);
            }
        }
        
        // Función para llenar una tabla específica
        function fillTable(tableId, dataPath, columns, showBorders) {
            console.log('Intentando llenar tabla:', tableId, 'con ruta:', dataPath);
            
            const tableBody = document.getElementById('table-data-' + tableId);
            if (!tableBody) {
                console.error('No se encontró el tbody para la tabla:', tableId);
                return;
            }
            
            const data = ${JSON.stringify(currentJsonData)};
            const tableData = getValueByPath(data, dataPath) || [];
            console.log('Datos encontrados para tabla', tableId, ':', tableData);
            console.log('Columnas configuradas:', columns);
            
            // Limpiar contenido existente
            tableBody.innerHTML = '';
            
            // Agregar filas de datos
            tableData.forEach((item, index) => {
                console.log('Procesando item', index, ':', item);
                const row = document.createElement('tr');
                columns.forEach(col => {
                    const cellStyle = \`color: #000000; \${showBorders ? 'border: 1px solid #000;' : ''} padding: 3px; text-align: \${col.textAlign || 'left'}; font-weight: \${col.bold ? 'bold' : 'normal'}; font-style: \${col.italic ? 'italic' : 'normal'};\`;
                    
                    // Obtener valor usando la propiedad (puede ser una ruta compuesta)
                    let cellValue = getValueByPath(item, col.property) || '';
                    
                    // Formatear el valor según las opciones de la columna
                    const formattedValue = formatColumnValue(cellValue, col);
                    
                    console.log('Columna', col.property, 'valor original:', cellValue, 'formateado:', formattedValue);
                    row.innerHTML += \`<td style="\${cellStyle}">\${formattedValue}</td>\`;
                });
                tableBody.appendChild(row);
            });
            
            console.log('Tabla', tableId, 'llenada con', tableData.length, 'filas');
        }
        
        // Función para procesar todas las tablas
        function processAllTables() {
            console.log('Iniciando procesamiento de tablas...');
            ${elements.filter(el => el.type === 'table').map(element => {
              if (element.config?.dataPath && element.config?.columns) {
                const showBorders = element.config?.showBorders !== false;
                const columnsJson = JSON.stringify(element.config.columns);
                return `
            console.log('Procesando tabla ${element.id} con ruta: ${element.config.dataPath}');
            fillTable('${element.id}', '${element.config.dataPath}', ${columnsJson}, ${showBorders});`;
              }
              return '';
            }).join('\n            ')}
        }
        
        // Ejecutar inmediatamente y también cuando el DOM esté listo
        console.log('Script de vista previa cargado');
        processAllTables();
        
        // También ejecutar cuando el DOM esté listo por si acaso
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', processAllTables);
        } else {
            // DOM ya está listo, ejecutar inmediatamente
            setTimeout(processAllTables, 100);
        }
    </script>`;

    return html;
  };

  const generateHTML = () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .ticket {
            width: ${widthPx}px;
            border: 1px solid #000;
            position: relative;
            background: white;
            margin: 0 auto;
            min-height: ${contentHeight}px;
            padding: 20px;
        }
        .element {
            position: absolute;
            border: none;
            padding: 5px;
            box-sizing: border-box;
            background: transparent;
        }
        .element.table-element {
            min-height: 30px;
        }
        .text-element {
            font-size: 14px;
            word-wrap: break-word;
            color: #000000;
            font-weight: 500;
            border: none !important;
            background: transparent !important;
        }
        .table {
            border-collapse: collapse;
            width: 100%;
            font-size: 12px;
            color: #000000;
        }
        .table th, .table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
            color: #000000;
        }
        .table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .table.no-borders th, .table.no-borders td {
            border: none;
        }
    </style>
</head>
<body>
    <div class="ticket">`;

    elements.forEach(element => {
      const style = `left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;`;
      const fontSize = element.fontSize || (element.type === 'text' ? 14 : 12);
      
      if (element.type === 'text') {
        // Mantener los placeholders originales en lugar de procesarlos
        const templateContent = element.content;
        html += `\n        <div class="element text-element" style="${style} font-size: ${fontSize}px; color: #000000; text-align: ${element.textAlign || 'left'}; display: flex; align-items: center; justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : element.textAlign === 'justify' ? 'stretch' : 'flex-start'}; border: none;">${templateContent}</div>`;
      } else if (element.type === 'table') {
        const tableFontSize = element.config?.fontSize || 12;
        const showBorders = element.config?.showBorders !== false;
        const showHeader = element.config?.showHeader !== false;
        const showHeaderBackground = element.config?.showHeaderBackground !== false;
        const tableClass = showBorders ? 'table' : 'table no-borders';
        html += `\n        <div class="element table-element" style="${style}">`;
        html += `\n            <table class="${tableClass}" style="font-size: ${tableFontSize}px; color: #000000; background: transparent;">`;
        if (element.config?.columns?.length > 0) {
          if (showHeader) {
            html += `\n                <thead><tr>`;
            element.config.columns.forEach((col: TableColumn) => {
              const headerStyle = `color: #000000; text-align: ${col.textAlign || 'left'}; ${showHeaderBackground ? 'background-color: #f0f0f0;' : 'background-color: transparent;'} font-weight: ${col.bold ? 'bold' : 'normal'}; font-style: ${col.italic ? 'italic' : 'normal'};`;
              html += `\n                    <th style="${headerStyle}">${col.header}</th>`;
            });
            html += `\n                </tr></thead>`;
          }
          html += `\n                <tbody id="table-data-${element.id}">
                    <!-- Los datos se cargarán dinámicamente con JavaScript -->
                </tbody>`;
        }
        html += `\n            </table>`;
        html += `\n        </div>`;
      }
    });

    html += `\n    </div>
    <script>
        // ===== PLANTILLA DE TICKET - FUNCIONES DE UTILIDAD =====
        
        // Variable global para los datos JSON
        let ticketData = null;
        
        // Función para obtener valor de objeto por ruta
        function getValueByPath(obj, path) {
            try {
                return path.split('.').reduce((current, key) => current && current[key], obj);
            } catch (error) {
                console.error('Error al obtener valor por ruta:', path, error);
                return null;
            }
        }
        
        // Función para reemplazar placeholders en texto
        function replaceTextPlaceholders(content, data) {
            if (!data) return content;
            
            return content.replace(/\\{\\{([^}]+)\\}\\}/g, (match, path) => {
                try {
                    const value = getValueByPath(data, path);
                    return value !== undefined ? String(value) : match;
                } catch (error) {
                    console.error('Error al reemplazar placeholder:', path, error);
                    return match;
                }
            });
        }
        
        // Función para formatear valores de columnas
        function formatColumnValue(value, column) {
            if (value === null || value === undefined) {
                return column.formatOptions?.defaultValue || '';
            }

            const format = column.format || 'text';
            const options = column.formatOptions || {};

            try {
                switch (format) {
                    case 'number':
                        const num = Number(value);
                        if (isNaN(num)) return options.defaultValue || '0';
                        
                        let formatted = num.toFixed(options.decimals || 0);
                        if (options.thousandsSeparator) {
                            formatted = num.toLocaleString('es-MX', {
                                minimumFractionDigits: options.decimals || 0,
                                maximumFractionDigits: options.decimals || 0
                            });
                        }
                        return formatted;

                    case 'currency':
                        const currencyValue = Number(value);
                        if (isNaN(currencyValue)) return options.defaultValue || '$0.00';
                        
                        const currency = options.currency || 'MXN';
                        const currencySymbols = { USD: '$', MXN: '$', EUR: '€' };
                        const symbol = currencySymbols[currency];
                        
                        return symbol + currencyValue.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'percentage':
                        const percentValue = Number(value);
                        if (isNaN(percentValue)) return options.defaultValue || '0%';
                        
                        return percentValue.toFixed(options.decimals || 0) + '%';

                    case 'date':
                        if (!value) return options.defaultValue || '';
                        
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return options.defaultValue || '';
                        
                        const dateFormat = options.dateFormat || 'DD/MM/YYYY';
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year = date.getFullYear();
                        
                        return dateFormat
                            .replace('DD', day)
                            .replace('MM', month)
                            .replace('YYYY', year.toString());

                    case 'datetime':
                        if (!value) return options.defaultValue || '';
                        
                        const dateTime = new Date(value);
                        if (isNaN(dateTime.getTime())) return options.defaultValue || '';
                        
                        const timeFormat = options.dateFormat || 'DD/MM/YYYY HH:mm';
                        const hours = dateTime.getHours().toString().padStart(2, '0');
                        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
                        
                        return timeFormat
                            .replace('DD', dateTime.getDate().toString().padStart(2, '0'))
                            .replace('MM', (dateTime.getMonth() + 1).toString().padStart(2, '0'))
                            .replace('YYYY', dateTime.getFullYear().toString())
                            .replace('HH', hours)
                            .replace('mm', minutes);

                    case 'uppercase':
                        return String(value).toUpperCase();

                    case 'lowercase':
                        return String(value).toLowerCase();

                    case 'capitalize':
                        return String(value).replace(/\\b\\w/g, l => l.toUpperCase());

                    case 'custom':
                        if (options.customFormat) {
                            let result = options.customFormat;
                            result = result.replace('{value}', String(value));
                            result = result.replace('{length}', String(String(value).length));
                            return result;
                        }
                        return String(value);

                    default:
                        let textValue = String(value);
                        
                        if (options.transform === 'truncate' && options.maxLength) {
                            if (textValue.length > options.maxLength) {
                                textValue = textValue.substring(0, options.maxLength);
                            }
                        } else if (options.transform === 'ellipsis' && options.maxLength) {
                            if (textValue.length > options.maxLength) {
                                textValue = textValue.substring(0, options.maxLength - 3) + '...';
                            }
                        }
                        
                        return textValue;
                }
            } catch (error) {
                console.error('Error formateando valor:', error);
                return options.defaultValue || String(value);
            }
        }
        
        // Función para llenar una tabla específica
        function fillTable(tableId, dataPath, columns, showBorders) {
            const tableBody = document.getElementById('table-data-' + tableId);
            if (!tableBody) {
                console.error('No se encontró el tbody para la tabla:', tableId);
                return;
            }
            
            const tableData = getValueByPath(ticketData, dataPath) || [];
            console.log('Datos para tabla', tableId, ':', tableData);
            
            // Limpiar contenido existente
            tableBody.innerHTML = '';
            
            // Agregar filas de datos
            tableData.forEach((item, index) => {
                const row = document.createElement('tr');
                columns.forEach(col => {
                    const cellStyle = \`color: #000000; \${showBorders ? 'border: 1px solid #000;' : ''} padding: 3px; text-align: \${col.textAlign || 'left'}; font-weight: \${col.bold ? 'bold' : 'normal'}; font-style: \${col.italic ? 'italic' : 'normal'};\`;
                    
                    // Obtener valor usando la propiedad (puede ser una ruta compuesta)
                    let cellValue = getValueByPath(item, col.property) || '';
                    
                    // Formatear el valor según las opciones de la columna
                    const formattedValue = formatColumnValue(cellValue, col);
                    
                    row.innerHTML += \`<td style="\${cellStyle}">\${formattedValue}</td>\`;
                });
                tableBody.appendChild(row);
            });
            
            console.log('Tabla', tableId, 'llenada con', tableData.length, 'filas');
        }
        
        // Función principal para procesar toda la plantilla
        function processTicketTemplate(data) {
            ticketData = data;
            console.log('Procesando plantilla con datos:', data);
            
            // Procesar elementos de texto
            const textElements = document.querySelectorAll('.text-element');
            textElements.forEach(element => {
                const originalContent = element.textContent || element.innerText;
                const processedContent = replaceTextPlaceholders(originalContent, data);
                element.textContent = processedContent;
            });
            
            // Llenar todas las tablas
            ${elements.filter(el => el.type === 'table').map(element => {
              if (element.config?.dataPath && element.config?.columns) {
                const showBorders = element.config?.showBorders !== false;
                const columnsJson = JSON.stringify(element.config.columns);
                return `
            fillTable('${element.id}', '${element.config.dataPath}', ${columnsJson}, ${showBorders});`;
              }
              return '';
            }).join('\n            ')}
        }
        
        // ===== INSTRUCCIONES DE USO =====
        // Para usar esta plantilla:
        // 1. Asignar los datos JSON a la variable ticketData
        // 2. Llamar a processTicketTemplate(ticketData)
        // 
        // Ejemplo:
        // const datos = { empresa: { nombre: "Mi Empresa" }, ... };
        // processTicketTemplate(datos);
        // 
        // O alternativamente:
        // ticketData = datos;
        // processTicketTemplate(ticketData);
        
        // ===== DATOS DE EJEMPLO (OPCIONAL) =====
                 // Descomenta las siguientes líneas para usar datos de ejemplo:
         /*
         const datosEjemplo = ${JSON.stringify(defaultJsonData)};
         document.addEventListener('DOMContentLoaded', function() {
             processTicketTemplate(datosEjemplo);
         });
         */
    </script>
</body>
</html>`;

    // Crear y descargar el archivo
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-template.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setShowProperties(false);
    setShowPreview(false);
    setShowJsonViewer(false);
  };

  const calculateRelativePosition = (element: TicketElement): { x: number; y: number } => {
    if (!element.relativeTo || !element.relativePosition) {
      return { x: element.x, y: element.y };
    }

    const referenceElement = elements.find(el => el.id === element.relativeTo);
    if (!referenceElement) {
      return { x: element.x, y: element.y };
    }

    const offset = element.relativeOffset || { x: 0, y: 0 };
    let newX = referenceElement.x;
    let newY = referenceElement.y;

    switch (element.relativePosition) {
      case 'below':
        newY = referenceElement.y + referenceElement.height + offset.y;
        newX = referenceElement.x + offset.x;
        break;
      case 'above':
        newY = referenceElement.y - element.height + offset.y;
        newX = referenceElement.x + offset.x;
        break;
      case 'left':
        newX = referenceElement.x - element.width + offset.x;
        newY = referenceElement.y + offset.y;
        break;
      case 'right':
        newX = referenceElement.x + referenceElement.width + offset.x;
        newY = referenceElement.y + offset.y;
        break;
      case 'bottom-right':
        newX = referenceElement.x + referenceElement.width + offset.x;
        newY = referenceElement.y + referenceElement.height + offset.y;
        break;
      case 'bottom-left':
        newX = referenceElement.x - element.width + offset.x;
        newY = referenceElement.y + referenceElement.height + offset.y;
        break;
      case 'top-right':
        newX = referenceElement.x + referenceElement.width + offset.x;
        newY = referenceElement.y - element.height + offset.y;
        break;
      case 'top-left':
        newX = referenceElement.x - element.width + offset.x;
        newY = referenceElement.y - element.height + offset.y;
        break;
      case 'center':
        newX = referenceElement.x + (referenceElement.width - element.width) / 2 + offset.x;
        newY = referenceElement.y + (referenceElement.height - element.height) / 2 + offset.y;
        break;
    }

    return { x: newX, y: newY };
  };

  const updateRelativePositions = () => {
    const updatedElements = elements.map(element => {
      if (element.relativeTo && element.relativePosition) {
        const newPosition = calculateRelativePosition(element);
        return { ...element, x: newPosition.x, y: newPosition.y };
      }
      return element;
    });
    setElements(updatedElements);
  };

  const generateExampleUsage = () => {
    const exampleHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ejemplo de uso - Plantilla de Ticket</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .example-section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .code-block {
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
        }
        .button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .button:hover {
            background: #0056b3;
        }
        .ticket-preview {
            border: 2px dashed #ccc;
            padding: 20px;
            margin: 20px 0;
            background: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎫 Ejemplo de uso - Plantilla de Ticket</h1>
        
        <div class="example-section">
            <h2>📋 Instrucciones de uso</h2>
            <p>Esta plantilla permite generar tickets dinámicos usando datos JSON. Sigue estos pasos:</p>
            
            <h3>1. Cargar la plantilla</h3>
            <div class="code-block">
&lt;script src="ticket-template.html"&gt;&lt;/script&gt;
            </div>
            
            <h3>2. Preparar los datos JSON</h3>
            <div class="code-block">
const datos = {
    "empresa": {
        "nombre": "Mi Empresa S.A.",
        "direccion": "Calle Principal 123",
        "telefono": "(555) 123-4567"
    },
    "venta": {
        "numero": "TICK-2024-001",
        "fecha": "2024-01-15",
        "total": 1250.75
    },
    "productos": {
        "items": [
            {
                "codigo": "PROD001",
                "nombre": "Laptop HP Pavilion",
                "precio": 899.99,
                "cantidad": 1
            }
        ]
    }
};
            </div>
            
            <h3>3. Procesar la plantilla</h3>
            <div class="code-block">
// Llamar a la función principal
processTicketTemplate(datos);
            </div>
        </div>
        
        <div class="example-section">
            <h2>🧪 Probar con datos de ejemplo</h2>
            <p>Haz clic en el botón para cargar datos de ejemplo y ver el resultado:</p>
            
            <button class="button" onclick="loadExampleData()">Cargar datos de ejemplo</button>
            <button class="button" onclick="loadCustomData()">Cargar datos personalizados</button>
            <button class="button" onclick="clearData()">Limpiar datos</button>
            
            <div id="ticket-container" class="ticket-preview">
                <p style="text-align: center; color: #666;">
                    El ticket aparecerá aquí después de cargar datos...
                </p>
            </div>
        </div>
        
        <div class="example-section">
            <h2>📝 Estructura de datos esperada</h2>
            <p>La plantilla espera datos JSON con esta estructura:</p>
            <div class="code-block">
{
    "empresa": {
        "nombre": "string",
        "direccion": "string", 
        "telefono": "string",
        "email": "string",
        "rfc": "string"
    },
    "venta": {
        "numero": "string",
        "fecha": "string",
        "hora": "string",
        "total": "number",
        "subtotal": "number",
        "iva": "number",
        "metodoPago": "string",
        "cajero": "string"
    },
    "productos": {
        "items": [
            {
                "codigo": "string",
                "nombre": "string",
                "descripcion": "string",
                "precio": "number",
                "cantidad": "number",
                "subtotal": "number",
                "categoria": "string"
            }
        ],
        "totalItems": "number"
    },
    "empleado": {
        "nombre": "string",
        "id": "string",
        "departamento": "string",
        "puesto": "string"
    },
    "cliente": {
        "nombre": "string",
        "email": "string",
        "telefono": "string",
        "direccion": "string"
    }
}
            </div>
        </div>
        
        <div class="example-section">
            <h2>🔧 Funciones disponibles</h2>
            <ul>
                <li><strong>processTicketTemplate(data)</strong> - Función principal para procesar la plantilla</li>
                <li><strong>getValueByPath(obj, path)</strong> - Obtener valor por ruta de puntos</li>
                <li><strong>replaceTextPlaceholders(content, data)</strong> - Reemplazar placeholders en texto</li>
                <li><strong>fillTable(tableId, dataPath, columns, showBorders)</strong> - Llenar tabla con datos</li>
            </ul>
        </div>
    </div>

    <script>
        // Datos de ejemplo
        const datosEjemplo = ${JSON.stringify(defaultJsonData)};
        
        // Datos personalizados de ejemplo
        const datosPersonalizados = {
            "empresa": {
                "nombre": "Tienda de Ropa Fashion",
                "direccion": "Av. Comercial 456",
                "telefono": "(555) 987-6543",
                "email": "ventas@fashion.com",
                "rfc": "FASH123456789"
            },
            "venta": {
                "numero": "FASH-2024-002",
                "fecha": "2024-01-20",
                "hora": "16:45:30",
                "total": 850.00,
                "subtotal": 739.13,
                "iva": 110.87,
                "metodoPago": "Efectivo",
                "cajero": "Ana Martínez"
            },
            "productos": {
                "items": [
                    {
                        "codigo": "CAM001",
                        "nombre": "Camisa de Vestir",
                        "descripcion": "Camisa formal color azul",
                        "precio": 299.99,
                        "cantidad": 2,
                        "subtotal": 599.98,
                        "categoria": "Ropa Formal"
                    },
                    {
                        "codigo": "PANT002",
                        "nombre": "Pantalón de Vestir",
                        "descripcion": "Pantalón negro formal",
                        "precio": 250.00,
                        "cantidad": 1,
                        "subtotal": 250.00,
                        "categoria": "Ropa Formal"
                    }
                ],
                "totalItems": 3
            },
            "empleado": {
                "nombre": "Ana Martínez",
                "id": "EMP002",
                "departamento": "Ventas",
                "puesto": "Vendedora"
            },
            "cliente": {
                "nombre": "María López",
                "email": "maria.lopez@email.com",
                "telefono": "(555) 111-2222",
                "direccion": "Calle Flores 789, Col. Jardines"
            }
        };
        
        function loadExampleData() {
            if (typeof processTicketTemplate === 'function') {
                processTicketTemplate(datosEjemplo);
                document.getElementById('ticket-container').innerHTML = 
                    '<p style="text-align: center; color: green;">✅ Datos de ejemplo cargados. Revisa la consola para más detalles.</p>';
            } else {
                alert('La plantilla no está cargada. Asegúrate de incluir ticket-template.html');
            }
        }
        
        function loadCustomData() {
            if (typeof processTicketTemplate === 'function') {
                processTicketTemplate(datosPersonalizados);
                document.getElementById('ticket-container').innerHTML = 
                    '<p style="text-align: center; color: green;">✅ Datos personalizados cargados. Revisa la consola para más detalles.</p>';
            } else {
                alert('La plantilla no está cargada. Asegúrate de incluir ticket-template.html');
            }
        }
        
        function clearData() {
            if (typeof processTicketTemplate === 'function') {
                processTicketTemplate(null);
                document.getElementById('ticket-container').innerHTML = 
                    '<p style="text-align: center; color: #666;">Datos limpiados.</p>';
            }
        }
    </script>
</body>
</html>`;

    // Crear y descargar el archivo de ejemplo
    const blob = new Blob([exampleHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ejemplo-uso-plantilla.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función para exportar la configuración del proyecto
  const exportProjectConfig = () => {
    const projectConfig: ProjectConfig = {
      version: "1.0.0",
      name: "Ticket Editor Project",
      description: "Proyecto de editor de tickets exportado",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ticketWidth,
      widthUnit,
      elements,
      jsonData: jsonData || null
    };

    const configJson = JSON.stringify(projectConfig, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-editor-project-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función para importar la configuración del proyecto
  const importProjectConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const configJson = event.target?.result as string;
        const projectConfig: ProjectConfig = JSON.parse(configJson);

        // Validar que sea una configuración válida
        if (!projectConfig.version || !projectConfig.elements) {
          alert('❌ El archivo no es una configuración válida del editor de tickets.');
          return;
        }

        // Cargar la configuración
        setTicketWidth(projectConfig.ticketWidth || 300);
        setWidthUnit(projectConfig.widthUnit || 'px');
        setElements(projectConfig.elements || []);
        setJsonData(projectConfig.jsonData || null);
        setSelectedElement(null);
        setShowProperties(false);

        alert(`✅ Proyecto cargado exitosamente!\n\n📋 Información del proyecto:\n• Nombre: ${projectConfig.name}\n• Versión: ${projectConfig.version}\n• Elementos: ${projectConfig.elements.length}\n• Creado: ${new Date(projectConfig.createdAt).toLocaleString()}`);
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
        alert('❌ Error al cargar la configuración. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Editor de Tickets</title>
      </Head>

      <div className="flex h-screen">
        {/* Barra lateral de herramientas */}
        <div className="w-80 bg-white shadow-lg p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-black">Editor de Tickets</h2>
          
          {/* Configuración de ancho */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-black">Ancho del ticket:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={ticketWidth}
                onChange={(e) => setTicketWidth(Number(e.target.value))}
                className="flex-1 px-3 py-2 border rounded text-black"
                min="50"
                max="1000"
              />
              <select
                value={widthUnit}
                onChange={(e) => handleUnitChange(e.target.value as 'px' | 'in' | 'cm')}
                className="px-3 py-2 border rounded text-black"
              >
                <option value="px">px</option>
                <option value="in">pulgadas</option>
                <option value="cm">cm</option>
              </select>
            </div>
            <div className="text-xs text-black mt-1">
              Ancho actual: {convertWidth(ticketWidth, widthUnit).toFixed(0)}px
              {widthUnit !== 'px' && (
                <span className="text-blue-600 ml-2">
                  ({ticketWidth.toFixed(2)} {widthUnit})
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              💡 Al cambiar la unidad, el valor se convierte automáticamente
            </div>
            <div className="text-xs text-blue-600 mt-1">
              📏 Conversiones: 1 pulgada = 96px, 1 cm = 37.795px
            </div>
            {isConverting && (
              <div className="text-xs text-green-600 mt-1 animate-pulse">
                🔄 Convirtiendo elementos...
              </div>
            )}
          </div>

          {/* Carga de JSON */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-black">Cargar datos JSON:</label>
            <input
              type="file"
              accept=".json"
              onChange={handleJsonUpload}
              className="w-full px-3 py-2 border rounded text-black"
            />
            {currentJsonData && (
              <div className="mt-2 space-y-2">
                <div className="text-sm text-green-600">
                  ✓ JSON cargado correctamente
                </div>
                <button
                  onClick={() => setShowJsonViewer(!showJsonViewer)}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                    showJsonViewer 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showJsonViewer ? '📋 Ocultar Propiedades' : '📋 Ver Propiedades JSON'}
                </button>
              </div>
            )}
            <div className="mt-2">
              <a 
                href="/ejemplo-datos.json" 
                download
                className="text-blue-600 text-sm hover:underline"
              >
                📥 Descargar ejemplo JSON
          </a>
        </div>
          </div>

          {/* Herramientas de posicionamiento */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-black">Posicionamiento:</h3>
            <button
              onClick={() => setRelativeMode(!relativeMode)}
              className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                relativeMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {relativeMode ? '✓ Modo Relativo Activo' : '🔗 Activar Posicionamiento Relativo'}
            </button>
            {relativeMode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                💡 <strong>Modo relativo activo:</strong> Los nuevos elementos se posicionarán automáticamente en relación a otros elementos.
              </div>
            )}
          </div>

          {/* Instrucciones de movimiento con teclado */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="text-sm font-medium mb-2 text-yellow-800">⌨️ Movimiento con teclado:</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>• <strong>Flechas:</strong> Mover elemento seleccionado 5px</div>
              <div>• <strong>Shift + Flechas:</strong> Mover 20px</div>
              <div>• <strong>Selecciona un elemento</strong> para activar</div>
            </div>
          </div>

          {/* Herramientas */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-black">Elementos:</h3>
            
            {/* Elementos arrastrables */}
            <div className="space-y-2">
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'text')}
                className="p-3 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors text-black font-medium"
              >
                📝 Etiqueta de texto
              </div>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'table')}
                className="p-3 bg-green-100 border border-green-300 rounded cursor-move hover:bg-green-200 transition-colors text-black font-medium"
              >
                📊 Tabla
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                showPreview 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showPreview ? '👁️ Ocultar Vista Previa' : '👁️ Mostrar Vista Previa'}
            </button>
            <button
              onClick={generateHTML}
              className="w-full py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              💾 Generar Plantilla HTML
            </button>
            <button
              onClick={clearCanvas}
              className="w-full py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
            >
              🗑️ Limpiar Todo
            </button>
                          <button
                onClick={generateExampleUsage}
                className="w-full py-2 px-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
              >
                📚 Ejemplo de uso
              </button>
              
              {/* Exportar/Importar Configuración */}
              <div className="space-y-2">
                <button
                  onClick={exportProjectConfig}
                  className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  title="Guardar toda la configuración del proyecto"
                >
                  💾 Exportar Proyecto
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProjectConfig}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Cargar configuración guardada anteriormente"
                  />
                  <button
                    className="w-full py-2 px-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium"
                  >
                    📂 Importar Proyecto
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  if (showPreview) {
                    const previewFrame = document.querySelector('iframe');
                    if (previewFrame && previewFrame.contentWindow) {
                      try {
                        (previewFrame.contentWindow as any).console?.log('=== DEPURACIÓN DE VISTA PREVIA ===');
                        (previewFrame.contentWindow as any).processAllTables?.();
                        console.log('✅ Función processAllTables ejecutada en el iframe');
                      } catch (error) {
                        console.error('❌ Error al ejecutar processAllTables en el iframe:', error);
                        // Forzar recarga del iframe como fallback
                        const currentSrcDoc = previewFrame.getAttribute('srcDoc');
                        if (currentSrcDoc) {
                          previewFrame.setAttribute('srcDoc', '');
                          setTimeout(() => {
                            previewFrame.setAttribute('srcDoc', currentSrcDoc);
                          }, 100);
                        }
                      }
                    }
                  }
                }}
                className="w-full py-2 px-3 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium"
                title="Forzar actualización de tablas en vista previa"
              >
                🔄 Actualizar Tablas
              </button>
              <button
                onClick={() => {
                  if (showPreview) {
                    const previewFrame = document.querySelector('iframe');
                    if (previewFrame) {
                      // Abrir la consola del iframe
                      previewFrame.contentWindow?.focus();
                      console.log('💡 Para ver los logs del iframe:');
                      console.log('1. Haz clic derecho en el iframe');
                      console.log('2. Selecciona "Inspeccionar"');
                      console.log('3. Ve a la pestaña "Console"');
                      console.log('4. Los logs de las tablas aparecerán ahí');
                    }
                  }
                }}
                className="w-full py-2 px-3 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
                title="Instrucciones para ver logs del iframe"
              >
                📋 Ver Logs
              </button>
          </div>

          {/* Información */}
          <div className="text-xs text-gray-600">
            <p className="mb-2"><strong>Instrucciones:</strong></p>
            <ul className="space-y-1">
              <li>• Arrastra elementos al área de diseño</li>
              <li>• Haz clic para seleccionar elementos</li>
              <li>• Arrastra para mover elementos</li>
              <li>• Usa las esquinas para redimensionar</li>
              <li>• Haz clic en tablas para configurar</li>
            </ul>
            
            <p className="mb-2 mt-4"><strong>Controles de Teclado:</strong></p>
            <ul className="space-y-1">
              <li>• <strong>Flechas:</strong> Mover elemento seleccionado (5px)</li>
              <li>• <strong>Shift + Flechas:</strong> Mover más rápido (20px)</li>
              <li>• <strong>Shift + ←/→:</strong> Cambiar ancho del elemento</li>
              <li>• <strong>Shift + ↑/↓:</strong> Cambiar altura del elemento</li>
            </ul>
          </div>
        </div>

        {/* Panel de propiedades */}
        {showProperties && selectedElement && (
          <div className="w-80 bg-white shadow-lg p-4 border-l border-gray-200 overflow-y-auto max-h-screen">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Propiedades</h3>
              <button
                onClick={() => {
                  setShowProperties(false);
                  setSelectedElement(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                title="Cerrar"
              >
                ×
              </button>
            </div>
            
            {(() => {
              const element = elements.find(el => el.id === selectedElement);
              if (!element) return null;
              
              return (
                <div className="space-y-4 pb-4">
                  {/* Posicionamiento relativo */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1 text-black">
                      Posicionamiento relativo:
                    </label>
                    <div className="space-y-2">
                      {/* Elemento de referencia */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Relativo a:</label>
                        <select
                          value={element.relativeTo || ''}
                          onChange={(e) => updateElement(selectedElement, { 
                            relativeTo: e.target.value || undefined,
                            relativePosition: e.target.value ? (element.relativePosition || 'below') : undefined
                          })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                        >
                          <option value="">Ninguno (posición absoluta)</option>
                          {elements.filter(el => el.id !== selectedElement).map(el => (
                            <option key={el.id} value={el.id}>
                              {el.type === 'text' ? `Texto: ${el.content.substring(0, 20)}...` : `Tabla: ${el.config?.columns?.length || 0} columnas`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Posición relativa */}
                      {element.relativeTo && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Posición:</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(['top-left', 'above', 'top-right', 'left', 'center', 'right', 'bottom-left', 'below', 'bottom-right'] as const).map((pos) => (
                              <button
                                key={pos}
                                onClick={() => updateElement(selectedElement, { relativePosition: pos })}
                                className={`px-2 py-1 text-xs rounded border transition-colors ${
                                  element.relativePosition === pos 
                                    ? 'bg-blue-500 text-white border-blue-500' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                                title={pos.replace('-', ' ')}
                              >
                                {pos === 'top-left' && '↖'}
                                {pos === 'above' && '↑'}
                                {pos === 'top-right' && '↗'}
                                {pos === 'left' && '←'}
                                {pos === 'center' && '•'}
                                {pos === 'right' && '→'}
                                {pos === 'bottom-left' && '↙'}
                                {pos === 'below' && '↓'}
                                {pos === 'bottom-right' && '↘'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Offset */}
                      {element.relativeTo && element.relativePosition && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Offset (px):</label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500">X:</label>
                              <input
                                type="number"
                                value={element.relativeOffset?.x || 0}
                                onChange={(e) => updateElement(selectedElement, { 
                                  relativeOffset: { 
                                    x: Number(e.target.value), 
                                    y: element.relativeOffset?.y || 0 
                                  } 
                                })}
                                className="w-full px-2 py-1 border rounded text-xs text-black"
                                placeholder="0"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500">Y:</label>
                              <input
                                type="number"
                                value={element.relativeOffset?.y || 0}
                                onChange={(e) => updateElement(selectedElement, { 
                                  relativeOffset: { 
                                    x: element.relativeOffset?.x || 0, 
                                    y: Number(e.target.value) 
                                  } 
                                })}
                                className="w-full px-2 py-1 border rounded text-xs text-black"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instrucciones de movimiento con teclado */}
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <label className="block text-xs font-medium mb-1 text-blue-800">
                      🎯 Movimiento con teclado:
                    </label>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>• <strong>Flechas:</strong> Mover 5px</div>
                      <div>• <strong>Shift + Flechas:</strong> Mover 20px</div>
                      <div>• <strong>Elemento seleccionado:</strong> {selectedElement ? '✓' : '✗'}</div>
                    </div>
                  </div>

                  {element.type === 'text' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-black">Contenido:</label>
                        <textarea
                          value={element.content}
                          onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                          className="w-full px-3 py-2 border rounded text-black"
                          rows={3}
                          placeholder="Texto del elemento..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-black">Tamaño de fuente:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="8"
                            max="32"
                            value={element.fontSize || 14}
                            onChange={(e) => updateElementFontSize(selectedElement, Number(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm text-black w-8">
                            {element.fontSize || 14}px
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-black">Alineación:</label>
                        <div className="flex gap-1">
                          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                            <button
                              key={align}
                              onClick={() => updateElementTextAlign(selectedElement, align)}
                              className={`flex-1 px-3 py-2 text-sm rounded border transition-colors ${
                                element.textAlign === align 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {align === 'left' && 'Izquierda'}
                              {align === 'center' && 'Centro'}
                              {align === 'right' && 'Derecha'}
                              {align === 'justify' && 'Justificar'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-black">Propiedades JSON disponibles:</label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const currentContent = element.content;
                              const newContent = currentContent + `{{${e.target.value}}}`;
                              updateElement(selectedElement, { content: newContent });
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-black"
                          defaultValue=""
                        >
                          <option value="">Seleccionar propiedad...</option>
                          {currentJsonData && generateJsonPaths(currentJsonData).map(path => (
                            <option key={path} value={path}>{path}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {element.type === 'table' && (
                    <div className="space-y-3">
                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Ruta de datos (ej: productos.items):
                        </label>
                        <input
                          type="text"
                          value={element.config?.dataPath || ''}
                          onChange={(e) => updateElement(selectedElement, { 
                            config: { 
                              ...element.config, 
                              dataPath: e.target.value 
                            } 
                          })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                          placeholder="productos.items"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Ejemplo: productos.items, venta.detalles, etc.
                        </div>
                        {element.config?.dataPath && (
                          <div className="text-xs text-green-600 mt-1">
                            ✅ Ruta configurada: {element.config.dataPath}
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Tamaño de fuente de tabla:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="8"
                            max="20"
                            value={element.config?.fontSize || 12}
                            onChange={(e) => updateElement(selectedElement, { 
                              config: { 
                                ...element.config, 
                                fontSize: Number(e.target.value) 
                              } 
                            })}
                            className="flex-1"
                          />
                          <span className="text-xs text-black w-8">
                            {element.config?.fontSize || 12}px
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Mostrar bordes:
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableBorders"
                              checked={element.config?.showBorders !== false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showBorders: true 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">Sí</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableBorders"
                              checked={element.config?.showBorders === false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showBorders: false 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">No</span>
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Mostrar encabezado:
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableHeader"
                              checked={element.config?.showHeader !== false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showHeader: true 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">Sí</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableHeader"
                              checked={element.config?.showHeader === false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showHeader: false 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">No</span>
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Fondo del encabezado:
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableHeaderBackground"
                              checked={element.config?.showHeaderBackground !== false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showHeaderBackground: true 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">Con fondo gris</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tableHeaderBackground"
                              checked={element.config?.showHeaderBackground === false}
                              onChange={() => updateElement(selectedElement, { 
                                config: { 
                                  ...element.config, 
                                  showHeaderBackground: false 
                                } 
                              })}
                              className="mr-2"
                            />
                            <span className="text-xs text-black">Sin fondo</span>
                          </label>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1 text-black">
                          Columnas:
                        </label>
                        {element.config?.columns?.length > 0 && (
                          <div className="text-xs text-green-600 mb-2">
                            ✅ {element.config.columns.length} columna(s) configurada(s)
                          </div>
                        )}
                        
                        {/* Información de depuración */}
                        {element.config?.dataPath && element.config?.columns?.length > 0 && (
                          <div className="text-xs text-blue-600 mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div><strong>Ruta de datos:</strong> {element.config.dataPath}</div>
                            <div><strong>Columnas:</strong></div>
                            <ul className="ml-2 mt-1">
                              {element.config.columns.map((col: TableColumn, index: number) => (
                                <li key={index}>• {col.header} → {col.property}</li>
                              ))}
                            </ul>
                            <div className="mt-1 text-gray-600">
                              💡 Revisa la consola para ver los datos cargados
                            </div>
                          </div>
                        )}
                        {(element.config?.columns || []).map((column: TableColumn, index: number) => (
                          <div key={index} className="space-y-2 mb-3 p-2 border border-gray-200 rounded bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">Columna {index + 1}</span>
                              <button
                                onClick={() => {
                                  const newColumns = (element.config?.columns || []).filter((_: TableColumn, i: number) => i !== index);
                                  updateElement(selectedElement, { 
                                    config: { 
                                      ...element.config, 
                                      columns: newColumns 
                                    } 
                                  });
                                }}
                                className="px-1 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                title="Eliminar columna"
                              >
                                ×
                              </button>
                            </div>
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={column.header}
                                onChange={(e) => {
                                  const newColumns = [...(element.config?.columns || [])];
                                  newColumns[index] = { ...newColumns[index], header: e.target.value };
                                  updateElement(selectedElement, { 
                                    config: { 
                                      ...element.config, 
                                      columns: newColumns 
                                    } 
                                  });
                                }}
                                className="w-full px-2 py-1 border rounded text-xs text-black"
                                placeholder="Encabezado de la columna"
                              />
                              <input
                                type="text"
                                value={column.property}
                                onChange={(e) => {
                                  const newColumns = [...(element.config?.columns || [])];
                                  newColumns[index] = { ...newColumns[index], property: e.target.value };
                                  updateElement(selectedElement, { 
                                    config: { 
                                      ...element.config, 
                                      columns: newColumns 
                                    } 
                                  });
                                }}
                                className="w-full px-2 py-1 border rounded text-xs text-black"
                                placeholder="Propiedad del JSON (ej: nombre)"
                              />
    </div>
                            
                            {/* Configuraciones adicionales de la columna */}
                            <div className="pt-2 border-t border-gray-200">
                              <div className="space-y-2">
                                {/* Alineación */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Alineación:</label>
                                  <div className="flex gap-1">
                                    {(['left', 'center', 'right'] as const).map((align) => (
                                      <button
                                        key={align}
                                        onClick={() => {
                                          const newColumns = [...(element.config?.columns || [])];
                                          newColumns[index] = { 
                                            ...newColumns[index], 
                                            textAlign: align 
                                          };
                                          updateElement(selectedElement, { 
                                            config: { 
                                              ...element.config, 
                                              columns: newColumns 
                                            } 
                                          });
                                        }}
                                        className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                                          column.textAlign === align 
                                            ? 'bg-blue-500 text-white border-blue-500' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                        title={`Alinear ${align === 'left' ? 'izquierda' : align === 'center' ? 'centro' : 'derecha'}`}
                                      >
                                        {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Negrita */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Estilo:</label>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          bold: !column.bold 
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                                        column.bold 
                                          ? 'bg-blue-500 text-white border-blue-500' 
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                      }`}
                                      title="Negrita"
                                    >
                                      <strong>B</strong>
                                    </button>
                                    <button
                                      onClick={() => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          italic: !column.italic 
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                                        column.italic 
                                          ? 'bg-blue-500 text-white border-blue-500' 
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                      }`}
                                      title="Cursiva"
                                    >
                                      <em>I</em>
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Formateo */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Formato:</label>
                                  <select
                                    value={column.format || 'text'}
                                    onChange={(e) => {
                                      const newColumns = [...(element.config?.columns || [])];
                                      newColumns[index] = { 
                                        ...newColumns[index], 
                                        format: e.target.value as any,
                                        formatOptions: newColumns[index].formatOptions || {}
                                      };
                                      updateElement(selectedElement, { 
                                        config: { 
                                          ...element.config, 
                                          columns: newColumns 
                                        } 
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs text-black"
                                  >
                                    <option value="text">Texto</option>
                                    <option value="number">Número</option>
                                    <option value="currency">Moneda</option>
                                    <option value="percentage">Porcentaje</option>
                                    <option value="date">Fecha</option>
                                    <option value="datetime">Fecha y Hora</option>
                                    <option value="uppercase">Mayúsculas</option>
                                    <option value="lowercase">Minúsculas</option>
                                    <option value="capitalize">Capitalizar</option>
                                    <option value="custom">Personalizado</option>
                                  </select>
                                </div>
                                
                                {/* Opciones específicas según el formato */}
                                {column.format === 'number' && (
                                  <div className="space-y-1">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700">Decimales:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={column.formatOptions?.decimals || 0}
                                        onChange={(e) => {
                                          const newColumns = [...(element.config?.columns || [])];
                                          newColumns[index] = { 
                                            ...newColumns[index], 
                                            formatOptions: {
                                              ...newColumns[index].formatOptions,
                                              decimals: Number(e.target.value)
                                            }
                                          };
                                          updateElement(selectedElement, { 
                                            config: { 
                                              ...element.config, 
                                              columns: newColumns 
                                            } 
                                          });
                                        }}
                                        className="w-full px-2 py-1 border rounded text-xs text-black"
                                      />
                                    </div>
                                    <label className="flex items-center text-xs">
                                      <input
                                        type="checkbox"
                                        checked={column.formatOptions?.thousandsSeparator || false}
                                        onChange={(e) => {
                                          const newColumns = [...(element.config?.columns || [])];
                                          newColumns[index] = { 
                                            ...newColumns[index], 
                                            formatOptions: {
                                              ...newColumns[index].formatOptions,
                                              thousandsSeparator: e.target.checked
                                            }
                                          };
                                          updateElement(selectedElement, { 
                                            config: { 
                                              ...element.config, 
                                              columns: newColumns 
                                            } 
                                          });
                                        }}
                                        className="mr-1"
                                      />
                                      Separador de miles
                                    </label>
                                  </div>
                                )}
                                
                                {column.format === 'currency' && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700">Moneda:</label>
                                    <select
                                      value={column.formatOptions?.currency || 'MXN'}
                                      onChange={(e) => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          formatOptions: {
                                            ...newColumns[index].formatOptions,
                                            currency: e.target.value as any
                                          }
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded text-xs text-black"
                                    >
                                      <option value="MXN">Peso Mexicano ($)</option>
                                      <option value="USD">Dólar Americano ($)</option>
                                      <option value="EUR">Euro (€)</option>
                                    </select>
                                  </div>
                                )}
                                
                                {column.format === 'date' && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700">Formato:</label>
                                    <input
                                      type="text"
                                      value={column.formatOptions?.dateFormat || 'DD/MM/YYYY'}
                                      onChange={(e) => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          formatOptions: {
                                            ...newColumns[index].formatOptions,
                                            dateFormat: e.target.value
                                          }
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded text-xs text-black"
                                      placeholder="DD/MM/YYYY"
                                    />
                                  </div>
                                )}
                                
                                {column.format === 'datetime' && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700">Formato:</label>
                                    <input
                                      type="text"
                                      value={column.formatOptions?.dateFormat || 'DD/MM/YYYY HH:mm'}
                                      onChange={(e) => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          formatOptions: {
                                            ...newColumns[index].formatOptions,
                                            dateFormat: e.target.value
                                          }
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded text-xs text-black"
                                      placeholder="DD/MM/YYYY HH:mm"
                                    />
                                  </div>
                                )}
                                
                                {column.format === 'custom' && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700">Formato personalizado:</label>
                                    <input
                                      type="text"
                                      value={column.formatOptions?.customFormat || ''}
                                      onChange={(e) => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          formatOptions: {
                                            ...newColumns[index].formatOptions,
                                            customFormat: e.target.value
                                          }
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded text-xs text-black"
                                      placeholder="ej: {value} ({length} chars)"
                                    />
                                  </div>
                                )}
                                
                                {/* Valor por defecto */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700">Valor por defecto:</label>
                                  <input
                                    type="text"
                                    value={column.formatOptions?.defaultValue || ''}
                                    onChange={(e) => {
                                      const newColumns = [...(element.config?.columns || [])];
                                      newColumns[index] = { 
                                        ...newColumns[index], 
                                        formatOptions: {
                                          ...newColumns[index].formatOptions,
                                          defaultValue: e.target.value
                                        }
                                      };
                                      updateElement(selectedElement, { 
                                        config: { 
                                          ...element.config, 
                                          columns: newColumns 
                                        } 
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs text-black"
                                    placeholder="Valor cuando no hay datos"
                                  />
                                </div>
                                
                                {/* Transformaciones de texto */}
                                {(column.format === 'text' || !column.format) && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700">Transformación:</label>
                                    <select
                                      value={column.formatOptions?.transform || 'none'}
                                      onChange={(e) => {
                                        const newColumns = [...(element.config?.columns || [])];
                                        newColumns[index] = { 
                                          ...newColumns[index], 
                                          formatOptions: {
                                            ...newColumns[index].formatOptions,
                                            transform: e.target.value === 'none' ? undefined : e.target.value as any
                                          }
                                        };
                                        updateElement(selectedElement, { 
                                          config: { 
                                            ...element.config, 
                                            columns: newColumns 
                                          } 
                                        });
                                      }}
                                      className="w-full px-2 py-1 border rounded text-xs text-black"
                                    >
                                      <option value="none">Ninguna</option>
                                      <option value="truncate">Truncar</option>
                                      <option value="ellipsis">Con puntos suspensivos</option>
                                    </select>
                                    {(column.formatOptions?.transform === 'truncate' || column.formatOptions?.transform === 'ellipsis') && (
                                      <input
                                        type="number"
                                        min="1"
                                        value={column.formatOptions?.maxLength || 50}
                                        onChange={(e) => {
                                          const newColumns = [...(element.config?.columns || [])];
                                          newColumns[index] = { 
                                            ...newColumns[index], 
                                            formatOptions: {
                                              ...newColumns[index].formatOptions,
                                              maxLength: Number(e.target.value)
                                            }
                                          };
                                          updateElement(selectedElement, { 
                                            config: { 
                                              ...element.config, 
                                              columns: newColumns 
                                            } 
                                          });
                                        }}
                                        className="w-full px-2 py-1 border rounded text-xs text-black mt-1"
                                        placeholder="Longitud máxima"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newColumns = [...(element.config?.columns || []), { header: '', property: '' }];
                            updateElement(selectedElement, { 
                              config: { 
                                ...element.config, 
                                columns: newColumns 
                              } 
                            });
                          }}
                          className="w-full px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                        >
                          + Agregar Columna
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Visor de JSON */}
        {showJsonViewer && (
          <div className="w-80 bg-white shadow-lg p-4 border-l border-gray-200 overflow-y-auto max-h-screen">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Visor de JSON</h3>
              <button
                onClick={() => setShowJsonViewer(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div 
              className="json-container"
              dangerouslySetInnerHTML={{ __html: generateJsonViewerHTML() }}
            />
          </div>
        )}

        {/* Área de diseño */}
        <div className="flex-1 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 h-full">
            <h2 className="text-lg font-bold mb-4 text-black">Área de Diseño</h2>
            
            <div
              ref={canvasRef}
              className="border-2 border-dashed border-gray-300 bg-gray-50 relative"
              style={{ 
                width: `${convertWidth(ticketWidth, widthUnit)}px`,
                height: '600px',
                margin: '0 auto'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleCanvasClick}
            >
              {elements.map(element => (
                <div
                  key={element.id}
                  draggable
                  onDragStart={(e) => handleElementDragStart(e, element.id)}
                  onDragEnd={handleElementDragEnd}
                  onDrag={(e) => handleElementDrag(e, element.id)}
                  className={`absolute cursor-move ${
                    selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    backgroundColor: element.type === 'text' ? 'transparent' : 'transparent',
                    border: element.type === 'text' ? 'none' : '1px solid #ccc',
                    padding: '5px',
                    userSelect: 'none',
                    minHeight: element.type === 'table' ? '30px' : 'auto'
                  }}
                  onClick={() => handleElementClick(element.id)}
                >
                  {/* Indicador de relación */}
                  {element.relativeTo && (
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded pointer-events-none">
                      → {elements.find(el => el.id === element.relativeTo)?.type === 'text' ? 'Texto' : 'Tabla'}
                    </div>
                  )}
                  
                  {/* Indicador de selección y movimiento con teclado */}
                  {selectedElement === element.id && (
                    <div className="absolute -top-6 right-0 bg-green-500 text-white text-xs px-1 rounded pointer-events-none">
                      ⌨️ Mover con flechas
                    </div>
                  )}
                  
                  {/* Indicador de configuración de tabla */}
                  {element.type === 'table' && element.config?.dataPath && element.config?.columns?.length > 0 && (
                    <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded pointer-events-none">
                      📊 {element.config.columns.length} col(s) - {element.config.dataPath}
                    </div>
                  )}
                  
                  {element.type === 'text' ? (
                    <div className="relative w-full h-full">
                      <input
                        type="text"
                        value={element.content}
                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                        className="w-full h-full bg-transparent border-none outline-none text-black font-medium"
                        style={{ 
                          fontSize: `${element.fontSize || 14}px`, 
                          color: '#000000',
                          textAlign: element.textAlign || 'left'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder={currentJsonData ? "Texto... Usa {{propiedad}} para datos JSON" : "Texto..."}
                      />
                      {element.content.includes('{{') && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded">
                          JSON
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="text-xs h-full flex items-center justify-center text-black font-medium"
                      style={{ fontSize: `${element.fontSize || 12}px`, color: '#000000' }}
                    >
                      Tabla: {element.config?.columns?.length || 0} columnas
                    </div>
                  )}
                  
                  {/* Controles de redimensionamiento */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 opacity-50 hover:opacity-100"
                    onMouseDown={(e) => handleResizeStart(e, element.id)}
                  />
                  
                  {selectedElement === element.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600 flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área de vista previa */}
        {showPreview && (
          <div className="w-96 bg-white shadow-lg p-4 border-l border-gray-200 overflow-y-auto max-h-screen">
            <h3 className="text-lg font-bold mb-4 text-black">Vista Previa</h3>
            <div className="mb-4 text-sm text-black">
              <p>Vista previa del ticket final:</p>
              <div className="mt-2 text-xs text-gray-600">
                <p>Dimensiones: {convertWidth(ticketWidth, widthUnit)}px × {calculateContentHeight()}px</p>
                <p>Elementos: {elements.length}</p>
              </div>
            </div>
            <div className="border border-gray-300 rounded p-2 bg-gray-50">
              <iframe
                srcDoc={generatePreviewHTML()}
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
            <div className="mt-4 text-xs text-black">
              <p><strong>Nota:</strong> Esta es una vista previa con iframe. Los scripts se ejecutan correctamente y las tablas muestran datos dinámicos.</p>
              <p className="mt-1 text-gray-600">💡 Abre la consola del iframe (clic derecho → Inspeccionar) para ver los logs de depuración.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}