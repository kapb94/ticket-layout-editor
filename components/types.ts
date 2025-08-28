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

// Datos JSON por defecto (hardcodeados)
export const defaultJsonData = {
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
