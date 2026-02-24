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

- `loadData()` - Carga datos desde chrome.storage.local
- `saveData()` - Persiste datos en chrome.storage.local
- `generateId()` - Genera IDs únicos

### typing.js (6 funciones)

- `gaussianRandom()` - Distribución gaussiana para delays
- `getTypingDelayParams()` - Parámetros según velocidad
- `useMessage()` - **Core**: Escribe mensaje simulando humano
- `findWhatsAppInputBox()` - Localiza campo de entrada
- `findWhatsAppSendButton()` - Localiza botón enviar
- `sleep()` - Helper de delays

### ui-modals.js (3 funciones)

- `showMessageModal()` - Modal crear/editar mensajes
- `showFolderModal()` - Modal crear/editar carpetas + colores
- `escapeHtml()` - Sanitización XSS

### ui-folders.js (10 funciones)

- `renderFolders()` - Renderiza todas las carpetas
- `createFolderElement()` - Crea elemento DOM de carpeta
- `createMessageElement()` - Crea elemento DOM de mensaje
- `toggleFolder()` - Toggle colapsar/expandir
- `addFolder()` - Crea nueva carpeta
- `editFolder()` - Edita carpeta existente
- `deleteFolder()` - Elimina carpeta
- `addMessage()` - Crea nuevo mensaje
- `editMessage()` - Edita mensaje existente
- `deleteMessage()` - Elimina mensaje

### ui-sidebar.js (4 funciones)

- `createSidebar()` - Crea HTML de barra lateral
- `setupEventListeners()` - Configura listeners
- `toggleSidebar()` - Minimizar/expandir sidebar
- `expandSidebar()` - Expande desde minimizado

### init.js (Entry Point)

- Define `FOLDER_COLORS` y `appData` globales
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
