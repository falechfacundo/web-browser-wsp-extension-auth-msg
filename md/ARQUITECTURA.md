# Estructura Modular - WhatsApp Mensajes Rápidos

## 📁 Arquitectura de Archivos

La extensión ha sido modularizada desde un único archivo `content.js` de 1033 líneas a 6 módulos organizados:

```
extension-custom-chrome/
├── manifest.json          # Configuración de carga de módulos
├── styles.css            # Estilos (sin cambios)
├── storage.js            # Gestión de almacenamiento (3 funciones)
├── typing.js             # Simulación escritura humana (6 funciones)
├── ui-modals.js          # Modales de UI (3 funciones)
├── ui-folders.js         # Carpetas y mensajes (10 funciones)
├── ui-sidebar.js         # Barra lateral (4 funciones)
└── init.js               # Inicialización (2 funciones + config)
```

## 🔄 Orden de Carga

Los archivos se cargan en este orden específico (definido en `manifest.json`):

1. **storage.js** - Funciones base de almacenamiento
2. **typing.js** - Motor de escritura
3. **ui-modals.js** - Modales (requerido por ui-folders)
4. **ui-folders.js** - Gestión de carpetas/mensajes (usa modals)
5. **ui-sidebar.js** - Interfaz lateral (usa folders)
6. **init.js** - Entry point e inicialización

## 📦 Detalle de Módulos

### storage.js (3 funciones)

- `loadData()` - Carga datos desde chrome.storage.local con migración de datos legacy
- `saveData()` - Persiste datos en chrome.storage.local
- `generateId()` - Genera IDs únicos timestamp-based

### typing.js (8 funciones)

- `gaussianRandom()` - Distribución gaussiana para delays (Box-Muller transform)
- `getTypingDelayParams()` - Parámetros según velocidad (slow/normal/fast)
- `useMessage()` - **Core**: Escribe mensaje car por car simulando humano
- `useMessageSequence()` - Ejecuta secuencia de múltiples mensajes con delays
- `findWhatsAppInputBox()` - Localiza campo de entrada de WhatsApp
- `findWhatsAppSendButton()` - Localiza botón enviar de WhatsApp
- `insertLineBreakHuman()` - Inserta saltos de línea con Shift+Enter
- `sleep()` - Helper de delays asíncronos

**Variables globales:**

- `window.cancelTyping` - Flag para cancelar escritura en progreso
- `window.isTyping` - Flag indicando si está escribiendo actualmente

### ui-modals.js (3 funciones)

- `showMessageModal()` - **Modal unificado** con toggle para mensajes simples o secuencias
- `showFolderModal()` - Modal crear/editar carpetas con selector de colores
- `escapeHtml()` - Sanitización XSS para prevenir inyección

### ui-folders.js (14 funciones)

- `renderFolders(searchTerm)` - Renderiza carpetas con filtro de búsqueda
- `createFolderElement()` - Crea elemento DOM de carpeta con color personalizado
- `createMessageElement()` - Crea elemento DOM de mensaje normal
- `createSequenceElement()` - Crea elemento DOM de secuencia de mensajes
- `toggleFolder()` - Toggle colapsar/expandir carpeta
- `addFolder()` - Crea nueva carpeta con modal
- `editFolder()` - Edita carpeta existente (nombre y color)
- `deleteFolder()` - Elimina carpeta con confirmación
- `addMessageOrSequence()` - Crea nuevo mensaje o secuencia (modal unificado)
- `editMessage()` - Edita mensaje existente
- `deleteMessage()` - Elimina mensaje con confirmación
- `editSequence()` - Edita secuencia existente con sub-mensajes
- `deleteSequence()` - Elimina secuencia con confirmación
- `normalize()` - Normaliza strings (remover acentos, lowercase) para búsqueda

### ui-sidebar.js (5 funciones)

- `createSidebar()` - Crea HTML completo de barra lateral con controles
- `setupEventListeners()` - Configura todos los listeners (búsqueda, export/import, controles)
- `toggleSidebar()` - Minimizar/expandir sidebar
- `expandSidebar()` - Expande desde estado minimizado
- **Botón de cancelar** - Se crea en sidebar y se muestra/oculta durante tipeo

**Elementos UI:**

- Barra de búsqueda con filtrado en tiempo real
- Botones exportar/importar (📤📥)
- Control de velocidad (slider: Lento/Normal/Rápido)
- Toggle de envío automático
- Botón de cancelar tipeo (aparece durante escritura)

### init.js (Entry Point + Export/Import)

**Configuración global:**

- `FOLDER_COLORS` - Array de 8 colores predefinidos con valores y variantes
- `appData` - Estado global de la aplicación

**Funciones:**

- `exportFoldersAndMessages()` - Exporta datos a JSON incluyendo secuencias
- `importFoldersAndMessages()` - Importa y valida datos JSON con normalización
- `init()` - Función principal de inicialización
- `waitForWhatsAppToLoad()` - Espera carga de WhatsApp Web

## 🌐 Variables Globales

Las siguientes variables se exponen en `window` para compartir entre módulos:

### Datos

- `window.FOLDER_COLORS` - Array de colores predefinidos
- `window.appData` - Estado de la aplicación

### Funciones

Todas las funciones de cada módulo se exportan a `window` para acceso global.

## ✅ Ventajas de la Modularización

1. **Mantenibilidad**: Código organizado por responsabilidad
2. **Legibilidad**: Archivos más pequeños y enfocados
3. **Debugging**: Más fácil localizar problemas
4. **Escalabilidad**: Más simple agregar nuevas features
5. **Testing**: Cada módulo puede testearse independientemente

## 🔧 Migración desde content.js

- ✅ **Sin cambios en funcionalidad**
- ✅ **Sin cambios en comportamiento**
- ✅ **Sin cambios en UI/UX**
- ✅ **Compatible con datos existentes**

El archivo `content.js` original puede ser archivado o eliminado.

## 📝 Notas Técnicas

- **Patrón de exportación**: Se usa `window.nombreFuncion` para compartir entre módulos
- **Compatibilidad**: Funciona con Manifest V3
- **Dependencias**: Sin bibliotecas externas
- **Browser**: Compatible con Chrome/Edge
