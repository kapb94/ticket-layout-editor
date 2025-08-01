# 🎫 Editor de Tickets - Generador de Layouts HTML

Un editor visual completo para crear layouts de tickets personalizables que se pueden exportar como HTML puro y convertir a PDF. Diseñado para ser intuitivo y no requerir conocimientos de programación.

## ✨ Características Principales

### 🎨 **Editor Visual Intuitivo**
- **Interfaz drag & drop** para arrastrar elementos al área de diseño
- **Editor WYSIWYG** (What You See Is What You Get)
- **Área de diseño personalizable** con ancho configurable en px, pulgadas o cm
- **Vista previa en tiempo real** con iframe para renderizado completo

### 📝 **Elementos de Diseño**
- **Elementos de texto** con contenido dinámico usando referencias JSON
- **Tablas dinámicas** con configuración avanzada de columnas
- **Elementos QR** para generar códigos QR dinámicos
- **Elementos de imagen** con soporte para archivos locales
- **Elementos de fórmula** para manipular datos JSON con JavaScript básico
- **Posicionamiento preciso** con controles X/Y y alineación
- **Redimensionado visual** arrastrando las esquinas

### 🎛️ **Controles Avanzados**
- **Posicionamiento relativo** entre elementos
- **Controles de teclado** para movimiento y redimensionado preciso
- **Propiedades personalizables** para cada elemento
- **Configuración de tablas** integrada en el panel de propiedades

### 📊 **Datos Dinámicos**
- **Carga de archivos JSON** para datos de prueba
- **Referencias dinámicas** usando sintaxis `{{propiedad}}`
- **Vista previa de propiedades JSON** con copia al portapapeles
- **Formateo avanzado** de datos en tablas (moneda, fechas, números)

### 💾 **Gestión de Proyectos**
- **Exportar configuración** completa del proyecto
- **Importar proyectos** guardados anteriormente
- **Persistencia completa** de elementos, configuraciones y datos
- **Control de versiones** integrado

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ticket-editor

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Estructura del Proyecto
```
ticket-editor/
├── pages/
│   ├── index.tsx          # Componente principal
│   ├── _app.tsx           # Configuración de la app
│   └── api/               # API routes (si aplica)
├── public/
│   ├── ejemplo-datos.json # Datos de ejemplo
│   └── ...                # Otros archivos estáticos
├── styles/
│   └── globals.css        # Estilos globales
├── package.json           # Dependencias y scripts
└── README.md             # Este archivo
```

## 📖 Guía de Uso

### 1. Configuración Inicial

#### Configurar el Ancho del Ticket
- **Seleccionar unidad**: px, pulgadas (in) o centímetros (cm)
- **Establecer ancho**: Valor numérico en la unidad seleccionada
- **Conversión automática**: Al cambiar unidades, los valores se convierten automáticamente

#### Cargar Datos JSON
- **Hacer clic** en "Seleccionar archivo" en la sección "Cargar datos JSON"
- **Seleccionar archivo** `.json` con los datos de prueba
- **Verificar carga**: Aparecerá "✓ JSON cargado correctamente"
- **Ver propiedades**: Hacer clic en "📋 Ver Propiedades JSON"

### 2. Crear el Diseño

#### Agregar Elementos
1. **Arrastrar elementos** desde la barra lateral al área de diseño:
   - **Texto**: Para contenido de texto
   - **Tabla**: Para datos tabulares
   - **QR**: Para generar códigos QR dinámicos
   - **Imagen**: Para insertar imágenes locales
   - **Fórmula**: Para manipular datos JSON con JavaScript

#### Seleccionar y Editar Elementos
- **Hacer clic** en cualquier elemento para seleccionarlo
- **Panel de propiedades** aparecerá automáticamente
- **Editar propiedades** en tiempo real

#### Mover Elementos
- **Arrastrar** el elemento seleccionado
- **Controles de teclado**:
  - `Flechas`: Mover 5px
  - `Shift + Flechas`: Mover 20px
