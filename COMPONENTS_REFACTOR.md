# Refactorización de Componentes - Editor de Tickets

## Resumen

Se ha refactorizado el archivo monolítico `pages/index.tsx` (6502 líneas) en componentes más pequeños y manejables para mejorar la mantenibilidad y legibilidad del código.

## Estructura de Componentes

### 1. **types.ts** - Tipos y Interfaces
- **Ubicación**: `components/types.ts`
- **Contenido**: Todas las interfaces TypeScript del proyecto
- **Interfaces principales**:
  - `TicketElement`: Elemento base del ticket
  - `TableColumn`: Configuración de columna de tabla
  - `TableConfig`: Configuración completa de tabla
  - `ImageConfig`: Configuración de imagen
  - `FormulaConfig`: Configuración de fórmula JavaScript
  - `ProjectConfig`: Configuración del proyecto

### 2. **CodeMirrorEditor.tsx** - Editor de Código
- **Responsabilidad**: Editor de código JavaScript para fórmulas
- **Props**: `value`, `onChange`, `placeholder`
- **Características**: Sintaxis highlighting, autocompletado, line numbers

### 3. **StartupModal.tsx** - Modal de Inicio
- **Responsabilidad**: Modal inicial para crear o cargar proyecto
- **Props**: `onNewProject`, `onLoadProject`
- **UI**: Botones para nueva proyecto y cargar existente

### 4. **ProjectNameModal.tsx** - Modal de Nombre
- **Responsabilidad**: Configurar nombre del proyecto
- **Props**: `projectName`, `onProjectNameChange`, `onSubmit`, `onCancel`
- **UI**: Input de texto y botones de acción

### 5. **ImportSuccessModal.tsx** - Modal de Importación
- **Responsabilidad**: Confirmar importación exitosa
- **Props**: `importedProjectInfo`, `onClose`
- **UI**: Información del proyecto importado

### 6. **Header.tsx** - Encabezado Principal
- **Responsabilidad**: Mostrar información del proyecto
- **Props**: `projectName`, `elementsCount`, `ticketWidth`, `widthUnit`
- **UI**: Nombre del proyecto, estadísticas y configuración

### 7. **Toolbar.tsx** - Barra de Herramientas
- **Responsabilidad**: Acciones principales de la aplicación
- **Props**: Múltiples funciones de callback y estados
- **UI**: Botones para preview, guardar, exportar, importar, etc.
- **Submenús**: Tamaño, elementos e información

### 8. **Sidebar.tsx** - Barra Lateral
- **Responsabilidad**: Configuración del ticket y elementos arrastrables
- **Props**: Configuración del ticket, JSON data, funciones de callback
- **UI**: Configuración de ancho, upload de JSON, elementos arrastrables

### 9. **JsonViewer.tsx** - Visor de JSON
- **Responsabilidad**: Mostrar y navegar datos JSON
- **Props**: `currentJsonData`
- **UI**: Árbol navegable de propiedades JSON con botones de copia

### 10. **PreviewPanel.tsx** - Panel de Vista Previa
- **Responsabilidad**: Mostrar preview del ticket generado
- **Props**: `previewHTML`, `ticketWidth`, `widthUnit`, etc.
- **UI**: Iframe con preview del ticket

### 11. **Canvas.tsx** - Área de Diseño
- **Responsabilidad**: Área principal de diseño del ticket
- **Props**: Referencias, estados, funciones de callback
- **UI**: Canvas con zoom, elementos del ticket, controles de debug

### 12. **PropertiesPanel.tsx** - Panel de Propiedades
- **Responsabilidad**: Editar propiedades del elemento seleccionado
- **Props**: Elemento seleccionado, funciones de callback
- **UI**: Formularios específicos según tipo de elemento
- **Características**:
  - Posición y tamaño
  - Posicionamiento relativo
  - Propiedades específicas por tipo
  - Controles de fuente y alineación

### 13. **ElementRenderer.tsx** - Renderizador de Elementos
- **Responsabilidad**: Renderizar elementos individuales en el canvas
- **Props**: Elemento, estado de selección, callbacks
- **UI**: Renderizado específico para cada tipo de elemento
- **Tipos soportados**: Texto, QR, Imagen, Fórmula, Tabla

## Utilidades

### **utils/index.ts**
- **Responsabilidad**: Funciones utilitarias centralizadas
- **Funciones principales**:
  - `getSuggestions`: Sugerencias para autocompletado
  - `convertWidth`: Conversión de unidades de ancho
  - `formatValue`: Formateo de valores
  - `copyToClipboard`: Operaciones de portapapeles
  - `generateJsonPaths`: Generación de rutas JSON
  - `convertImageToBase64`: Conversión de imágenes

## Beneficios de la Refactorización

### 1. **Mantenibilidad**
- Código más fácil de entender y modificar
- Responsabilidades claramente separadas
- Menor acoplamiento entre funcionalidades

### 2. **Reutilización**
- Componentes pueden ser reutilizados en otras partes
- Lógica común centralizada en utils
- Interfaces TypeScript compartidas

### 3. **Testing**
- Componentes individuales más fáciles de testear
- Aislamiento de funcionalidades
- Mocks más simples

### 4. **Colaboración**
- Múltiples desarrolladores pueden trabajar en paralelo
- Conflictos de merge reducidos
- Código más legible para nuevos desarrolladores

### 5. **Performance**
- Re-renderizados más eficientes
- Lazy loading de componentes
- Memoización más efectiva

## Estructura de Archivos

```
components/
├── types.ts                 # Interfaces TypeScript
├── index.ts                 # Exportaciones centralizadas
├── CodeMirrorEditor.tsx     # Editor de código
├── StartupModal.tsx         # Modal de inicio
├── ProjectNameModal.tsx     # Modal de nombre
├── ImportSuccessModal.tsx   # Modal de importación
├── Header.tsx               # Encabezado principal
├── Toolbar.tsx              # Barra de herramientas
├── Sidebar.tsx              # Barra lateral
├── JsonViewer.tsx           # Visor de JSON
├── PreviewPanel.tsx         # Panel de preview
├── Canvas.tsx               # Área de diseño
├── PropertiesPanel.tsx      # Panel de propiedades
└── ElementRenderer.tsx      # Renderizador de elementos

utils/
└── index.ts                 # Funciones utilitarias
```

## Próximos Pasos

1. **Actualizar `pages/index.tsx`**: Usar los nuevos componentes
2. **Implementar estado global**: Considerar Context API o Redux
3. **Testing**: Crear tests unitarios para cada componente
4. **Documentación**: Documentar props y uso de cada componente
5. **Optimización**: Implementar React.memo y useMemo donde sea necesario

## Notas de Implementación

- Todos los componentes mantienen la misma funcionalidad que el código original
- Las interfaces están diseñadas para ser extensibles
- Se mantiene la compatibilidad con el código existente
- Los estilos y clases CSS se preservan intactos
