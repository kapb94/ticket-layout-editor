export interface TicketElement {
  id: string;
  type: 'text' | 'table' | 'qr' | 'image' | 'formula';
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
  relativeVertical?: 'top' | 'center' | 'bottom'; // Posición vertical relativa
  relativeHorizontal?: 'left' | 'center' | 'right'; // Posición horizontal relativa
  relativeOffset?: { x: number; y: number }; // Offset desde la posición relativa
}

export interface TableColumn {
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

export interface TableConfig {
  dataPath: string;
  columns: TableColumn[];
  fontSize?: number;
  showBorders?: boolean;
  showHeader?: boolean;
  showHeaderBackground?: boolean;
}

export interface ImageConfig {
  base64Data?: string;
  originalName?: string;
  mimeType?: string;
  maintainAspectRatio?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export interface FormulaConfig {
  javascriptCode: string;
  outputFormat: 'text' | 'number' | 'boolean' | 'json';
  errorHandling: 'show-error' | 'hide-error' | 'show-default';
  defaultValue: string;
  timeout: number; // milliseconds
}

// Interfaz para la configuración completa del proyecto
export interface ProjectConfig {
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