- **Controles X/Y**: En el panel de propiedades

#### Redimensionar Elementos
- **Arrastrar esquinas** del elemento
- **Controles de teclado**:
  - `Shift + ←/→`: Cambiar ancho
  - `Shift + ↑/↓`: Cambiar altura

### 3. Configurar Elementos

#### Elementos de Texto
- **Contenido**: Texto estático o referencias JSON `{{propiedad}}`
- **Tamaño de fuente**: 8px a 72px
- **Alineación**: Izquierda, centro, derecha, justificado
- **Posicionamiento**: Coordenadas X/Y precisas

#### Elementos de Tabla
- **Ruta de datos**: Propiedad JSON que contiene el array (ej: `productos.items`)
- **Columnas**: Configurar encabezados y propiedades
- **Formateo avanzado**: Número, moneda, fecha, texto
- **Estilos**: Bordes, fondo de encabezado, alineación

#### Elementos QR
- **Contenido dinámico**: Texto o URL que se convertirá en QR
- **Tamaño configurable**: Ancho y alto personalizables
- **Generación automática**: Se actualiza automáticamente con los datos

#### Elementos de Imagen
- **Carga de archivos**: Soporte para imágenes locales
- **Conversión automática**: Se convierte a Base64 para exportación
- **Mantenimiento de proporción**: Opción para preservar relación de aspecto
- **Ajuste de objeto**: Contener, cubrir o rellenar el contenedor

#### Elementos de Fórmula
- **Código JavaScript**: Escribir código JavaScript básico para manipular datos JSON
- **Formato de salida**: Texto, número, booleano o JSON
- **Manejo de errores**: Mostrar error, ocultar error o mostrar valor por defecto
- **Timeout configurable**: Límite de tiempo para ejecución (por defecto 5 segundos)
- **Ejecución segura**: Entorno sandboxed con acceso limitado a APIs del navegador
- **Variables disponibles**: `data` (JSON cargado), funciones matemáticas y de utilidad

### 4. Posicionamiento Relativo

#### Configurar Relaciones
1. **Seleccionar elemento** que será relativo
2. **Elegir elemento de referencia** en "Relativo a"
3. **Seleccionar posición** (arriba, abajo, izquierda, derecha, etc.)
4. **Ajustar offset** si es necesario

#### Posiciones Disponibles
- `above`: Encima del elemento de referencia
- `below`: Debajo del elemento de referencia
- `left`: A la izquierda del elemento de referencia
- `right`: A la derecha del elemento de referencia
- `center`: Centrado respecto al elemento de referencia
- `top-left`, `top-right`, `bottom-left`, `bottom-right`: Esquinas

### 5. Vista Previa

#### Activar Vista Previa
- **Hacer clic** en "👁️ Mostrar Vista Previa"
- **Ver resultado** en tiempo real
- **Actualizar automáticamente** al hacer cambios

#### Funciones de Vista Previa
- **Renderizado completo** en iframe
- **Scripts ejecutados** correctamente
- **Datos dinámicos** poblados automáticamente
- **Actualizar tablas** con botón dedicado

### 6. Exportar Resultado

#### Generar Plantilla HTML
- **Hacer clic** en "💾 Generar Plantilla HTML"
- **Descargar archivo** automáticamente
- **HTML puro** con CSS y JavaScript integrados

#### Exportar Proyecto
- **Hacer clic** en "💾 Exportar Proyecto"
- **Guardar configuración** completa
- **Archivo JSON** con todos los datos

#### Importar Proyecto
- **Hacer clic** en "📂 Importar Proyecto"
- **Seleccionar archivo** `.json` guardado
- **Cargar configuración** completa

## 🎛️ Controles de Teclado

