import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { Canvas, Header, ImportSuccessModal, JsonViewer, PreviewPanel, ProjectNameModal, PropertiesPanel, Sidebar, StartupModal, Toolbar } from '@/components';
import { TicketElement, defaultJsonData, FormulaConfig, TableColumn, ProjectConfig } from '@/components/types';

export default function TicketEditor() {
  const [ticketWidth, setTicketWidth] = useState(300);
  const [widthUnit, setWidthUnit] = useState<'px' | 'in' | 'cm'>('px');
  const [elements, setElements] = useState<TicketElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showProperties, setShowProperties] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [relativeMode, setRelativeMode] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [hasCustomJson, setHasCustomJson] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Nuevos estados para el popup de inicio y gestión de proyectos
  const [showStartupModal, setShowStartupModal] = useState(true);
  const [projectName, setProjectName] = useState('Mi Proyecto de Ticket');
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [showImportSuccessModal, setShowImportSuccessModal] = useState(false);
  const [importedProjectInfo, setImportedProjectInfo] = useState<any>(null);
  
  // Estados para redimensionamiento de sidebars
  const [sidebarWidth, setSidebarWidth] = useState(344); // w-86 = 344px
  const [propertiesWidth, setPropertiesWidth] = useState(384); // w-96 = 384px
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingProperties, setIsResizingProperties] = useState(false);
  
  // Estados para ocultar/mostrar sidebar y submenús
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showElementsMenu, setShowElementsMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  
  // Usar datos cargados o datos por defecto
  const currentJsonData = jsonData || defaultJsonData;

  // Cargar configuración de localStorage al iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem('ticketEditorConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.sidebarWidth) setSidebarWidth(config.sidebarWidth);
        if (config.propertiesWidth) setPropertiesWidth(config.propertiesWidth);
        if (config.showPreview !== undefined) setShowPreview(config.showPreview);
        if (config.showDebug !== undefined) setShowDebug(config.showDebug);
        if (config.sidebarHidden !== undefined) setSidebarHidden(config.sidebarHidden);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }, []);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    const config = {
      sidebarWidth,
      propertiesWidth,
      showPreview,
      showDebug,
      sidebarHidden
    };
    localStorage.setItem('ticketEditorConfig', JSON.stringify(config));
  }, [sidebarWidth, propertiesWidth, showPreview, showDebug, sidebarHidden]);

  // Cerrar submenús cuando se haga clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.toolbar-submenu')) {
        setShowSizeMenu(false);
        setShowElementsMenu(false);
        setShowInfoMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Actualizar posiciones relativas cuando cambien los elementos
  useEffect(() => {
    updateRelativePositions();
  }, [elements]);

  // Actualizar preview HTML cuando cambien los elementos o datos JSON
  useEffect(() => {
    if (showPreview) {
      generatePreviewHTML().then(html => {
        setPreviewHTML(html);
      });
    }
  }, [elements, currentJsonData, showPreview]); // Se ejecuta cuando cambian los elementos (posiciones, tamaños, etc.)

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
        case 'Delete':
          if (e.shiftKey) {
          e.preventDefault();
          deleteElement(selectedElement);
          return;
          }
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
              const type = elementType.replace('new-', '') as 'text' | 'table' | 'qr' | 'image' | 'formula';
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
          width: type === 'text' ? 150 : type === 'qr' ? 100 : type === 'image' ? 150 : type === 'formula' ? 150 : 200,
          height: type === 'text' ? 30 : type === 'qr' ? 100 : type === 'image' ? 150 : type === 'formula' ? 30 : 100,
          content: type === 'text' ? 'Texto de ejemplo' : type === 'qr' ? 'https://ejemplo.com' : type === 'image' ? 'Seleccionar imagen...' : type === 'formula' ? 'JavaScript code' : '',
          fontSize: type === 'text' ? 14 : 12,
          textAlign: type === 'text' ? 'left' : undefined,
          config: type === 'table' ? {
            dataPath: '',
            columns: [],
            fontSize: 12,
            showBorders: true,
            showHeader: true
          } : type === 'image' ? {
            base64Data: undefined,
            originalName: undefined,
            mimeType: undefined,
            maintainAspectRatio: true,
            objectFit: 'contain'
          } : type === 'formula' ? {
            javascriptCode: '',
            outputFormat: 'text',
            errorHandling: 'show-default',
            defaultValue: '',
            timeout: 5000
          } : undefined,
          ...relativeConfig
        };
        
        setElements([...elements, newElement]);
        
        // Cerrar el menú de elementos cuando se arrastra y suelta un elemento
        setShowElementsMenu(false);
      }
    } else if (elementType.startsWith('move-')) {
      const elementId = elementType.replace('move-', '');
      const rect = canvasRef.current?.getBoundingClientRect();
      const element = elements.find(el => el.id === elementId);
      
      if (rect && element) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Mantener el elemento dentro de los límites del área de diseño (ancho del ticket)
        const ticketWidthPx = convertWidth(ticketWidth, widthUnit);
        const maxX = ticketWidthPx - element.width;
        const maxY = calculateContentHeight() - element.height;
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
    setSelectedElement(elementId);
    e.dataTransfer.setData('text/plain', `move-${elementId}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleElementDragEnd = () => {
    // Drag operation completed
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

    // Mantener proporción de aspecto para imágenes si está habilitado
    if (element.type === 'image' && element.config?.maintainAspectRatio && element.width > 0 && element.height > 0) {
      const aspectRatio = element.width / element.height;
      const finalWidth = newWidth;
      const finalHeight = finalWidth / aspectRatio;
      
      if (finalHeight <= maxHeight) {
        updateElement(selectedElement, { width: finalWidth, height: finalHeight });
      } else {
        const adjustedHeight = maxHeight;
        const adjustedWidth = adjustedHeight * aspectRatio;
        updateElement(selectedElement, { width: adjustedWidth, height: adjustedHeight });
      }
    } else {
      updateElement(selectedElement, { width: newWidth, height: newHeight });
    }
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
        generatePreviewHTML().then(html => {
          previewContainer.innerHTML = html;
        });
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
        
        return ''; // Si no se encuentra, retornar cadena vacía
      } catch (error) {
        console.error('Error procesando referencia JSON:', path, error);
        return match; // Si hay error, mantener el texto original
      }
    });
  };

  const executeFormula = async (element: TicketElement, data: any): Promise<string> => {
    if (element.type !== 'formula' || !element.config?.javascriptCode) {
      return '';
    }

    const config = element.config as FormulaConfig;
    const code = config.javascriptCode.trim();

    if (!code) {
      return config.defaultValue || '';
    }

    try {
      const executeWithTimeout = (code: string, timeout: number): Promise<any> => {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Execution timeout'));
          }, timeout);

          try {
            const safeFunction = new Function('data', 'Math', 'String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', code);

            const result = safeFunction(
              data,
              Math,
              String,
              Number,
              Boolean,
              Array,
              Object,
              Date,
              parseInt,
              parseFloat,
              isNaN,
              isFinite
            );

            clearTimeout(timeoutId);
            resolve(result);
          } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
          }
        });
      };

      const result = await executeWithTimeout(code, config.timeout || 5000);

      switch (config.outputFormat) {
        case 'number':
          return typeof result === 'number' ? result.toString() : config.defaultValue || '0';
        case 'boolean':
          return typeof result === 'boolean' ? result.toString() : config.defaultValue || 'false';
        case 'json':
          return typeof result === 'object' ? JSON.stringify(result) : config.defaultValue || '{}';
        case 'text':
        default:
          return result !== undefined && result !== null ? result.toString() : config.defaultValue || '';
      }
    } catch (error) {
      console.error('Error executing formula:', error);

      switch (config.errorHandling) {
        case 'show-error':
          return `Error: ${(error as Error).message}`;
        case 'hide-error':
          return '';
        case 'show-default':
        default:
          return config.defaultValue || '';
      }
    }
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

  // Hacer la función disponible globalmente (solo en el navegador)
  if (typeof window !== 'undefined') {
    (window as any).copyToClipboard = copyToClipboard;
  }

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
      if (element.relativeTo && (element.relativePosition || element.relativeVertical || element.relativeHorizontal)) {
        const calculatedPosition = calculateRelativePosition(element);
        return { ...element, x: calculatedPosition.x, y: calculatedPosition.y };
      }
      return element;
    });
  };



  const generatePreviewHTML = async () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    const elementsWithRelativePositions = getElementsWithRelativePositions();
    

    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="/qrcode.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        
        /* Scrollbar personalizada para el iframe de vista previa */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
        
        ::-webkit-scrollbar-corner {
            background: #f8fafc;
        }
        
        /* Scrollbar para Firefox */
        * {
            scrollbar-width: thin;
            scrollbar-color: #e2e8f0 #f8fafc;
        }
        .ticket {
            width: ${widthPx}px;
            border: none;
            position: relative;
            
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
        .qr-code {
            display: inline-block;
            background: white;
            padding: 2px;
        }
        .qr-code canvas {
            display: block;
        }
    </style>
</head>
<body>
    <div class="ticket">`;

    for (const element of elementsWithRelativePositions) {
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
      } else if (element.type === 'qr') {
        const processedContent = replaceJsonReferences(element.content, currentJsonData);
        html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center;">
            <div class="qr-code" id="qr-${element.id}" data-content="${processedContent}" data-size="${element.width}"></div>
        </div>`;
      } else if (element.type === 'image') {
        const objectFit = element.config?.objectFit || 'contain';
        const optimizedImageData = await getOptimizedImageData(element, true); // true = para exportación/preview
        if (optimizedImageData) {
          html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center;">
            <img src="${optimizedImageData}" alt="${element.config?.originalName || 'Imagen'}" style="width: 100%; height: 100%; object-fit: ${objectFit};" />
        </div>`;
        } else {
          html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #666; font-size: 10px; text-align: center;">
            Sin imagen
        </div>`;
        }
      } else if (element.type === 'formula') {
        const formulaFontSize = element.fontSize || 12;
        const textAlign = element.textAlign || 'left';
        html += `
        <div class="element text-element" data-element-id="${element.id}" data-formula="true" style="${style} font-size: ${formulaFontSize}px; color: #000000; position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; text-align: ${textAlign}; display: flex; align-items: center; justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : textAlign === 'justify' ? 'stretch' : 'flex-start'};">
            <span class="formula-result" data-formula-id="${element.id}">Ejecutando fórmula...</span>
        </div>`;
      }
    }

    html += `
    </div>
    <script>
        // Función para generar QR codes usando la librería qrcode.js
        function generateQRCode(content, size, elementId) {
            if (!content || content.trim() === '') {
                return '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">Sin contenido</div>';
            }

            const qrSize = Math.min(size - 4, 200);
            const options = {
                text: content,
                width: qrSize,
                height: qrSize,
                colorDark: '#000000',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.M
            };

            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.display = 'none';
                document.body.appendChild(tempDiv);
                
                new QRCode(tempDiv, options);
                
                const qrCanvas = tempDiv.querySelector('canvas');
                if (qrCanvas) {
                    document.body.removeChild(tempDiv);
                    return qrCanvas.outerHTML;
                } else {
                    document.body.removeChild(tempDiv);
                    throw new Error('No se pudo generar el canvas del QR');
                }
            } catch (error) {
                console.error('Error en generateQRCode:', error);
                return '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #ffcccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #cc0000; border: 1px solid #cc0000;">Error QR</div>';
            }
        }
        
        // Función para generar todos los QR codes
        function generateAllQRCodes() {
            console.log('Generando QR codes...');
            const qrElements = document.querySelectorAll('[id^="qr-"]');
            console.log('Elementos QR encontrados:', qrElements.length);
            qrElements.forEach(element => {
                const content = element.getAttribute('data-content');
                const size = parseInt(element.getAttribute('data-size'));
                const elementId = element.id;
                console.log('Generando QR para:', content, 'tamaño:', size);
                
                if (!content || content.trim() === '') {
                    element.innerHTML = '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">Sin contenido</div>';
                    return;
                }

                const qrSize = Math.min(size - 4, 200);
                const options = {
                    text: content,
                    width: qrSize,
                    height: qrSize,
                    colorDark: '#000000',
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.M
                };

                try {
                    new QRCode(element, options);
                    console.log('QR generado exitosamente para:', content);
                } catch (error) {
                    console.error('Error generando QR:', error);
                    element.innerHTML = '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #ffcccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #cc0000; border: 1px solid #cc0000;">Error QR</div>';
                }
            });
        }
        
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
            const relativeElements = ${JSON.stringify(elements.filter(el => el.relativeTo && (el.relativePosition || el.relativeVertical || el.relativeHorizontal)))};
            
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
                
                // Sistema nuevo: usar relativeVertical y relativeHorizontal si están definidos
                if (element.relativeVertical || element.relativeHorizontal) {
                    // Posición vertical
                    switch (element.relativeVertical) {
                        case 'top':
                            newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                            break;
                        case 'center':
                            newY = referenceRect.top - ticketRect.top + (referenceRect.height - elementEl.offsetHeight) / 2 + offset.y;
                            break;
                        case 'bottom':
                            newY = referenceRect.bottom - ticketRect.top + offset.y;
                            break;
                        default:
                            // Si no hay relativeVertical, usar la posición actual
                            newY = elementEl.offsetTop;
                    }

                    // Posición horizontal
                    switch (element.relativeHorizontal) {
                        case 'left':
                            newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                            break;
                        case 'center':
                            newX = referenceRect.left - ticketRect.left + (referenceRect.width - elementEl.offsetWidth) / 2 + offset.x;
                            break;
                        case 'right':
                            newX = referenceRect.right - ticketRect.left + offset.x;
                            break;
                        default:
                            // Si no hay relativeHorizontal, usar la posición actual
                            newX = elementEl.offsetLeft;
                    }
                } else if (element.relativePosition) {
                    // Sistema legacy: mantener compatibilidad con relativePosition
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
                }
                
                // Aplicar la nueva posición
                elementEl.style.left = newX + 'px';
                elementEl.style.top = newY + 'px';
                
                console.log('Elemento', element.id, 'reposicionado a:', newX, newY);
            });
        }
        
        // Función para ejecutar fórmulas JavaScript de forma segura
        async function executeFormula(code, data, outputFormat, errorHandling, defaultValue, timeout) {
            if (!code || code.trim() === '') {
                return defaultValue || '';
            }

            try {
                const executeWithTimeout = (code, timeout) => {
                    return new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error('Execution timeout'));
                        }, timeout);

                        try {
                            const safeFunction = new Function('data', 'Math', 'String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', code);

                            const result = safeFunction(
                                data,
                                Math,
                                String,
                                Number,
                                Boolean,
                                Array,
                                Object,
                                Date,
                                parseInt,
                                parseFloat,
                                isNaN,
                                isFinite
                            );

                            clearTimeout(timeoutId);
                            resolve(result);
                        } catch (error) {
                            clearTimeout(timeoutId);
                            reject(error);
                        }
                    });
                };

                const result = await executeWithTimeout(code, timeout || 5000);

                switch (outputFormat) {
                    case 'number':
                        return typeof result === 'number' ? result.toString() : defaultValue || '0';
                    case 'boolean':
                        return typeof result === 'boolean' ? result.toString() : defaultValue || 'false';
                    case 'json':
                        return typeof result === 'object' ? JSON.stringify(result) : defaultValue || '{}';
                    case 'text':
                    default:
                        return result !== undefined && result !== null ? result.toString() : defaultValue || '';
                }
            } catch (error) {
                console.error('Error executing formula:', error);

                switch (errorHandling) {
                    case 'show-error':
                        return 'Error: ' + error.message;
                    case 'hide-error':
                        return '';
                    case 'show-default':
                    default:
                        return defaultValue || '';
                }
            }
        }

        // Función para ejecutar todas las fórmulas
        function executeAllFormulas() {
            console.log('Ejecutando fórmulas en vista previa...');
            const formulaElements = document.querySelectorAll('[data-formula="true"]');
            formulaElements.forEach(element => {
                const formulaId = element.getAttribute('data-element-id');
                const resultSpan = element.querySelector('.formula-result');
                let ticketData = ${JSON.stringify(currentJsonData)};
                if (resultSpan && ticketData) {
                    // Obtener la configuración de la fórmula desde los datos del elemento
                    const formulaConfig = ${JSON.stringify(elements.filter(el => el.type === 'formula').map(el => ({
                        id: el.id,
                        config: el.config
                    })))};
                    
                    const config = formulaConfig.find(f => f.id === formulaId);
                    if (config && config.config) {
                        const { javascriptCode, outputFormat, errorHandling, defaultValue, timeout } = config.config;
                        
                        executeFormula(javascriptCode, ticketData, outputFormat, errorHandling, defaultValue, timeout)
                            .then(result => {
                                resultSpan.textContent = result;
                            })
                            .catch(error => {
                                console.error('Error ejecutando fórmula:', error);
                                resultSpan.textContent = 'Error en fórmula';
                            });
                    }
                }
            });
        }
        
        // Ejecutar inmediatamente y también cuando el DOM esté listo
        console.log('Script de vista previa cargado');
        
        // Esperar a que la librería QR se cargue
        function initializeQR() {
            if (typeof QRCode !== 'undefined') {
                generateAllQRCodes();
                processAllTables();
                executeAllFormulas();
                
                // Ajustar posiciones después de que las tablas se llenen
                setTimeout(() => {
                    adjustRelativePositions();
                }, 200);
            } else {
                setTimeout(initializeQR, 100);
            }
        }
        
        // También ejecutar cuando el DOM esté listo por si acaso
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeQR);
        } else {
            // DOM ya está listo, ejecutar inmediatamente
            setTimeout(initializeQR, 100);
        }
    </script>`;

    return html;
  };

  const generateHTML = async () => {
    const widthPx = convertWidth(ticketWidth, widthUnit);
    const contentHeight = calculateContentHeight();
    const elementsWithRelativePositions = getElementsWithRelativePositions();
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    @@SCRIPTS@@
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .ticket {
            width: ${widthPx}px;
            overflow-x: hidden;
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
        .qr-code {
            display: inline-block;
            background: white;
            padding: 2px;
        }
        .qr-code canvas {
            display: block;
        }
    </style>
</head>
<body>
    <div class="ticket">`;

    for (const element of elementsWithRelativePositions) {
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
      } else if (element.type === 'qr') {
        // Mantener los placeholders originales en lugar de procesarlos
        const templateContent = element.content;
        html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center;">
            <div class="qr-code" id="qr-${element.id}" data-content="${templateContent}" data-size="${element.width}"></div>
        </div>`;
      } else if (element.type === 'image') {
        const objectFit = element.config?.objectFit || 'contain';
        const optimizedImageData = await getOptimizedImageData(element, true); // true = para exportación/preview
        if (optimizedImageData) {
          html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center;">
            <img src="${optimizedImageData}" alt="${element.config?.originalName || 'Imagen'}" style="width: 100%; height: 100%; object-fit: ${objectFit};" />
        </div>`;
        } else {
          html += `
        <div class="element" data-element-id="${element.id}" style="${style} position: absolute; border: none; padding: 5px; box-sizing: border-box; background: transparent; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #666; font-size: 10px; text-align: center;">
            Sin imagen
        </div>`;
        }
      } else if (element.type === 'formula') {
        const formulaFontSize = element.fontSize || 12;
        const textAlign = element.textAlign || 'left';
        html += `
        <div class="element text-element" data-element-id="${element.id}" data-formula="true" style="${style} font-size: ${formulaFontSize}px; color: #000000; text-align: ${textAlign}; display: flex; align-items: center; justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : textAlign === 'justify' ? 'stretch' : 'flex-start'}; border: none;">
            <span class="formula-result" data-formula-id="${element.id}">Ejecutando fórmula...</span>
        </div>`;
      }
    }

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
                    
                    return ''; // Si no se encuentra, retornar cadena vacía
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
        
        // ===== GENERACIÓN DE QR CODES =====
        // Función para generar QR codes usando la librería qrcode.js
        function generateQRCode(content, size, elementId) {
            if (!content || content.trim() === '') {
                return '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">Sin contenido</div>';
            }

            const qrSize = Math.min(size - 4, 200);
            const options = {
                text: content,
                width: qrSize,
                height: qrSize,
                colorDark: '#000000',
                colorLight: '#FFFFFF',
                correctLevel: QRCode.CorrectLevel.M
            };

            try {
                const tempDiv = document.createElement('div');
                tempDiv.style.display = 'none';
                document.body.appendChild(tempDiv);
                
                new QRCode(tempDiv, options);
                
                const qrCanvas = tempDiv.querySelector('canvas');
                if (qrCanvas) {
                    document.body.removeChild(tempDiv);
                    return qrCanvas.outerHTML;
                } else {
                    document.body.removeChild(tempDiv);
                    throw new Error('No se pudo generar el canvas del QR');
                }
            } catch (error) {
                console.error('Error en generateQRCode:', error);
                return '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #ffcccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #cc0000; border: 1px solid #cc0000;">Error QR</div>';
            }
        }
        
        // Función para generar todos los QR codes
        function generateAllQRCodes() {
            console.log('Generando QR codes en HTML exportado...');
            const qrElements = document.querySelectorAll('[id^="qr-"]');
            console.log('Elementos QR encontrados:', qrElements.length);
            qrElements.forEach(element => {
                const content = element.getAttribute('data-content');
                const size = parseInt(element.getAttribute('data-size'));
                // Procesar el contenido del QR con los datos JSON
                const processedContent = replaceTextPlaceholders(content, ticketData);
                console.log('Generando QR para:', content, 'procesado:', processedContent, 'tamaño:', size);
                
                if (!processedContent || processedContent.trim() === '') {
                    element.innerHTML = '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666;">Sin contenido</div>';
                    return;
                }

                const qrSize = Math.min(size - 4, 200);
                const options = {
                    text: processedContent,
                    width: qrSize,
                    height: qrSize,
                    colorDark: '#000000',
                    colorLight: '#FFFFFF',
                    correctLevel: QRCode.CorrectLevel.M
                };

                try {
                    new QRCode(element, options);
                    console.log('QR generado exitosamente para:', processedContent);
                } catch (error) {
                    console.error('Error generando QR:', error);
                    element.innerHTML = '<div style="width: ' + size + 'px; height: ' + size + 'px; background: #ffcccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #cc0000; border: 1px solid #cc0000;">Error QR</div>';
                }
            });
        }
        
        // Función para ejecutar fórmulas JavaScript de forma segura
        async function executeFormula(code, data, outputFormat, errorHandling, defaultValue, timeout) {
            if (!code || code.trim() === '') {
                return defaultValue || '';
            }

            try {
                const executeWithTimeout = (code, timeout) => {
                    return new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error('Execution timeout'));
                        }, timeout);

                        try {
                            const safeFunction = new Function('data', 'Math', 'String', 'Number', 'Boolean', 'Array', 'Object', 'Date', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', code);

                            const result = safeFunction(
                                data,
                                Math,
                                String,
                                Number,
                                Boolean,
                                Array,
                                Object,
                                Date,
                                parseInt,
                                parseFloat,
                                isNaN,
                                isFinite
                            );

                            clearTimeout(timeoutId);
                            resolve(result);
                        } catch (error) {
                            clearTimeout(timeoutId);
                            reject(error);
                        }
                    });
                };

                const result = await executeWithTimeout(code, timeout || 5000);

                switch (outputFormat) {
                    case 'number':
                        return typeof result === 'number' ? result.toString() : defaultValue || '0';
                    case 'boolean':
                        return typeof result === 'boolean' ? result.toString() : defaultValue || 'false';
                    case 'json':
                        return typeof result === 'object' ? JSON.stringify(result) : defaultValue || '{}';
                    case 'text':
                    default:
                        return result !== undefined && result !== null ? result.toString() : defaultValue || '';
                }
            } catch (error) {
                console.error('Error executing formula:', error);

                switch (errorHandling) {
                    case 'show-error':
                        return 'Error: ' + error.message;
                    case 'hide-error':
                        return '';
                    case 'show-default':
                    default:
                        return defaultValue || '';
                }
            }
        }

        // Función para ejecutar todas las fórmulas
        function executeAllFormulas() {
            console.log('Ejecutando fórmulas en HTML exportado...');
            const formulaElements = document.querySelectorAll('[data-formula="true"]');
            formulaElements.forEach(element => {
                const formulaId = element.getAttribute('data-element-id');
                const resultSpan = element.querySelector('.formula-result');
                
                if (resultSpan && ticketData) {
                    // Obtener la configuración de la fórmula desde los datos del elemento
                    const formulaConfig = ${JSON.stringify(elements.filter(el => el.type === 'formula').map(el => ({
                        id: el.id,
                        config: el.config
                    })))};
                    
                    const config = formulaConfig.find(f => f.id === formulaId);
                    if (config && config.config) {
                        const { javascriptCode, outputFormat, errorHandling, defaultValue, timeout } = config.config;
                        
                        executeFormula(javascriptCode, ticketData, outputFormat, errorHandling, defaultValue, timeout)
                            .then(result => {
                                resultSpan.textContent = result;
                            })
                            .catch(error => {
                                console.error('Error ejecutando fórmula:', error);
                                resultSpan.textContent = 'Error en fórmula';
                            });
                    }
                }
            });
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
            
            // Generar todos los QR codes
            generateAllQRCodes();
            
            // Ejecutar todas las fórmulas
            executeAllFormulas();
            
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
            const relativeElements = ${JSON.stringify(elements.filter(el => el.relativeTo && (el.relativePosition || el.relativeVertical || el.relativeHorizontal)))};
            
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
                
                // Sistema nuevo: usar relativeVertical y relativeHorizontal si están definidos
                if (element.relativeVertical || element.relativeHorizontal) {
                    // Posición vertical
                    switch (element.relativeVertical) {
                        case 'top':
                            newY = referenceRect.top - ticketRect.top - elementEl.offsetHeight + offset.y;
                            break;
                        case 'center':
                            newY = referenceRect.top - ticketRect.top + (referenceRect.height - elementEl.offsetHeight) / 2 + offset.y;
                            break;
                        case 'bottom':
                            newY = referenceRect.bottom - ticketRect.top + offset.y;
                            break;
                        default:
                            // Si no hay relativeVertical, usar la posición actual
                            newY = elementEl.offsetTop;
                    }

                    // Posición horizontal
                    switch (element.relativeHorizontal) {
                        case 'left':
                            newX = referenceRect.left - ticketRect.left - elementEl.offsetWidth + offset.x;
                            break;
                        case 'center':
                            newX = referenceRect.left - ticketRect.left + (referenceRect.width - elementEl.offsetWidth) / 2 + offset.x;
                            break;
                        case 'right':
                            newX = referenceRect.right - ticketRect.left + offset.x;
                            break;
                        default:
                            // Si no hay relativeHorizontal, usar la posición actual
                            newX = elementEl.offsetLeft;
                    }
                } else if (element.relativePosition) {
                    // Sistema legacy: mantener compatibilidad con relativePosition
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
         
         // Función para inicializar QR y procesar la plantilla
         function initializeQRAndProcess() {
             if (typeof QRCode !== 'undefined') {
                 processTicketTemplate(datosEjemplo);
                 // Ajustar posiciones después de procesar la plantilla
                 setTimeout(adjustRelativePositions, 200);
             } else {
                 setTimeout(initializeQRAndProcess, 100);
             }
         }
         
         document.addEventListener('DOMContentLoaded', initializeQRAndProcess);
         
    </script>
</body>
</html>`;

    return html;
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
    if (!element.relativeTo) {
      return { x: element.x, y: element.y };
    }

    const referenceElement = elements.find(el => el.id === element.relativeTo);
    if (!referenceElement) {
      return { x: element.x, y: element.y };
    }

    const offset = element.relativeOffset || { x: 0, y: 0 };
    let newX = referenceElement.x;
    let newY = referenceElement.y;

    // Sistema nuevo: usar relativeVertical y relativeHorizontal si están definidos
    if (element.relativeVertical || element.relativeHorizontal) {
      // Posición vertical
      switch (element.relativeVertical) {
        case 'top':
          newY = referenceElement.y - element.height + offset.y;
          break;
        case 'center':
          newY = referenceElement.y + (referenceElement.height - element.height) / 2 + offset.y;
          break;
        case 'bottom':
          newY = referenceElement.y + referenceElement.height + offset.y;
          break;
        default:
          // Si no hay relativeVertical, usar la posición actual
          newY = element.y;
      }

      // Posición horizontal
      switch (element.relativeHorizontal) {
        case 'left':
          newX = referenceElement.x - element.width + offset.x;
          break;
        case 'center':
          newX = referenceElement.x + (referenceElement.width - element.width) / 2 + offset.x;
          break;
        case 'right':
          newX = referenceElement.x + referenceElement.width + offset.x;
          break;
        default:
          // Si no hay relativeHorizontal, usar la posición actual
          newX = element.x;
      }
    } else if (element.relativePosition) {
      // Sistema legacy: mantener compatibilidad con relativePosition
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
    } else {
      // Si no hay ninguna configuración de posición relativa, mantener la posición actual
      return { x: element.x, y: element.y };
    }

    return { x: newX, y: newY };
  };

  const updateRelativePositions = () => {
    let hasChanges = false;
    const updatedElements = elements.map(element => {
      if (element.relativeTo && (element.relativePosition || element.relativeVertical || element.relativeHorizontal)) {
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
    const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeProjectName}-ejemplo-uso.html`;
    triggerFileDownload(exampleHTML, filename, 'text/html');
  };

  // Función para exportar la configuración del proyecto
  const exportProjectConfig = () => {
    const projectConfig: ProjectConfig = {
      version: "1.0.0",
      name: projectName,
      description: "Proyecto de editor de tickets exportado",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ticketWidth,
      widthUnit,
      elements,
      jsonData: jsonData || null
    };

    const configJson = JSON.stringify(projectConfig, null, 2);
    const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safeProjectName}-${new Date().toISOString().split('T')[0]}.json`;
    triggerFileDownload(configJson, filename, 'application/json');
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
        setProjectName(projectConfig.name || 'Mi Proyecto de Ticket');
        setTicketWidth(projectConfig.ticketWidth || 300);
        setWidthUnit(projectConfig.widthUnit || 'px');
        setElements(projectConfig.elements || []);
        setJsonData(projectConfig.jsonData || null);
        setHasCustomJson(!!projectConfig.jsonData); // Establecer si hay JSON personalizado
        setSelectedElement(null);
        setShowProperties(false);

        // Mostrar modal de confirmación
        setImportedProjectInfo({
          name: projectConfig.name,
          version: projectConfig.version,
          elements: projectConfig.elements.length,
          createdAt: projectConfig.createdAt,
          updatedAt: projectConfig.updatedAt
        });
        setShowImportSuccessModal(true);
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

  // Funciones para drag and drop de columnas
  const handleColumnDragStart = (e: React.DragEvent, columnIndex: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnIndex.toString());
    setDraggedColumnIndex(columnIndex);
    setIsDraggingColumn(true);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedColumnIndex === null || draggedColumnIndex === dropIndex) {
      setDraggedColumnIndex(null);
      setIsDraggingColumn(false);
      return;
    }

    const element = elements.find(el => el.id === selectedElement);
    if (!element || !element.config?.columns || !selectedElement) return;

    const newColumns = [...element.config.columns];
    const draggedColumn = newColumns[draggedColumnIndex];
    
    // Remover la columna de su posición original
    newColumns.splice(draggedColumnIndex, 1);
    
    // Insertar en la nueva posición
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    updateElement(selectedElement, {
      config: {
        ...element.config,
        columns: newColumns
      }
    });

    setDraggedColumnIndex(null);
    setIsDraggingColumn(false);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
    setIsDraggingColumn(false);
  };

  // Funciones para manejar el zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Máximo 300%
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25)); // Mínimo 25%
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.max(0.25, Math.min(3, prev + delta)));
    }
  };

  // Funciones para el popup de inicio y gestión de proyectos
  const handleNewProject = () => {
    setShowStartupModal(false);
    setShowProjectNameModal(true);
  };

  const handleLoadProject = () => {
    setShowStartupModal(false);
    projectFileInputRef.current?.click();
  };

  const handleProjectNameSubmit = () => {
    if (projectName.trim()) {
      setShowProjectNameModal(false);
    }
  };

  const handleProjectNameCancel = () => {
    setProjectName('Mi Proyecto de Ticket');
    setShowProjectNameModal(false);
  };

  const triggerFileDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, elementId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Data = await convertImageToBase64(file);
        const element = elements.find(el => el.id === elementId);
        if (element) {
          updateElement(elementId, {
            content: file.name,
            config: {
              ...element.config,
              base64Data,
              originalName: file.name,
              mimeType: file.type
            }
          });
        }
      } catch (error) {
        console.error('Error al convertir imagen a base64:', error);
        alert('Error al procesar la imagen. Inténtalo de nuevo.');
      }
    }
    // Limpiar el input
    e.target.value = '';
  };

  // Funciones para redimensionamiento de sidebars
  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  const handlePropertiesResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingProperties(true);
  };

  const handleSidebarResizeMove = (e: MouseEvent) => {
    if (isResizingSidebar) {
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    } else if (isResizingProperties) {
      const newWidth = Math.max(250, Math.min(800, window.innerWidth - e.clientX));
      setPropertiesWidth(newWidth);
    }
  };

  const handleSidebarResizeEnd = () => {
    setIsResizingSidebar(false);
    setIsResizingProperties(false);
  };

  // Agregar event listeners para redimensionamiento
  useEffect(() => {
    if (isResizingSidebar || isResizingProperties) {
      document.addEventListener('mousemove', handleSidebarResizeMove);
      document.addEventListener('mouseup', handleSidebarResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleSidebarResizeMove);
      document.removeEventListener('mouseup', handleSidebarResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleSidebarResizeMove);
      document.removeEventListener('mouseup', handleSidebarResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, isResizingProperties]);

  // Deshabilitar zoom normal del navegador en toda la página
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleGlobalWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleGlobalWheel);
    };
  }, []);

  // Funciones para manejar menús de toolbar (solo uno abierto a la vez)
  const toggleSizeMenu = () => {
    setShowSizeMenu(!showSizeMenu);
    setShowElementsMenu(false);
    setShowInfoMenu(false);
  };

  const toggleElementsMenu = () => {
    setShowElementsMenu(!showElementsMenu);
    setShowSizeMenu(false);
    setShowInfoMenu(false);
  };

  const toggleInfoMenu = () => {
    setShowInfoMenu(!showInfoMenu);
    setShowSizeMenu(false);
    setShowElementsMenu(false);
  };

  // Función para optimizar imágenes para exportación/preview
  const optimizeImageForExport = (base64Data: string, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        try {
          // Crear canvas para redimensionar y comprimir
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto del canvas'));
            return;
          }

          // Calcular nuevas dimensiones manteniendo proporción
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Configurar canvas
          canvas.width = width;
          canvas.height = height;

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con compresión
          const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedBase64);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen para optimización'));
      };
      
      img.src = base64Data;
    });
  };

  // Función para obtener imagen optimizada (original o optimizada según el contexto)
  const getOptimizedImageData = async (element: TicketElement, forExport: boolean = false): Promise<string | undefined> => {
    if (!element.config?.base64Data) {
      return undefined;
    }

    if (!forExport) {
      // Para edición normal, usar la imagen original
      return element.config.base64Data;
    }

    try {
      // Para exportación/preview, optimizar la imagen
      const optimizedData = await optimizeImageForExport(
        element.config.base64Data,
        Math.max(element.width * 2, 800), // Usar el doble del ancho del elemento o 800px como máximo
        Math.max(element.height * 2, 600), // Usar el doble del alto del elemento o 600px como máximo
        0.8 // Calidad del 80%
      );
      return optimizedData;
    } catch (error) {
      console.warn('Error al optimizar imagen, usando original:', error);
      return element.config.base64Data; // Fallback a la imagen original
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Editor de Tickets</title>

      </Head>

      {/* Modales de inicio y gestión de proyectos */}
      {showStartupModal && (
        <StartupModal
          onLoadProject={handleLoadProject}
          onNewProject={handleNewProject}
        />
      )}

      {showProjectNameModal && (
        <ProjectNameModal
        projectName={projectName}
        onProjectNameChange={(e)=>setProjectName(e)}
        onSubmit={handleProjectNameSubmit}
        onCancel={handleProjectNameCancel}
        
        />
      )}

      {/* Modal de confirmación de importación exitosa */}
      {showImportSuccessModal && importedProjectInfo && (
        <ImportSuccessModal
          onClose={() => setShowImportSuccessModal(false)}
          importedProjectInfo={importedProjectInfo}
        
        />
      )}

      {/* Inputs ocultos para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleJsonUpload}
        className="hidden"
      />
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".json"
        onChange={importProjectConfig}
        className="hidden"
      />

     <Toolbar
      sidebarHidden={sidebarHidden}
      showPreview={showPreview}
      showJsonViewer={showJsonViewer}
      showDebug={showDebug}
      showSizeMenu={showSizeMenu}
      showElementsMenu={showElementsMenu}
      showInfoMenu={showInfoMenu}
      onToggleSidebar={() => setSidebarHidden(!sidebarHidden)}
      onTogglePreview={() => setShowPreview(!showPreview)}
      onToggleJsonViewer={() => setShowJsonViewer(!showJsonViewer)}
      onToggleDebug={() => setShowDebug(!showDebug)}
      onToggleSizeMenu={toggleSizeMenu}
      onToggleElementsMenu={toggleElementsMenu}
      onToggleInfoMenu={toggleInfoMenu}
      onGenerateHTML={generateHTML}
      onClearCanvas={clearCanvas}
      onGenerateExample={generateExampleUsage}
      onExportProject={exportProjectConfig}
      onImportProject={importProjectConfig}
      onChangeProjectName={handleNewProject}
      onDragStart={handleDragStart}
      ticketWidth={ticketWidth}
      widthUnit={widthUnit}
      onTicketWidthChange={setTicketWidth}
      onWidthUnitChange={setWidthUnit}
      convertWidth={convertWidth}
     />


     <Header
      projectName={projectName}
      elementsCount={elements.length}
      ticketWidth={ticketWidth}
      widthUnit={widthUnit}
     />
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Barra lateral de herramientas */}
        {!sidebarHidden && (
         <Sidebar
          sidebarWidth={sidebarWidth}
          ticketWidth={ticketWidth}
          widthUnit={widthUnit}
          hasCustomJson={hasCustomJson}
          currentJsonData={jsonData}
          onTicketWidthChange={setTicketWidth}
          onWidthUnitChange={setWidthUnit}
          onJsonUpload={handleJsonUpload}
          onJsonDragOver={handleJsonDragOver}
          onJsonDrop={handleJsonDrop}
          onDragStart={handleDragStart}
          convertWidth={convertWidth}
          isConverting={isConverting}
         />
        )}

        {/* Handle de redimensionamiento de sidebar */}
        {!sidebarHidden && (
          <div
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
            onMouseDown={handleSidebarResizeStart}
          />
        )}

        {/* Panel de propiedades */}
        {showProperties && selectedElement && (
          <PropertiesPanel
            propertiesWidth={propertiesWidth}
            selectedElement={selectedElement}
            elements={elements}
            currentJsonData={jsonData}
            ticketWidth={ticketWidth}
            widthUnit={widthUnit}
            showDebug={showDebug}
            onClose={() => setShowProperties(false)}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            convertWidth={convertWidth}
            generateJsonPaths={generateJsonPaths}
            draggedColumnIndex={draggedColumnIndex}
            isDraggingColumn={isDraggingColumn}
            handleColumnDragStart={handleColumnDragStart}
            handleColumnDragOver={handleColumnDragOver}
            handleColumnDrop={handleColumnDrop}
            handleColumnDragEnd={handleColumnDragEnd}
          />
        )}

        {/* Visor de JSON */}
        {showJsonViewer && (
          <JsonViewer
            currentJsonData={jsonData}
          />
        )}

       <Canvas 
        elements={elements}
        ticketWidth={ticketWidth}
        widthUnit={widthUnit}
        zoomLevel={zoomLevel}
        showDebug={showDebug}
        selectedElement={selectedElement}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        onWheel={handleWheelZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        convertWidth={convertWidth}
        calculateContentHeight={calculateContentHeight}
        handleElementClick={handleElementClick}
        handleElementDragStart={handleElementDragStart}
        handleElementDragEnd={handleElementDragEnd}
        handleResizeStart={handleResizeStart}
        deleteElement={deleteElement}
        canvasRef={canvasRef}
        currentJsonData={jsonData}
        
        
        
        
       />

        {/* Handle de redimensionamiento de propiedades */}
        {showProperties && selectedElement && (
          <div
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors"
            onMouseDown={handlePropertiesResizeStart}
          />
        )}

        {/* Área de vista previa */}
        {showPreview && (
          <PreviewPanel
            previewHTML={previewHTML}
            ticketWidth={ticketWidth}
            widthUnit={widthUnit}
            elementsCount={elements.length}
            convertWidth={convertWidth}
            calculateContentHeight={calculateContentHeight}
          />
          
        )}
      </div>
    </div>
  );
}