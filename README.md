# Editor de Tickets - Generador de Layouts HTML

Una aplicación web para crear layouts de tickets personalizables que se pueden convertir a PDF. Permite diseñar tickets con elementos de texto y tablas, configurar su ancho en diferentes unidades y cargar datos JSON para generar contenido dinámico.

## Características

### 🎨 Editor Visual
- **Interfaz drag & drop** para colocar elementos
- **Área de diseño** con dimensiones configurables
- **Elementos redimensionables** y movibles
- **Selección visual** de elementos

### 📏 Configuración de Dimensiones
- **Ancho configurable** en píxeles (px), pulgadas (in) o centímetros (cm)
- **Conversión automática** entre unidades
- **Vista previa** del ancho en píxeles

### 📝 Elementos Disponibles
- **Elementos de texto**: Labels editables para información estática
- **Tablas dinámicas**: Configurables con columnas personalizables
- **Posicionamiento libre** en el layout

### 📊 Configuración de Tablas
- **Ruta de datos**: Especifica la ubicación de los datos en el JSON
- **Columnas configurables**: Define encabezados y propiedades
- **Mapeo dinámico**: Conecta propiedades JSON con columnas de tabla

### 📄 Generación de HTML
- **HTML puro** sin dependencias externas
- **CSS integrado** para estilos
- **JavaScript embebido** para llenar datos dinámicos
- **Descarga automática** del archivo generado

## Instalación y Uso

### Requisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ticket-editor

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Uso Básico

1. **Configurar el ancho del ticket**
   - Selecciona la unidad (px, in, cm)
   - Ajusta el valor según tus necesidades

2. **Cargar datos JSON**
   - Haz clic en "Seleccionar archivo"
   - Elige un archivo JSON con tus datos
   - Verifica que se cargó correctamente

3. **Agregar elementos**
   - Arrastra elementos desde la barra lateral
   - Colócalos en el área de diseño
   - Ajusta su posición y tamaño

4. **Configurar tablas**
   - Haz clic en una tabla para configurarla
   - Define la ruta de datos (ej: `productos.items`)
   - Agrega columnas con encabezados y propiedades

5. **Generar HTML**
   - Haz clic en "Generar HTML"
   - Se descargará automáticamente el archivo

## Estructura del JSON

El archivo JSON debe tener una estructura que permita acceder a los datos mediante rutas. Ejemplo:

```json
{
  "empresa": {
    "nombre": "Mi Empresa S.A.",
    "direccion": "Calle Principal 123"
  },
  "venta": {
    "numero": "TICK-001",
    "fecha": "2024-01-15"
  },
  "productos": {
    "items": [
      {
        "codigo": "PROD-001",
        "nombre": "Laptop HP",
        "precio": 850.00
      }
    ]
  }
}
```

### Rutas de Datos
- `empresa.nombre` → "Mi Empresa S.A."
- `productos.items` → Array de productos
- `venta.numero` → "TICK-001"

## Funcionalidades Avanzadas

### Redimensionamiento de Elementos
- **Esquina inferior derecha**: Arrastra para redimensionar
- **Mínimo 50px de ancho** y 30px de alto
- **Proporción libre** mantenida

### Movimiento de Elementos
- **Arrastra elementos** para moverlos
- **Posicionamiento preciso** en píxeles
- **Selección visual** con borde azul

### Configuración de Tablas
- **Ruta de datos**: Especifica dónde están los datos
- **Columnas dinámicas**: Agrega/elimina según necesites
- **Mapeo de propiedades**: Conecta JSON con columnas

## Archivo HTML Generado

El HTML generado incluye:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Estilos CSS integrados */
        .ticket { width: 300px; /* Ancho configurado */ }
        .element { position: absolute; /* Posicionamiento */ }
        .table { /* Estilos de tabla */ }
    </style>
</head>
<body>
    <div class="ticket">
        <!-- Elementos posicionados -->
    </div>
    <script>
        // Datos JSON embebidos
        const data = { /* tus datos */ };
        
        // JavaScript para llenar tablas
        // Función getValueByPath para acceder a datos
    </script>
</body>
</html>
```

## Conversión a PDF

Para convertir el HTML generado a PDF, puedes usar:

### Opciones Recomendadas
1. **Puppeteer**: Automatización con Node.js
2. **wkhtmltopdf**: Herramienta de línea de comandos
3. **Servicios web**: APIs como PDFShift, DocRaptor
4. **Navegador**: Imprimir como PDF

### Ejemplo con Puppeteer
```javascript
const puppeteer = require('puppeteer');

async function htmlToPDF(htmlPath, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`);
  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();
}
```

## Personalización

### Estilos CSS
Los estilos se generan automáticamente, pero puedes modificar:
- **Fuentes**: Cambia `font-family` en `.ticket`
- **Colores**: Ajusta `background-color` y `border`
- **Espaciado**: Modifica `padding` y `margin`

### JavaScript
El código JavaScript generado incluye:
- **Función getValueByPath**: Para acceder a datos anidados
- **Llenado automático de tablas**: Basado en configuración
- **Manejo de errores**: Para datos faltantes

## Solución de Problemas

### Elementos no se mueven
- Asegúrate de hacer clic en el elemento (no en el input)
- Verifica que el elemento esté seleccionado (borde azul)

### Tablas no se llenan
- Revisa la ruta de datos en la configuración
- Verifica que el JSON tenga la estructura correcta
- Comprueba que las propiedades coincidan

### HTML no se genera
- Asegúrate de tener elementos en el diseño
- Verifica que el navegador permita descargas
- Revisa la consola para errores

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Revisa la documentación
- Consulta los ejemplos incluidos