### Movimiento de Elementos
| Tecla | Acción |
|-------|--------|
| `←` | Mover 5px a la izquierda |
| `→` | Mover 5px a la derecha |
| `↑` | Mover 5px hacia arriba |
| `↓` | Mover 5px hacia abajo |
| `Shift + ←` | Mover 20px a la izquierda |
| `Shift + →` | Mover 20px a la derecha |
| `Shift + ↑` | Mover 20px hacia arriba |
| `Shift + ↓` | Mover 20px hacia abajo |

### Redimensionado de Elementos
| Tecla | Acción |
|-------|--------|
| `Shift + ←` | Reducir ancho 20px |
| `Shift + →` | Aumentar ancho 20px |
| `Shift + ↑` | Reducir altura 20px |
| `Shift + ↓` | Aumentar altura 20px |

## 📊 Estructura de Datos JSON

### Formato Básico
```json
{
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
      }
    ],
    "totalItems": 5
  }
}
```

### Referencias Dinámicas
Usar sintaxis `{{propiedad}}` en elementos de texto:
- `{{empresa.nombre}}` → "Mi Empresa S.A."
- `{{venta.total}}` → 1250.75
- `{{productos.totalItems}}` → 5

### Fórmulas JavaScript
En elementos de tipo "Fórmula", escribir código JavaScript para manipular datos:

```javascript
// Ejemplo: Calcular total de venta
const total = data.venta.items.reduce((sum, item) => sum + item.precio, 0);
return total.toFixed(2);

// Ejemplo: Concatenar información
return `${data.empresa.nombre} - ${data.venta.numero}`;

// Ejemplo: Validación condicional
if (data.venta.total > 1000) {
  return "Venta mayor a $1000";
} else {
  return "Venta menor a $1000";
}
```

**Variables disponibles:**
- `data`: Objeto JSON completo cargado
- `Math`: Funciones matemáticas (Math.round, Math.floor, etc.)
- `String`, `Number`, `Boolean`: Constructores de tipos
- `Array`, `Object`: Funciones de arrays y objetos
- `Date`: Para manejo de fechas
- `parseInt`, `parseFloat`: Conversión de tipos
- `isNaN`, `isFinite`: Validaciones numéricas

## 🎨 Configuración de Tablas

### Propiedades de Columna
```typescript
interface TableColumn {
  header: string;           // Encabezado de la columna
  property: string;         // Propiedad JSON a mostrar
  textAlign?: 'left' | 'center' | 'right'; // Alineación
  bold?: boolean;           // Texto en negrita
  italic?: boolean;         // Texto en cursiva
  format?: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'datetime' | 'uppercase' | 'lowercase' | 'capitalize' | 'custom';
  formatOptions?: {
    currency?: 'USD' | 'MXN' | 'EUR';
    decimals?: number;
    thousandsSeparator?: boolean;
    dateFormat?: string;
    customFormat?: string;
    defaultValue?: string;
    transform?: 'truncate' | 'wrap' | 'ellipsis';
    maxLength?: number;
  };
}
```

### Formatos Disponibles
- **text**: Texto plano
- **number**: Números con decimales configurables
- **currency**: Moneda con símbolo y separadores
- **percentage**: Porcentajes
- **date**: Fechas con formato personalizable
- **datetime**: Fecha y hora
- **uppercase**: Texto en mayúsculas
- **lowercase**: Texto en minúsculas
- **capitalize**: Primera letra en mayúscula
- **custom**: Formato personalizado

## 📁 Estructura del Proyecto Exportado

### Archivo de Configuración
```json
{
  "version": "1.0.0",
  "name": "Ticket Editor Project",
  "description": "Proyecto de editor de tickets exportado",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T15:45:00.000Z",
  "ticketWidth": 300,
  "widthUnit": "px",
  "elements": [
    {
      "id": "text-1",
      "type": "text",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 30,
      "content": "{{empresa.nombre}}",
      "fontSize": 14,
      "textAlign": "left"
    }
  ],
  "jsonData": {
    "empresa": {
      "nombre": "Mi Empresa S.A."
    }
  }
}
```

