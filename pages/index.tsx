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
  const [hasCustomJson, setHasCustomJson] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
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
  }, [elements]); // Se ejecuta cuando cambian los elementos (posiciones, tamaños, etc.)

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
            const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
            const maxWidth = ticketWidthPx - element.x;
            newWidth = Math.min(maxWidth, element.width + step);
            
            // Debug: Mostrar información de límites en consola
            if (showDebug) {
              console.log('Keyboard Resize Debug:', {
                elementId: selectedElement,
                currentWidth: element.width,
                newWidth,
                maxWidth,
                ticketWidthPx,
                elementX: element.x,
                step,
                isLimited: element.width + step > maxWidth
              });
            }
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
            newHeight = Math.min(calculateContentHeight() - element.y, element.height + step);
          } else {
            // Solo flecha abajo = mover hacia abajo
            newY += step;
          }
          break;
        default:
          return;
      }

      // Mantener el elemento dentro de los límites del área de diseño
      const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
      const maxX = ticketWidthPx - newWidth;
      const maxY = calculateContentHeight() - newHeight;
      
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
        
        // En modo relativo, usar posiciones temporales y dejar que el useEffect calcule las posiciones finales
        let finalX = x;
        let finalY = y;
        
        if (relativeMode && elements.length > 0) {
          // Usar posiciones temporales, el useEffect se encargará de posicionar correctamente
          finalX = 0;
          finalY = 0;
        }
        
        const newElement: TicketElement = {
          id: `element-${Date.now()}`,
          type,
          x: finalX,
          y: finalY,
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
        
        // Mantener el elemento dentro de los límites del área de diseño (ancho del ticket)
        const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
        const maxX = ticketWidthPx - 50;
        const maxY = calculateContentHeight() - 50;
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

    // Limitar la posición dentro del área de diseño (ancho del ticket)
    const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
    const maxX = ticketWidthPx - element.width;
    const maxY = calculateContentHeight() - element.height;
    
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

    // Limitar el tamaño máximo al área de diseño (ancho del ticket)
    // Convertir ticketWidth a píxeles para la comparación
    const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
    const maxWidth = ticketWidthPx - element.x;
    const maxHeight = calculateContentHeight() - element.y;
    
    // Debug: Mostrar información de límites en consola
    if (showDebug) {
      console.log('Resize Debug:', {
        elementId: selectedElement,
        currentWidth: element.width,
        newWidth,
        maxWidth,
        ticketWidthPx,
        elementX: element.x,
        deltaX,
        isLimited: newWidth > maxWidth
      });
    }
    
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
          setHasCustomJson(true);
        } catch (error) {
          alert('Error al cargar el archivo JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateElement = (id: string, updates: Partial<TicketElement>) => {
    const updatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updatedElements);
    
    // Si se actualizó la posición o tamaño de un elemento, actualizar posiciones relativas
    if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
      // Usar setTimeout para asegurar que el estado se actualice primero
      setTimeout(() => {
        updateRelativePositions();
      }, 0);
    }
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
    
    // Buscar patrones como {{propiedad}} o {{ruta.propiedad}} o {{PropiedadPadre;PropiedadHijo;Condición}} o {{propiedad | formateador}}
    return content.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      try {
        // Verificar si hay formateador (sintaxis con |)
        let value: any = null;
        let formatter: string | null = null;
        
        if (path.includes('|')) {
          const [dataPath, formatPart] = path.split('|').map((s: string) => s.trim());
          formatter = formatPart;
          
          // Verificar si es la nueva sintaxis con punto y coma (búsqueda condicional)
          if (dataPath.includes(';')) {
            const parts = dataPath.split(';');
            if (parts.length >= 3) {
              const [arrayPath, propertyToGet, condition] = parts;
              
              // Obtener el arreglo
              const array = arrayPath.split('.').reduce((obj: any, key: string) => obj && obj[key], data);
              
              if (Array.isArray(array)) {
                // Buscar el elemento que cumpla la condición
                const foundItem = array.find((item: any) => {
                  // La condición puede ser "propiedad=valor" o "propiedad:valor"
                  const [conditionProp, conditionValue] = condition.includes('=') 
                    ? condition.split('=') 
                    : condition.split(':');
                  
                  const itemValue = conditionProp.split('.').reduce((obj: any, key: string) => obj && obj[key], item);
                  return String(itemValue) === conditionValue;
                });
                
                if (foundItem) {
                  // Obtener la propiedad específica del elemento encontrado
                  value = propertyToGet.split('.').reduce((obj: any, key: string) => obj && obj[key], foundItem);
                }
              }
            }
          } else {
            // Sintaxis original: {{propiedad}} o {{ruta.propiedad}}
            value = dataPath.split('.').reduce((obj: any, key: string) => obj && obj[key], data);
          }
        } else {
          // Sin formateador
          // Verificar si es la nueva sintaxis con punto y coma (búsqueda condicional)
          if (path.includes(';')) {
            const parts = path.split(';');
            if (parts.length >= 3) {
              const [arrayPath, propertyToGet, condition] = parts;
              
              // Obtener el arreglo
              const array = arrayPath.split('.').reduce((obj: any, key: string) => obj && obj[key], data);
              
              if (Array.isArray(array)) {
                // Buscar el elemento que cumpla la condición
                const foundItem = array.find((item: any) => {
                  // La condición puede ser "propiedad=valor" o "propiedad:valor"
                  const [conditionProp, conditionValue] = condition.includes('=') 
                    ? condition.split('=') 
                    : condition.split(':');
                  
                  const itemValue = conditionProp.split('.').reduce((obj: any, key: string) => obj && obj[key], item);
                  return String(itemValue) === conditionValue;
                });
                
                if (foundItem) {
                  // Obtener la propiedad específica del elemento encontrado
                  value = propertyToGet.split('.').reduce((obj: any, key: string) => obj && obj[key], foundItem);
                }
              }
            }
          } else {
            // Sintaxis original: {{propiedad}} o {{ruta.propiedad}}
            value = path.split('.').reduce((obj: any, key: string) => obj && obj[key], data);
          }
        }
        
        // Aplicar formateo si existe
        if (value !== undefined && value !== null) {
          if (formatter) {
            return formatValue(value, formatter);
          }
          return String(value);
        }
        
        return match; // Si no se encuentra, mantener el texto original
      } catch (error) {
        console.error('Error procesando referencia JSON:', path, error);
        return match; // Si hay error, mantener el texto original
      }
    });
  };

  // Función para formatear valores usando formateadores
  const formatValue = (value: any, formatter: string): string => {
    if (value === null || value === undefined) {
      return '';
    }

    try {
      switch (formatter.toLowerCase()) {
        case 'uppercase':
          return String(value).toUpperCase();

        case 'lowercase':
          return String(value).toLowerCase();

        case 'capitalize':
          return String(value).replace(/\b\w/g, l => l.toUpperCase());

        case 'number':
          const num = Number(value);
          if (isNaN(num)) return '0';
          return num.toFixed(0);

        case 'number:2':
          const num2 = Number(value);
          if (isNaN(num2)) return '0.00';
          return num2.toFixed(2);

        case 'currency':
          const currencyValue = Number(value);
          if (isNaN(currencyValue)) return '$0.00';
          return '$' + currencyValue.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

        case 'currency:mxn':
          const mxnValue = Number(value);
          if (isNaN(mxnValue)) return '$0.00';
          return '$' + mxnValue.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

        case 'currency:usd':
          const usdValue = Number(value);
          if (isNaN(usdValue)) return '$0.00';
          return '$' + usdValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

        case 'currency:eur':
          const eurValue = Number(value);
          if (isNaN(eurValue)) return '€0.00';
          return '€' + eurValue.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

        case 'percentage':
          const percentValue = Number(value);
          if (isNaN(percentValue)) return '0%';
          return percentValue.toFixed(0) + '%';

        case 'percentage:2':
          const percentValue2 = Number(value);
          if (isNaN(percentValue2)) return '0.00%';
          return percentValue2.toFixed(2) + '%';

        case 'date':
          if (!value) return '';
          const date = new Date(value);
          if (isNaN(date.getTime())) return '';
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;

        case 'date:yyyy-mm-dd':
          if (!value) return '';
          const date2 = new Date(value);
          if (isNaN(date2.getTime())) return '';
          return date2.toISOString().split('T')[0];

        case 'datetime':
          if (!value) return '';
          const dateTime = new Date(value);
          if (isNaN(dateTime.getTime())) return '';
          const day2 = dateTime.getDate().toString().padStart(2, '0');
          const month2 = (dateTime.getMonth() + 1).toString().padStart(2, '0');
          const year2 = dateTime.getFullYear();
          const hours = dateTime.getHours().toString().padStart(2, '0');
          const minutes = dateTime.getMinutes().toString().padStart(2, '0');
          return `${day2}/${month2}/${year2} ${hours}:${minutes}`;

        case 'truncate:20':
          const str = String(value);
          return str.length > 20 ? str.substring(0, 20) + '...' : str;

        case 'truncate:50':
          const str2 = String(value);
          return str2.length > 50 ? str2.substring(0, 50) + '...' : str2;

        case 'truncate:100':
          const str3 = String(value);
          return str3.length > 100 ? str3.substring(0, 100) + '...' : str3;

        default:
          // Formateador personalizado con parámetros
          if (formatter.startsWith('number:')) {
            const decimals = parseInt(formatter.split(':')[1]) || 0;
            const num = Number(value);
            if (isNaN(num)) return '0';
            return num.toFixed(decimals);
          }
          
          if (formatter.startsWith('currency:')) {
            const currency = formatter.split(':')[1]?.toUpperCase() || 'MXN';
            const currencyValue2 = Number(value);
            if (isNaN(currencyValue2)) return '$0.00';
            
            const currencySymbols: { [key: string]: string } = { USD: '$', MXN: '$', EUR: '€' };
            const symbol = currencySymbols[currency] || '$';
            const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'de-DE' : 'es-MX';
            
            return symbol + currencyValue2.toLocaleString(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
          
          if (formatter.startsWith('percentage:')) {
            const decimals = parseInt(formatter.split(':')[1]) || 0;
            const percentValue3 = Number(value);
            if (isNaN(percentValue3)) return '0%';
            return percentValue3.toFixed(decimals) + '%';
          }
          
          if (formatter.startsWith('truncate:')) {
            const maxLength = parseInt(formatter.split(':')[1]) || 50;
            const str4 = String(value);
            return str4.length > maxLength ? str4.substring(0, maxLength) + '...' : str4;
          }
          
          // Si no reconoce el formateador, devolver el valor original
          return String(value);
      }
    } catch (error) {
      console.error('Error aplicando formateador:', formatter, error);
      return String(value);
    }
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

  // Función global para copiar al portapapeles
  const copyToClipboard = (text: string, element: HTMLElement) => {
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
  };

  // Hacer la función disponible globalmente
  (window as any).copyToClipboard = copyToClipboard;

  const fallbackCopyToClipboard = (text: string, element: HTMLElement) => {
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

  // Función auxiliar para obtener elementos con posiciones relativas calculadas
  const getElementsWithRelativePositions = () => {
    return elements.map(element => {
      if (element.relativeTo && element.relativePosition) {
        const calculatedPosition = calculateRelativePosition(element);
        return { ...element, x: calculatedPosition.x, y: calculatedPosition.y };
      }
      return element;
    });
  };



  const generatePreviewHTML = () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    const elementsWithRelativePositions = getElementsWithRelativePositions();
    

    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .ticket {
            width: ${widthPx}px;
            border: none;
            position: relative;
            background: white;
            margin: 0;
            min-height: ${contentHeight}px;
            padding: 0;
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

    elementsWithRelativePositions.forEach(element => {
      const heightStyle = element.type === 'table' ? `min-height: ${element.height}px; height: auto;` : `height: ${element.height}px;`;
      const style = `left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; ${heightStyle}`;
      const fontSize = element.fontSize || (element.type === 'text' ? 14 : 12);
      
      if (element.type === 'text') {
        const processedContent = replaceJsonReferences(element.content, currentJsonData);
        html += `
        <div class="element text-element" data-element-id="${element.id}" style="${style} font-size: ${fontSize}px; color: #000000; position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; text-align: ${element.textAlign || 'left'}; display: flex; align-items: center; justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : element.textAlign === 'justify' ? 'stretch' : 'flex-start'};">${processedContent}</div>`;
      } else if (element.type === 'table') {
        const tableFontSize = element.config?.fontSize || 12;
        const showBorders = element.config?.showBorders !== false;
        const showHeader = element.config?.showHeader !== false;
        const showHeaderBackground = element.config?.showHeaderBackground !== false;
        const tableClass = showBorders ? 'table' : 'table no-borders';
        html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; min-height: 30px; height: auto;">
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
        
        // Función para ajustar posiciones relativas después de que las tablas se llenen
        function adjustRelativePositions() {
            console.log('Ajustando posiciones relativas...');
            
            // Obtener todos los elementos con posiciones relativas
            const relativeElements = ${JSON.stringify(elements.filter(el => el.relativeTo && el.relativePosition))};
            
            relativeElements.forEach(element => {
                const elementEl = document.querySelector(\`[data-element-id="\${element.id}"]\`);
                if (!elementEl) return;
                
                const referenceEl = document.querySelector(\`[data-element-id="\${element.relativeTo}"]\`);
                if (!referenceEl) return;
                
                // Obtener las dimensiones reales del elemento de referencia
                const referenceRect = referenceEl.getBoundingClientRect();
                const ticketRect = document.querySelector('.ticket').getBoundingClientRect();
                
                // Calcular posición relativa basada en las dimensiones reales
                const offset = element.relativeOffset || { x: 0, y: 0 };
                let newX = referenceRect.left - ticketRect.left;
                let newY = referenceRect.top - ticketRect.top;
                
                switch (element.relativePosition) {
                    case 'below':
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        newX = referenceRect.left - ticketRect.left + offset.x;
                        break;
                    case 'above':
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        newX = referenceRect.left - ticketRect.left + offset.x;
                        break;
                    case 'left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.top - ticketRect.top + offset.y;
                        break;
                    case 'right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.top - ticketRect.top + offset.y;
                        break;
                    case 'bottom-right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        break;
                    case 'bottom-left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        break;
                    case 'top-right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        break;
                    case 'top-left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        break;
                    case 'center':
                        newX = referenceRect.left - ticketRect.left + (referenceRect.width - elementEl.offsetWidth) / 2 + offset.x;
                        newY = referenceRect.top - ticketRect.top + (referenceRect.height - elementEl.offsetHeight) / 2 + offset.y;
                        break;
                }
                
                // Aplicar la nueva posición
                elementEl.style.left = newX + 'px';
                elementEl.style.top = newY + 'px';
                
                console.log('Elemento', element.id, 'reposicionado a:', newX, newY);
            });
        }
        
        // Ejecutar inmediatamente y también cuando el DOM esté listo
        console.log('Script de vista previa cargado');
        processAllTables();
        
        // Ajustar posiciones después de que las tablas se llenen
        setTimeout(() => {
            adjustRelativePositions();
        }, 200);
        
        // También ejecutar cuando el DOM esté listo por si acaso
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                processAllTables();
                setTimeout(adjustRelativePositions, 200);
            });
        } else {
            // DOM ya está listo, ejecutar inmediatamente
            setTimeout(() => {
                processAllTables();
                setTimeout(adjustRelativePositions, 200);
            }, 100);
        }
    </script>`;

    return html;
  };

  const generateHTML = () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    const elementsWithRelativePositions = getElementsWithRelativePositions();
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .ticket {
            width: ${widthPx}px;
            border: none;
            position: relative;
            background: white;
            margin: 0 auto;
            min-height: ${contentHeight}px;
            padding: 0;
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

    elementsWithRelativePositions.forEach(element => {
      const heightStyle = element.type === 'table' ? `min-height: ${element.height}px; height: auto;` : `height: ${element.height}px;`;
      const style = `left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; ${heightStyle}`;
      const fontSize = element.fontSize || (element.type === 'text' ? 14 : 12);
      
      if (element.type === 'text') {
        // Mantener los placeholders originales en lugar de procesarlos
        const templateContent = element.content;
        html += `\n        <div class="element text-element" data-element-id="${element.id}" style="${style} font-size: ${fontSize}px; color: #000000; text-align: ${element.textAlign || 'left'}; display: flex; align-items: center; justify-content: ${element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : element.textAlign === 'justify' ? 'stretch' : 'flex-start'}; border: none;">${templateContent}</div>`;
      } else if (element.type === 'table') {
        const tableFontSize = element.config?.fontSize || 12;
        const showBorders = element.config?.showBorders !== false;
        const showHeader = element.config?.showHeader !== false;
        const showHeaderBackground = element.config?.showHeaderBackground !== false;
        const tableClass = showBorders ? 'table' : 'table no-borders';
        html += `\n        <div class="element table-element" data-element-id="${element.id}" style="${style} min-height: 30px; height: auto;">`;
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
                    // Verificar si hay formateador (sintaxis con |)
                    let value = null;
                    let formatter = null;
                    
                    if (path.includes('|')) {
                        const parts = path.split('|').map(s => s.trim());
                        const dataPath = parts[0];
                        formatter = parts[1];
                        
                        // Verificar si es la nueva sintaxis con punto y coma (búsqueda condicional)
                        if (dataPath.includes(';')) {
                            const pathParts = dataPath.split(';');
                            if (pathParts.length >= 3) {
                                const [arrayPath, propertyToGet, condition] = pathParts;
                                
                                // Obtener el arreglo
                                const array = getValueByPath(data, arrayPath);
                                
                                if (Array.isArray(array)) {
                                    // Buscar el elemento que cumpla la condición
                                    const foundItem = array.find((item) => {
                                        // La condición puede ser "propiedad=valor" o "propiedad:valor"
                                        const [conditionProp, conditionValue] = condition.includes('=') 
                                            ? condition.split('=') 
                                            : condition.split(':');
                                        
                                        const itemValue = getValueByPath(item, conditionProp);
                                        return String(itemValue) === conditionValue;
                                    });
                                    
                                    if (foundItem) {
                                        // Obtener la propiedad específica del elemento encontrado
                                        value = getValueByPath(foundItem, propertyToGet);
                                    }
                                }
                            }
                        } else {
                            // Sintaxis original: {{propiedad}} o {{ruta.propiedad}}
                            value = getValueByPath(data, dataPath);
                        }
                    } else {
                        // Sin formateador
                        // Verificar si es la nueva sintaxis con punto y coma (búsqueda condicional)
                        if (path.includes(';')) {
                            const parts = path.split(';');
                            if (parts.length >= 3) {
                                const [arrayPath, propertyToGet, condition] = parts;
                                
                                // Obtener el arreglo
                                const array = getValueByPath(data, arrayPath);
                                
                                if (Array.isArray(array)) {
                                    // Buscar el elemento que cumpla la condición
                                    const foundItem = array.find((item) => {
                                        // La condición puede ser "propiedad=valor" o "propiedad:valor"
                                        const [conditionProp, conditionValue] = condition.includes('=') 
                                            ? condition.split('=') 
                                            : condition.split(':');
                                        
                                        const itemValue = getValueByPath(item, conditionProp);
                                        return String(itemValue) === conditionValue;
                                    });
                                    
                                    if (foundItem) {
                                        // Obtener la propiedad específica del elemento encontrado
                                        value = getValueByPath(foundItem, propertyToGet);
                                    }
                                }
                            }
                        } else {
                            // Sintaxis original: {{propiedad}} o {{ruta.propiedad}}
                            value = getValueByPath(data, path);
                        }
                    }
                    
                    // Aplicar formateo si existe
                    if (value !== undefined && value !== null) {
                        if (formatter) {
                            return formatValue(value, formatter);
                        }
                        return String(value);
                    }
                    
                    return match; // Si no se encuentra, mantener el texto original
                } catch (error) {
                    console.error('Error al reemplazar placeholder:', path, error);
                    return match;
                }
            });
        }
        
        // Función para formatear valores usando formateadores
        function formatValue(value, formatter) {
            if (value === null || value === undefined) {
                return '';
            }

            try {
                switch (formatter.toLowerCase()) {
                    case 'uppercase':
                        return String(value).toUpperCase();

                    case 'lowercase':
                        return String(value).toLowerCase();

                    case 'capitalize':
                        return String(value).replace(/\\b\\w/g, l => l.toUpperCase());

                    case 'number':
                        const num = Number(value);
                        if (isNaN(num)) return '0';
                        return num.toFixed(0);

                    case 'number:2':
                        const num2 = Number(value);
                        if (isNaN(num2)) return '0.00';
                        return num2.toFixed(2);

                    case 'currency':
                        const currencyValue = Number(value);
                        if (isNaN(currencyValue)) return '$0.00';
                        return '$' + currencyValue.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'currency:mxn':
                        const mxnValue = Number(value);
                        if (isNaN(mxnValue)) return '$0.00';
                        return '$' + mxnValue.toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'currency:usd':
                        const usdValue = Number(value);
                        if (isNaN(usdValue)) return '$0.00';
                        return '$' + usdValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'currency:eur':
                        const eurValue = Number(value);
                        if (isNaN(eurValue)) return '€0.00';
                        return '€' + eurValue.toLocaleString('de-DE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });

                    case 'percentage':
                        const percentValue = Number(value);
                        if (isNaN(percentValue)) return '0%';
                        return percentValue.toFixed(0) + '%';

                    case 'percentage:2':
                        const percentValue2 = Number(value);
                        if (isNaN(percentValue2)) return '0.00%';
                        return percentValue2.toFixed(2) + '%';

                    case 'date':
                        if (!value) return '';
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return '';
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const year = date.getFullYear();
                        return day + '/' + month + '/' + year;

                    case 'date:yyyy-mm-dd':
                        if (!value) return '';
                        const date2 = new Date(value);
                        if (isNaN(date2.getTime())) return '';
                        return date2.toISOString().split('T')[0];

                    case 'datetime':
                        if (!value) return '';
                        const dateTime = new Date(value);
                        if (isNaN(dateTime.getTime())) return '';
                        const day2 = dateTime.getDate().toString().padStart(2, '0');
                        const month2 = (dateTime.getMonth() + 1).toString().padStart(2, '0');
                        const year2 = dateTime.getFullYear();
                        const hours = dateTime.getHours().toString().padStart(2, '0');
                        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
                        return day2 + '/' + month2 + '/' + year2 + ' ' + hours + ':' + minutes;

                    case 'truncate:20':
                        const str = String(value);
                        return str.length > 20 ? str.substring(0, 20) + '...' : str;

                    case 'truncate:50':
                        const str2 = String(value);
                        return str2.length > 50 ? str2.substring(0, 50) + '...' : str2;

                    case 'truncate:100':
                        const str3 = String(value);
                        return str3.length > 100 ? str3.substring(0, 100) + '...' : str3;

                    default:
                        // Formateador personalizado con parámetros
                        if (formatter.startsWith('number:')) {
                            const decimals = parseInt(formatter.split(':')[1]) || 0;
                            const num = Number(value);
                            if (isNaN(num)) return '0';
                            return num.toFixed(decimals);
                        }
                        
                        if (formatter.startsWith('currency:')) {
                            const currency = formatter.split(':')[1]?.toUpperCase() || 'MXN';
                            const currencyValue2 = Number(value);
                            if (isNaN(currencyValue2)) return '$0.00';
                            
                            const currencySymbols = { USD: '$', MXN: '$', EUR: '€' };
                            const symbol = currencySymbols[currency] || '$';
                            const locale = currency === 'USD' ? 'en-US' : currency === 'EUR' ? 'de-DE' : 'es-MX';
                            
                            return symbol + currencyValue2.toLocaleString(locale, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                        
                        if (formatter.startsWith('percentage:')) {
                            const decimals = parseInt(formatter.split(':')[1]) || 0;
                            const percentValue3 = Number(value);
                            if (isNaN(percentValue3)) return '0%';
                            return percentValue3.toFixed(decimals) + '%';
                        }
                        
                        if (formatter.startsWith('truncate:')) {
                            const maxLength = parseInt(formatter.split(':')[1]) || 50;
                            const str4 = String(value);
                            return str4.length > maxLength ? str4.substring(0, maxLength) + '...' : str4;
                        }
                        
                        // Si no reconoce el formateador, devolver el valor original
                        return String(value);
                }
            } catch (error) {
                console.error('Error aplicando formateador:', formatter, error);
                return String(value);
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
            
            // Ajustar posiciones relativas después de que las tablas se llenen
            setTimeout(adjustRelativePositions, 200);
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
        
        // ===== AJUSTE DE POSICIONES RELATIVAS =====
        // Función para ajustar posiciones relativas después de que las tablas se llenen
        function adjustRelativePositions() {
            console.log('Ajustando posiciones relativas en HTML generado...');
            
            // Obtener todos los elementos con posiciones relativas
            const relativeElements = ${JSON.stringify(elements.filter(el => el.relativeTo && el.relativePosition))};
            
            relativeElements.forEach(element => {
                const elementEl = document.querySelector(\`[data-element-id="\${element.id}"]\`);
                if (!elementEl) return;
                
                const referenceEl = document.querySelector(\`[data-element-id="\${element.relativeTo}"]\`);
                if (!referenceEl) return;
                
                // Obtener las dimensiones reales del elemento de referencia
                const referenceRect = referenceEl.getBoundingClientRect();
                const ticketRect = document.querySelector('.ticket').getBoundingClientRect();
                
                // Calcular posición relativa basada en las dimensiones reales
                const offset = element.relativeOffset || { x: 0, y: 0 };
                let newX = referenceRect.left - ticketRect.left;
                let newY = referenceRect.top - ticketRect.top;
                
                switch (element.relativePosition) {
                    case 'below':
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        newX = referenceRect.left - ticketRect.left + offset.x;
                        break;
                    case 'above':
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        newX = referenceRect.left - ticketRect.left + offset.x;
                        break;
                    case 'left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.top - ticketRect.top + offset.y;
                        break;
                    case 'right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.top - ticketRect.top + offset.y;
                        break;
                    case 'bottom-right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        break;
                    case 'bottom-left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.bottom - ticketRect.top + offset.y;
                        break;
                    case 'top-right':
                        newX = referenceRect.right - ticketRect.left + offset.x;
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        break;
                    case 'top-left':
                        newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                        newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                        break;
                    case 'center':
                        newX = referenceRect.left - ticketRect.left + (referenceRect.width - elementEl.offsetWidth) / 2 + offset.x;
                        newY = referenceRect.top - ticketRect.top + (referenceRect.height - elementEl.offsetHeight) / 2 + offset.y;
                        break;
                }
                
                // Aplicar la nueva posición
                elementEl.style.left = newX + 'px';
                elementEl.style.top = newY + 'px';
                
                console.log('Elemento', element.id, 'reposicionado a:', newX, newY);
            });
        }
        
        // ===== DATOS DE EJEMPLO (OPCIONAL) =====
                 // Descomenta las siguientes líneas para usar datos de ejemplo:
         
         const datosEjemplo = @@JSON@@;
         document.addEventListener('DOMContentLoaded', function() {
             processTicketTemplate(datosEjemplo);
             // Ajustar posiciones después de procesar la plantilla
             setTimeout(adjustRelativePositions, 200);
         });
         
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
    setHasCustomJson(false);
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
    let hasChanges = false;
    const updatedElements = elements.map(element => {
      if (element.relativeTo && element.relativePosition) {
        const newPosition = calculateRelativePosition(element);
        // Solo actualizar si la posición realmente cambió
        if (Math.abs(newPosition.x - element.x) > 0.1 || Math.abs(newPosition.y - element.y) > 0.1) {
          hasChanges = true;
          return { ...element, x: newPosition.x, y: newPosition.y };
        }
      }
      return element;
    });
    
    // Solo actualizar el estado si hubo cambios reales
    if (hasChanges) {
      setElements(updatedElements);
    }
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
            <h2>🔤 Sintaxis de Placeholders</h2>
            <p>La plantilla soporta dos tipos de sintaxis para acceder a datos JSON:</p>
            
            <h3>1. Sintaxis Básica</h3>
            <p>Para acceder a propiedades simples o anidadas:</p>
            <div class="code-block">
{{empresa.nombre}}           // "Mi Empresa S.A."
{{venta.total}}             // 1250.75
{{productos.items.0.nombre}} // "Laptop HP Pavilion"
            </div>
            
            <h3>2. Sintaxis de Búsqueda Condicional</h3>
            <p>Para buscar elementos en arreglos basándose en condiciones:</p>
            <div class="code-block">
{{arreglo;propiedad;condición=valor}}

// Ejemplos:
{{productos.items;nombre;codigo=PROD001}}     // Busca item con codigo=PROD001 y obtiene su nombre
{{productos.items;precio;categoria=Electronics}} // Busca item con categoria=Electronics y obtiene su precio
{{empleados;nombre;id=EMP001}}                // Busca empleado con id=EMP001 y obtiene su nombre
            </div>
            
            <h3>3. Sintaxis de Formateo</h3>
            <p>Para aplicar formateo a los valores usando la sintaxis <code>|</code>:</p>
            <div class="code-block">
{{propiedad | formateador}}

// Ejemplos de formateo:
{{venta.total | currency}}                    // $1,250.75
{{empresa.nombre | uppercase}}                // MI EMPRESA S.A.
{{venta.fecha | date}}                        // 15/01/2024
{{productos.items;precio;codigo=PROD001 | currency}} // $899.99

// Formateadores disponibles:
// - uppercase, lowercase, capitalize
// - number, number:2 (con decimales)
// - currency, currency:mxn, currency:usd, currency:eur
// - percentage, percentage:2
// - date, date:yyyy-mm-dd, datetime
// - truncate:20, truncate:50, truncate:100
            </div>
            
            <h4>Formato de la condición:</h4>
            <ul>
                <li><strong>propiedad=valor</strong> - Busca elementos donde la propiedad sea igual al valor</li>
                <li><strong>propiedad:valor</strong> - Alternativa usando dos puntos</li>
            </ul>
            
            <h4>Ejemplo completo:</h4>
            <div class="code-block">
// Datos JSON:
{
    "productos": {
        "items": [
            {"codigo": "PROD001", "nombre": "Laptop", "precio": 899.99},
            {"codigo": "PROD002", "nombre": "Mouse", "precio": 25.50}
        ]
    }
}

// En el texto del ticket:
Producto: {{productos.items;nombre;codigo=PROD001}}  // Resultado: "Laptop"
Precio: {{productos.items;precio;codigo=PROD001}}    // Resultado: "899.99"
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
        setHasCustomJson(!!projectConfig.jsonData); // Establecer si hay JSON personalizado
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

  // Funciones para drag and drop de archivos JSON
  const handleJsonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleJsonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          setJsonData(jsonData);
          setHasCustomJson(true);
        } catch (error) {
          console.error('Error al cargar el archivo JSON:', error);
          alert('❌ Error al cargar el archivo JSON. Verifica que el archivo sea válido.');
        }
      };
      reader.readAsText(jsonFile);
    } else {
      alert('❌ Por favor, arrastra un archivo JSON válido.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Editor de Tickets</title>
      </Head>

      {/* Toolbar flotante superior */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg border border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2 rounded text-lg transition-colors relative group ${
              showPreview 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
          >
            👁️
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {showPreview ? 'Ocultar Vista Previa' : 'Mostrar Vista Previa'}
            </div>
          </button>
          
          <button
            onClick={generateHTML}
            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 text-lg relative group"
            title="Generar Plantilla HTML"
          >
            💾
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Generar Plantilla HTML
            </div>
          </button>
          
          <button
            onClick={clearCanvas}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 text-lg relative group"
            title="Limpiar Todo"
          >
            🗑️
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Limpiar Todo
            </div>
          </button>
          
          <button
            onClick={generateExampleUsage}
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-lg relative group"
            title="Ejemplo de uso"
          >
            📚
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ejemplo de uso
            </div>
          </button>
          
          {/* Exportar/Importar Configuración */}
          <button
            onClick={exportProjectConfig}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-lg relative group"
            title="Exportar Proyecto"
          >
            💾
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Exportar Proyecto
            </div>
          </button>
          
          <div className="relative group">
            <input
              type="file"
              accept=".json"
              onChange={importProjectConfig}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Importar Proyecto"
            />
            <button
              className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-lg"
            >
              📂
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Importar Proyecto
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
            className="p-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-lg relative group"
            title="Actualizar Tablas"
          >
            🔄
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Actualizar Tablas
            </div>
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
            className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-lg relative group"
            title="Ver Logs"
          >
            📋
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ver Logs
            </div>
          </button>
          
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 rounded text-lg relative group transition-colors ${
              showDebug 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
            title={showDebug ? 'Ocultar Debugging' : 'Mostrar Debugging'}
          >
            🐛
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {showDebug ? 'Ocultar Debugging' : 'Mostrar Debugging'}
            </div>
          </button>
        </div>
      </div>

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
            <div className="text-xs text-gray-600 mt-1 group relative">
              <span className="cursor-help">💡 Al cambiar la unidad, el valor se convierte automáticamente</span>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                📏 Conversiones: 1 pulgada = 96px, 1 cm = 37.795px
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
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
            
            {/* Selector de archivo personalizado */}
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="json-file-input"
              />
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                onDragOver={handleJsonDragOver}
                onDrop={handleJsonDrop}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                      Seleccionar archivo JSON
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Arrastra aquí o haz clic para buscar
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado del archivo cargado */}
            {hasCustomJson && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-green-700 font-medium">JSON cargado correctamente</span>
                </div>
                
                <button
                  onClick={() => setShowJsonViewer(!showJsonViewer)}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    showJsonViewer 
                      ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{showJsonViewer ? 'Ocultar Propiedades' : 'Ver Propiedades JSON'}</span>
                </button>
              </div>
            )}

            {/* Enlace de ejemplo */}
            <div className="mt-3">
              <a 
                href="/ejemplo-datos.json" 
                download
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar ejemplo JSON</span>
              </a>
            </div>
          </div>

          {/* Herramientas de posicionamiento */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 text-black">Posicionamiento:</h3>
            <button
              onClick={() => setRelativeMode(!relativeMode)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                relativeMode 
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                  : 'bg-gray-500 text-white hover:bg-gray-600 shadow-md'
              }`}
            >
              {relativeMode ? '✓ Modo Relativo Activo' : '🔗 Activar Posicionamiento Relativo'}
            </button>
            {relativeMode && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Modo relativo activo</p>
                    <ul className="space-y-1 text-green-700">
                      <li>• Los nuevos elementos se posicionan automáticamente</li>
                      <li>• Se colocan debajo del último elemento</li>
                      <li>• Mover un elemento actualiza los relacionados</li>
                      <li>• Configurar relaciones en las propiedades</li>
                    </ul>
                  </div>
                </div>
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
                  {/* Posición X/Y */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1 text-black">
                      Posición (píxeles):
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">X:</label>
                        <input
                          type="number"
                          value={element.x}
                          onChange={(e) => updateElement(selectedElement, { x: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Y:</label>
                        <input
                          type="number"
                          value={element.y}
                          onChange={(e) => updateElement(selectedElement, { y: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tamaño */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1 text-black">
                      Tamaño (píxeles):
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Ancho:</label>
                        <input
                          type="number"
                          value={element.width}
                          onChange={(e) => updateElement(selectedElement, { width: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                          placeholder="150"
                          max={convertWidth(ticketWidth, widthUnit) - element.x}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Alto:</label>
                        <input
                          type="number"
                          value={element.height}
                          onChange={(e) => updateElement(selectedElement, { height: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded text-xs text-black"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de límites */}
                  {showDebug && (
                    <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="text-xs text-blue-800">
                        <div><strong>Límites del ticket:</strong></div>
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
                              className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${
                                element.textAlign === align 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                              title={`Alinear ${align === 'left' ? 'izquierda' : align === 'center' ? 'centro' : align === 'right' ? 'derecha' : 'justificar'}`}
                            >
                              {align === 'left' ? '←' : align === 'center' ? '↔' : align === 'right' ? '→' : '⟷'}
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
              {/* Debug overlay - mostrar información de límites */}
              {showDebug && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded pointer-events-none z-10">
                  <div>Ticket Width: {ticketWidth} {widthUnit} ({convertWidth(ticketWidth, widthUnit)}px)</div>
                  <div>Canvas Width: {convertWidth(ticketWidth, widthUnit)}px</div>
                  {selectedElement && (
                    <div>
                      Selected: {selectedElement}
                      <br />
                      X: {elements.find(el => el.id === selectedElement)?.x}px
                      <br />
                      Width: {elements.find(el => el.id === selectedElement)?.width}px
                      <br />
                      Max Width: {convertWidth(ticketWidth, widthUnit) - (elements.find(el => el.id === selectedElement)?.x || 0)}px
                    </div>
                  )}
                </div>
              )}
              
              {/* Línea de límite derecho del ticket */}
              {showDebug && (
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-red-500 opacity-50 pointer-events-none"
                  style={{ 
                    left: `${convertWidth(ticketWidth, widthUnit)}px`,
                    zIndex: 5
                  }}
                />
              )}
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
                    minHeight: element.type === 'table' ? '30px' : 'auto',
                    boxShadow: showDebug && element.width >= convertWidth(ticketWidth, widthUnit) - element.x 
                      ? '0 0 0 2px rgba(239, 68, 68, 0.5)' 
                      : 'none'
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
                        placeholder={currentJsonData ? "Texto... Usa {{propiedad}} o {{arreglo;propiedad;condición=valor}} o {{propiedad | formateador}} para datos JSON" : "Texto..."}
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
                    className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${
                      showDebug && element.width >= convertWidth(ticketWidth, widthUnit) - element.x 
                        ? 'bg-red-500' 
                        : 'bg-blue-500'
                    } opacity-50 hover:opacity-100 group`}
                    onMouseDown={(e) => handleResizeStart(e, element.id)}
                    title={showDebug ? `Ancho actual: ${element.width}px | Máximo: ${convertWidth(ticketWidth, widthUnit) - element.x}px` : "Redimensionar"}
                  />
                  {/* Tooltip de información de límites */}
                  {showDebug && (
                    <div className="absolute -top-8 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {element.width}px / {convertWidth(ticketWidth, widthUnit) - element.x}px
                    </div>
                  )}
                  
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