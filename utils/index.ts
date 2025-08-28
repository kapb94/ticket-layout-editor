import { TicketElement, TableColumn } from '../components/types';

// 🔁 Función que navega por el objeto externo
export const getSuggestions = (path: any, jsonData: any) => {
  const parts = path.split(".");
  let obj = { data: jsonData };
  for (let part of parts) {
    if (obj && typeof obj === "object") {
      obj = obj[part as keyof typeof obj];
    } else {
      return [];
    }
  }
  if (!obj || typeof obj !== "object") return [];

  return Object.keys(obj).map((key) => ({
    label: key,
    type: "property",
    info: path + "." + key
  }));
};

// 🎯 Función de autocompletado
export const customAutocomplete = (context: any, jsonData: any) => {
  const word = context.matchBefore(/[\w\.]+/);
  if (!word || word.from == word.to) return null;

  const text = word.text;
  if (text.startsWith("data")) {
    const options = getSuggestions(text, jsonData);
    return {
      from: word.from,
      options
    };
  }

  return null;
};

// Convertir unidades
export const convertWidth = (value: number, unit: string) => {
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
export const convertFromPx = (pxValue: number, targetUnit: string) => {
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
export const convertBetweenUnits = (value: number, fromUnit: string, toUnit: string) => {
  if (fromUnit === toUnit) return value;
  
  // Primero convertir a px
  const pxValue = convertWidth(value, fromUnit);
  // Luego convertir a la unidad objetivo
  return convertFromPx(pxValue, toUnit);
};

// Función para formatear valores usando formateadores
export const formatValue = (value: any, formatter: string): string => {
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
export const formatColumnValue = (value: any, column: TableColumn): string => {
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

// Función global para copiar al portapapeles
export const copyToClipboard = (text: string, element: HTMLElement) => {
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

export const fallbackCopyToClipboard = (text: string, element: HTMLElement) => {
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

export const generateJsonPaths = (obj: any, path: string = ''): string[] => {
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

export const formatJsonValue = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value.toString();
  if (Array.isArray(value)) return `Array[${value.length}]`;
  if (typeof value === 'object') return 'Object';
  return String(value);
};

export const triggerFileDownload = (content: string, filename: string, mimeType: string) => {
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

export const convertImageToBase64 = (file: File): Promise<string> => {
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

// Función para optimizar imágenes para exportación/preview
export const optimizeImageForExport = (base64Data: string, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
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