### HTML Generado
El HTML generado incluye:
- **CSS inline** para estilos
- **JavaScript integrado** para procesar datos
- **Función `processTicketTemplate`** para poblar datos
- **Función `fillTable`** para tablas dinámicas
- **Función `getValueByPath`** para acceder a propiedades anidadas
- **Función `executeFormula`** para ejecutar fórmulas JavaScript de forma segura
- **Librería QR integrada** para generar códigos QR dinámicos

## 🔧 Configuración Avanzada

### Conversión de Unidades
- **1 pulgada = 96px**
- **1 cm = 37.795px**
- **Conversión automática** al cambiar unidades

### Límites del Sistema
- **Ancho mínimo**: 50px
- **Ancho máximo**: 1000px
- **Tamaño mínimo de elementos**: 30px
- **Tamaño máximo de elementos**: 800px ancho, 600px alto

### Posicionamiento
- **Coordenadas**: Sistema de coordenadas X/Y
- **Límites**: Elementos siempre dentro del canvas
- **Relativo**: Posicionamiento respecto a otros elementos
- **Offset**: Desplazamiento desde posición relativa

## 🐛 Solución de Problemas

### Problemas Comunes

#### Vista Previa No Muestra Datos
1. **Verificar JSON cargado**: Asegurar que hay datos válidos
2. **Revisar rutas de propiedades**: Confirmar que las rutas existen
3. **Actualizar tablas**: Hacer clic en "🔄 Actualizar Tablas"
4. **Verificar consola**: Revisar logs del iframe

#### Elementos No Se Mueven
1. **Verificar selección**: Elemento debe estar seleccionado
2. **Revisar límites**: Elemento puede estar en el borde
3. **Comprobar teclado**: Asegurar que el foco está en el canvas

#### Tablas No Se Renderizan
1. **Verificar ruta de datos**: Confirmar que `dataPath` es correcta
2. **Revisar columnas**: Asegurar que las propiedades existen
3. **Actualizar vista previa**: Forzar actualización del iframe

#### Fórmulas No Se Ejecutan
1. **Verificar sintaxis JavaScript**: Revisar que el código sea válido
2. **Comprobar timeout**: Aumentar el tiempo de ejecución si es necesario
3. **Revisar manejo de errores**: Configurar mostrar errores para debugging
4. **Verificar variables**: Asegurar que se usan las variables disponibles

#### Error al Exportar
1. **Verificar permisos**: Asegurar permisos de escritura
2. **Revisar navegador**: Algunos navegadores bloquean descargas
3. **Comprobar elementos**: Asegurar que hay elementos en el diseño

### Logs de Depuración
- **Consola del navegador**: Para errores generales
- **Consola del iframe**: Para errores de vista previa
- **Logs de tablas**: Para problemas de renderizado de datos

## 🤝 Contribución

### Desarrollo Local
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd ticket-editor

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

### Estructura de Código
- **Componente principal**: `pages/index.tsx`
- **Interfaces**: Definidas al inicio del archivo
- **Funciones de utilidad**: Agrupadas por funcionalidad
- **Estados**: Gestionados con React hooks

### Convenciones
- **TypeScript**: Tipado estricto para todas las funciones
- **Tailwind CSS**: Clases utilitarias para estilos
- **React Hooks**: useState, useEffect, useRef
- **Eventos**: Manejo consistente de eventos del DOM

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

### Recursos Adicionales
- **Documentación**: Este README
- **Ejemplos**: Archivo `public/ejemplo-datos.json`
- **Plantilla de uso**: Generada con "📚 Ejemplo de uso"

### Contacto
Para soporte técnico o preguntas:
- **Issues**: Crear un issue en el repositorio
- **Documentación**: Revisar este README
- **Ejemplos**: Usar los archivos de ejemplo incluidos

---

**🎫 Editor de Tickets** - Crea layouts profesionales de tickets sin programación
