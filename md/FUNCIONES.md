# Mapeo de Funciones - WhatsApp Mensajes Rápidos

## 📊 Resumen General

- **Total de funciones**: 35+
- **Módulos**: 6 archivos JavaScript
- **Funciones asíncronas**: 8
- **Funciones de UI**: 17
- **Funciones de lógica**: 18

---

## 🗂️ Funciones por Categoría

### 📦 ALMACENAMIENTO (3 funciones) - storage.js

#### `loadData()` - **Async**

- **Descripción**: Carga los datos guardados desde `chrome.storage.local`
- **Funcionalidad**:
  - Recupera configuración y carpetas guardadas
  - Asegura compatibilidad con versiones anteriores (agrega `typingSpeed`, `autoSend`, `debugMode`)
  - **Normaliza datos legacy**: Elimina campo 'name' de sub-mensajes en secuencias
  - Asigna colores faltantes a carpetas
  - Inicializa datos de ejemplo si es primera instalación
  - Retorna una Promise

#### `saveData()`

- **Descripción**: Guarda los datos en `chrome.storage.local`
- **Funcionalidad**:
  - Persiste el objeto `appData` completo
  - Incluye carpetas, mensajes, secuencias, y configuraciones

#### `generateId()`

- **Descripción**: Genera identificadores únicos
- **Funcionalidad**:
  - Combina timestamp con string aleatorio
  - Formato: `"id-{timestamp}-{random}"`

---

### ⌨️ TIPEO Y SIMULACIÓN HUMANA (8 funciones) - typing.js

#### `useMessage(text, messageId)` - **Async**

- **Descripción**: Función principal que escribe un mensaje simulando tipeo humano
- **Parámetros**:
  - `text` - Texto a escribir (soporta `\n` para multilinea)
  - `messageId` - ID del mensaje para animación visual (opcional)
- **Funcionalidad**:
  - Marca `window.isTyping = true` y `cancelTyping = false`
  - Muestra botón de cancelar en UI
  - Agrega clase `waqm-message-writing` al mensaje en sidebar
  - Encuentra el input box de WhatsApp
  - Escribe carácter por carácter con delays gaussianos
  - Maneja saltos de línea con Shift+Enter
  - Chequea `window.cancelTyping` en cada iteración
  - Auto-envía si `appData.autoSend` está activado
  - Oculta botón de cancelar al terminar
  - Logs detallados si `debugMode` está activado

#### `useMessageSequence(sequence, sequenceId)` - **Async**

- **Descripción**: Ejecuta una secuencia de múltiples mensajes consecutivos
- **Parámetros**:
  - `sequence` - Array de objetos `{id, text}`
  - `sequenceId` - ID de la secuencia para animación visual
- **Funcionalidad**:
  - Marca elemento de secuencia con clase `waqm-message-writing`
  - Itera sobre cada mensaje llamando `useMessage()`
  - Agrega delay gaussiano entre mensajes (6x más largo que entre caracteres)
  - Chequea `window.cancelTyping` entre mensajes
  - Remueve animación al finalizar

#### `gaussianRandom(mean, stdDev)`

- **Descripción**: Genera números aleatorios con distribución gaussiana
- **Implementación**: Box-Muller transform
- **Funcionalidad**:
  - Simula patrones de tipeo humano realistas
  - Mayor concentración cerca del promedio
  - Variación natural con desviación estándar
  - Previene valores negativos

#### `getTypingDelayParams()`

- **Descripción**: Retorna parámetros de delay según velocidad configurada
- **Velocidades**:
  - **slow**: baseMean 225ms, stdDev 50ms, peakMax 500ms
  - **normal**: baseMean 120ms, stdDev 25ms, peakMax 300ms
  - **fast**: baseMean 65ms, stdDev 15ms, peakMax 150ms

#### `insertLineBreakHuman(inputBox, debugMode)` - **Async**

- **Descripción**: Inserta salto de línea simulando Shift+Enter humano
- **Funcionalidad**:
  - Dispara evento `keydown` con `shiftKey: true`
  - Inserta `<br>` usando Selection API
  - Dispara evento `input` tipo "insertLineBreak"
  - Dispara evento `keyup` con `shiftKey: true`
  - Logs detallados en modo debug

#### `findWhatsAppInputBox()`

- **Descripción**: Localiza el campo de entrada de WhatsApp Web
- **Selectores**: Prueba múltiples selectores CSS conocidos
- **Retorna**: Elemento DOM del contenteditable o null

#### `findWhatsAppSendButton()`

- **Descripción**: Localiza el botón de enviar de WhatsApp Web
- **Selectores**: Prueba múltiples selectores incluyendo `data-tab`, `aria-label`, iconos
- **Maneja**: Casos donde el selector encuentra el ícono SVG en vez del botón

#### `sleep(ms)` - **Async**

- **Descripción**: Helper para crear delays asíncronos
- **Uso**: `await sleep(100)`

---

### 🎨 INTERFAZ DE USUARIO - SIDEBAR (5 funciones) - ui-sidebar.js

#### `createSidebar()`

- **Descripción**: Crea la barra lateral completa de la extensión
- **Funcionalidad**:
  - Verifica si ya existe (evita duplicados)
  - Genera HTML con header, controles y contenedor de carpetas
  - **Botones export/import** (📤📥) en header
  - **Barra de búsqueda** con placeholder
  - **Control de velocidad** con slider (3 posiciones)
  - **Toggle de envío automático**
  - **Botón de cancelar** (creado pero oculto inicialmente)
  - Botón de minimizar
  - Inicializa event listeners
  - Llama a `renderFolders()`

#### `setupEventListeners()`

- **Descripción**: Configura todos los event listeners de la sidebar
- **Listeners**:
  - Control de velocidad (slider) → actualiza `appData.typingSpeed`
  - Toggle de envío automático → actualiza `appData.autoSend`
  - Botón de minimizar → llama `toggleSidebar()`
  - Botón de expandir → llama `expandSidebar()`
  - **Input de búsqueda** → llama `renderFolders(searchTerm)` en tiempo real
  - **Botón exportar** → llama `exportFoldersAndMessages()`
  - **Botón importar** → abre file picker
  - **File picker** → lee JSON y llama `importFoldersAndMessages()`
  - Botón "Nueva Carpeta" → llama `addFolder()`
  - **Botón cancelar** → setea `window.cancelTyping = true`

#### `toggleSidebar()`

- **Descripción**: Alterna entre estado minimizado/expandido del sidebar
- **Funcionalidad**:
  - Toggle clase `waqm-minimized`
  - Muestra/oculta contenido
  - Cambia texto del botón ("−" ↔ "+")
  - Controla visibilidad del botón de expansión flotante

#### `expandSidebar()`

- **Descripción**: Expande el sidebar desde estado minimizado
- **Funcionalidad**:
  - Remueve clase `waqm-minimized`
  - Restaura display del contenido
  - Oculta botón de expansión flotante

---

### 📂 RENDERIZADO (4 funciones) - ui-folders.js

#### `renderFolders(searchTerm = "")`

- **Descripción**: Renderiza todas las carpetas con filtro de búsqueda
- **Parámetros**: `searchTerm` - String de búsqueda (opcional)
- **Funcionalidad**:
  - Limpia contenedor actual
  - Normaliza término de búsqueda (sin acentos, lowercase)
  - Itera sobre `appData.folders`
  - **Filtra por nombre de carpeta**
  - **Filtra mensajes y secuencias** que coincidan
  - Para secuencias, busca también en sub-mensajes
  - Crea elementos de carpeta con `createFolderElement()`
  - Solo muestra carpetas que tengan coincidencias (o todas si no hay búsqueda)

#### `createFolderElement(folder)`

- **Descripción**: Crea el elemento DOM completo de una carpeta
- **Funcionalidad**:
  - Aplica **color personalizado** (background + border)
  - Renderiza header con título y botones
  - Ícono de colapso (▶ o ▼)
  - Botones: ➕ Nuevo mensaje, ✏️ Editar, 🗑️ Eliminar
  - Itera mensajes y crea elementos según tipo (normal o sequence)
  - Conecta event listeners para todas las acciones

#### `createMessageElement(message, folderId)`

- **Descripción**: Crea el elemento DOM de un mensaje normal
- **Parámetros**:
  - `message` - objeto `{id, name, text}`
  - `folderId` - ID de la carpeta padre
- **Funcionalidad**:
  - Muestra nombre del mensaje en negrita
  - Preview del texto (primeras 50 caracteres)
  - Detecta mensajes multilínea (agrega indicador `↵`)
  - Botones de acción: ✅ Usar, ✏️ Editar, 🗑️ Eliminar
  - Conecta listeners para `useMessage()`, `editMessage()`, `deleteMessage()`

#### `createSequenceElement(sequence, folderId)`

- **Descripción**: Crea el elemento DOM de una secuencia de mensajes
- **Parámetros**:
  - `sequence` - objeto `{id, type: 'sequence', name, sequence: [{id, text}]}`
  - `folderId` - ID de la carpeta padre
- **Funcionalidad**:
  - Muestra nombre de la secuencia
  - Lista de sub-mensajes numerados (1., 2., 3., ...)
  - Preview de cada sub-mensaje (50 caracteres)
  - Botones: ✅ Usar secuencia, ✏️ Editar, 🗑️ Eliminar
  - Conecta `useMessageSequence()` para ejecutar secuencia completa
  - **Data attribute** `data-sequence-id` para animaciones

---

### 📁 GESTIÓN DE CARPETAS (4 funciones) - ui-folders.js

#### `toggleFolder(folderId)`

- **Descripción**: Alterna estado colapsado/expandido de una carpeta
- **Funcionalidad**:
  - Invierte valor de `folder.collapsed`
  - Guarda con `saveData()`
  - Re-renderiza con `renderFolders()`

#### `addFolder()` - **Async**

- **Descripción**: Crea una nueva carpeta
- **Funcionalidad**:
  - Muestra `showFolderModal()` con título "Nueva Carpeta"
  - Usuario selecciona nombre y color
  - Crea objeto carpeta: `{id, name, color, collapsed: false, messages: []}`
  - Agrega a `appData.folders`
  - Guarda y re-renderiza

#### `editFolder(folderId)` - **Async**

- **Descripción**: Edita nombre y color de carpeta existente
- **Funcionalidad**:
  - Busca carpeta por ID
  - Muestra modal pre-llenado con valores actuales
  - Actualiza propiedades si usuario confirma
  - Guarda y re-renderiza

#### `deleteFolder(folderId)`

- **Descripción**: Elimina una carpeta y todos sus mensajes
- **Funcionalidad**:
  - Muestra confirmación al usuario
  - Filtra carpeta del array `appData.folders`
  - **Elimina también todos los mensajes y secuencias** de la carpeta
  - Guarda y re-renderiza

---

### 💬 GESTIÓN DE MENSAJES Y SECUENCIAS (7 funciones) - ui-folders.js

#### `addMessageOrSequence(folderId)` - **Async**

- **Descripción**: Modal unificado para agregar mensaje normal o secuencia
- **Funcionalidad**:
  - Busca carpeta por ID
  - Muestra `showMessageModal()` con toggle
  - Si `result.isSequence === true`:
    - Crea objeto: `{id, type: 'sequence', name, sequence: [{id, text}]}`
  - Si es mensaje normal:
    - Crea objeto: `{id, name, text}`
  - Agrega a `folder.messages`
  - Guarda y re-renderiza

#### `editMessage(folderId, messageId)` - **Async**

- **Descripción**: Edita un mensaje normal existente
- **Funcionalidad**:
  - Busca carpeta y mensaje por IDs
  - Muestra modal pre-llenado con `nameValue` y `textValue`
  - Actualiza `message.name` y `message.text`
  - Guarda y re-renderiza

#### `deleteMessage(folderId, messageId)`

- **Descripción**: Elimina un mensaje normal
- **Funcionalidad**:
  - Muestra confirmación
  - Filtra mensaje del array `folder.messages`
  - Guarda y re-renderiza

#### `editSequence(folderId, sequenceId)` - **Async**

- **Descripción**: Edita una secuencia de mensajes
- **Funcionalidad**:
  - Busca carpeta y secuencia por IDs
  - Muestra modal con toggle activado (`isSequence: true`)
  - Pre-llena con `nameValue` y `sequenceValue`
  - Usuario puede:
    - Cambiar nombre de la secuencia
    - Agregar/eliminar/reordenar sub-mensajes
    - Editar texto de cada sub-mensaje
  - Actualiza `sequence.name` y `sequence.sequence`
  - Guarda y re-renderiza

#### `deleteSequence(folderId, sequenceId)`

- **Descripción**: Elimina una secuencia completa
- **Funcionalidad**:
  - Muestra confirmación
  - Filtra secuencia del array `folder.messages`
  - Guarda y re-renderiza

#### `normalize(str)`

- **Descripción**: Normaliza strings para búsqueda insensible a acentos
- **Funcionalidad**:
  - Chequea si `str` es null/undefined → retorna `""`
  - Normaliza NFD (descompone caracteres acentuados)
  - Remueve diacríticos con regex `/\p{Diacritic}/gu`
  - Convierte a lowercase
  - **Ejemplo**: `"Ñoño"` → `"nono"`

---

### 🎭 MODALES (3 funciones) - ui-modals.js

#### `showMessageModal({ title, nameValue, textValue, sequenceValue, isSequence })` - **Async**

- **Descripción**: Modal unificado para crear/editar mensajes y secuencias
- **Parámetros**:
  - `title` - Título del modal
  - `nameValue` - Nombre pre-llenado (opcional)
  - `textValue` - Texto pre-llenado para mensaje normal (opcional)
  - `sequenceValue` - Array de sub-mensajes para secuencia (opcional)
  - `isSequence` - Boolean para mostrar UI de secuencia (default: false)
- **Funcionalidad**:
  - **Toggle** para cambiar entre mensaje simple y secuencia
  - **Modo mensaje simple**:
    - Input para nombre
    - Textarea para texto
  - **Modo secuencia**:
    - Input para nombre de secuencia
    - Lista editable de sub-mensajes
    - Botón "Agregar mensaje" para añadir pasos
    - Botones ⬆️⬇️ para reordenar
    - Botón 🗑️ para eliminar paso
  - Retorna Promise que resuelve a:
    - `{isSequence: false, name, text}` para mensaje simple
    - `{isSequence: true, name, sequence: [{id, text}]}` para secuencia
    - `null` si se cancela
  - **Nota**: Los sub-mensajes NO tienen campo 'name', solo {id, text}

#### `showFolderModal({ title, nameValue, colorValue })` - **Async**

- **Descripción**: Modal para crear/editar carpetas con selector de color
- **Parámetros**:
  - `title` - Título del modal
  - `nameValue` - Nombre pre-llenado (opcional)
  - `colorValue` - Color pre-seleccionado (opcional)
- **Funcionalidad**:
  - Input para nombre de carpeta
  - Grid de colores seleccionables (8 colores de `FOLDER_COLORS`)
  - Muestra preview visual del color
  - Retorna `{name, color}` o `null` si se cancela

#### `escapeHtml(text)`

- **Descripción**: Sanitiza HTML para prevenir XSS
- **Funcionalidad**:
  - Reemplaza `&`, `<`, `>`, `"`, `'` con entidades HTML
  - Se usa antes de insertar contenido con `innerHTML`

---

### 📤 EXPORTAR/IMPORTAR (2 funciones) - init.js

#### `exportFoldersAndMessages()`

- **Descripción**: Exporta todas las categorías y mensajes a archivo JSON
- **Funcionalidad**:
  - Mapea `appData.folders` a estructura limpia
  - Preserva estructura de secuencias con sub-mensajes
  - Crea Blob con JSON formateado (indent 2)
  - Descarga archivo: `waqm-categorias-mensajes.json`
  - Limpia URL después de descarga

#### `importFoldersAndMessages(data)`

- **Descripción**: Importa y valida datos desde archivo JSON
- **Parámetros**: `data` - Objeto parseado desde JSON
- **Funcionalidad**:
  - Valida estructura: debe tener array `folders`
  - Valida cada carpeta: debe tener `id` y `name`
  - Normaliza estructura:
    - Asigna color default si falta
    - Asigna `collapsed: false` si falta
    - Valida cada mensaje/secuencia
    - **Limpia datos legacy**: Elimina campo 'name' de sub-mensajes en secuencias
  - Pide confirmación antes de reemplazar datos
  - Reemplaza `appData.folders` completamente
  - Guarda y re-renderiza
  - Muestra mensaje de éxito

---

### 🚀 INICIALIZACIÓN (2 funciones) - init.js

#### `init()` - **Async**

- **Descripción**: Función principal de inicialización de la extensión
- **Funcionalidad**:
  - Espera a que WhatsApp Web cargue con `waitForWhatsAppToLoad()`
  - Carga datos con `loadData()`
  - Crea sidebar con `createSidebar()`
  - Configura listeners con `setupEventListeners()`
  - Log de confirmación en consola

#### `waitForWhatsAppToLoad()` - **Async**

- **Descripción**: Espera a que WhatsApp Web esté completamente cargado
- **Funcionalidad**:
  - Busca elemento característico de WhatsApp Web
  - Reintenta cada 500ms con delay exponencial
  - Timeout después de 20 intentos
  - Retorna Promise

---

## 🌐 Variables Globales

### En `window` (compartidas entre módulos)

**Datos:**

- `window.FOLDER_COLORS` - Array de 8 objetos `{name, value, light}`
- `window.appData` - Objeto con:
  - `typingSpeed`: "slow" | "normal" | "fast"
  - `autoSend`: boolean
  - `debugMode`: boolean
  - `folders`: Array de carpetas con mensajes y secuencias

**Flags de control:**

- `window.cancelTyping` - Boolean para cancelar escritura en progreso
- `window.isTyping` - Boolean indicando si está escribiendo actualmente

**Funciones exportadas:**
Todas las funciones de cada módulo se exportan a `window` para acceso global entre módulos.

### ⌨️ ESCRITURA EN WHATSAPP (6 funciones)

#### `gaussianRandom(mean, stdDev)` - **13 líneas** (412-424)

- **Tipo**: `function`
- **Parámetros**:
  - `mean` - valor promedio
  - `stdDev` - desviación estándar
- **Descripción**: Genera números aleatorios con distribución gaussiana
- **Funcionalidad**:
  - Implementa Box-Muller transform
  - Simula tiempos de escritura humanos realistas
  - Asegura valores no negativos

#### `getTypingDelayParams()` - **26 líneas** (427-452)

- **Tipo**: `function`
- **Descripción**: Retorna parámetros de delay según velocidad configurada
- **Funcionalidad**:
  - Lee `appData.typingSpeed`
  - Retorna objeto con: `baseMean`, `baseStdDev`, `peakMax`, `peakChance`
  - Velocidades: slow (225ms), normal (120ms), fast (65ms)

#### `useMessage(text)` - **155 líneas** (455-609)

- **Tipo**: `async function`
- **Parámetros**: `text` - mensaje a escribir
- **Descripción**: **FUNCIÓN PRINCIPAL** - Escribe mensaje en WhatsApp simulando escritura humana
- **Funcionalidad**:
  - Busca campo de entrada de WhatsApp
  - Limpia contenido previo
  - Itera carácter por carácter:
    - Maneja saltos de línea (`\n`) con eventos Enter especiales
    - Dispara eventos: keydown, keypress, input, keyup
    - Usa `execCommand` o fallback manual
    - Aplica delays gaussianos entre caracteres
    - Pausas extras después de puntuación (200-600ms)
  - Triggers finales para detectar cambios
  - **Auto-envío**: Si está habilitado, hace clic en botón enviar

#### `findWhatsAppSendButton()` - **21 líneas** (612-632)

- **Tipo**: `function`
- **Descripción**: Busca el botón de enviar de WhatsApp Web
- **Funcionalidad**:
  - Prueba múltiples selectores (aria-label, data-icon, etc.)
  - Maneja casos de span (ícono) buscando botón padre
  - Retorna elemento o null

#### `findWhatsAppInputBox()` - **19 líneas** (635-653)

- **Tipo**: `function`
- **Descripción**: Busca el campo de entrada de texto de WhatsApp
- **Funcionalidad**:
  - Prueba múltiples selectores (contenteditable, role, data-tab)
  - Compatible con diferentes versiones de WhatsApp Web
  - Retorna elemento o null

#### `sleep(ms)` - **3 líneas** (656-658)

- **Tipo**: `function`
- **Parámetros**: `ms` - milisegundos a esperar
- **Descripción**: Función helper para delays asíncronos
- **Funcionalidad**:
  - Retorna Promise que se resuelve después de `ms` milisegundos

---

### 🎭 MODALES (2 funciones)

#### `showMessageModal({ title, nameValue, textValue })` - **91 líneas** (662-752)

- **Tipo**: `function`
- **Parámetros**: Objeto con título, nombre inicial y texto inicial
- **Descripción**: Muestra modal para crear/editar mensajes
- **Funcionalidad**:
  - Crea overlay y modal DOM
  - Campos: nombre (input) y texto (textarea con soporte multilínea)
  - Validación de campos requeridos (resalta en rojo)
  - Event listeners:
    - Click en "Guardar" → valida y retorna datos
    - Click en "Cancelar" → retorna null
    - Click fuera del modal → cierra
    - Tecla ESC → cierra
    - Ctrl+Enter → guarda
  - Retorna Promise con `{name, text}` o `null`

#### `showFolderModal({ title, nameValue, colorValue })` - **108 líneas** (755-862)

- **Tipo**: `function`
- **Parámetros**: Objeto con título, nombre inicial y color inicial
- **Descripción**: Muestra modal para crear/editar carpetas con selector de color
- **Funcionalidad**:
  - Genera opciones de color desde `FOLDER_COLORS`
  - Muestra cada color con preview visual
  - Permite seleccionar color (marca con borde)
  - Validación de nombre requerido
  - Event listeners similares a `showMessageModal`
  - Retorna Promise con `{name, color}` o `null`

---

### 🛠️ UTILIDADES (1 función)

#### `escapeHtml(text)` - **4 líneas** (866-869)

- **Tipo**: `function`
- **Parámetros**: `text` - string a escapar
- **Descripción**: Escapa caracteres HTML para prevenir XSS
- **Funcionalidad**:
  - Usa `textContent` de elemento temporal
  - Retorna HTML seguro

---

### 🎯 EVENT LISTENERS (1 función)

#### `setupEventListeners()` - **34 líneas** (873-906)

- **Tipo**: `function`
- **Descripción**: Configura todos los event listeners del sidebar
- **Funcionalidad**:
  - **Botón "Nueva Carpeta"**: → `addFolder()`
  - **Botón toggle sidebar**: → `toggleSidebar()`
  - **Slider de velocidad**:
    - Lee valor inicial de `appData`
    - Al cambiar: actualiza `typingSpeed` y guarda
  - **Toggle auto-envío**:
    - Al cambiar: actualiza `autoSend` y guarda

---

### 🚀 INICIALIZACIÓN (2 funciones)

#### `init()` - **13 líneas** (1000-1012)

- **Tipo**: `async function`
- **Descripción**: Función de inicialización principal
- **Funcionalidad**:
  - Espera carga completa de WhatsApp Web
  - Carga datos guardados
  - Crea sidebar
  - Logs de estado en consola

#### `waitForWhatsAppToLoad()` - **13 líneas** (1015-1027)

- **Tipo**: `function`
- **Descripción**: Espera a que WhatsApp Web esté completamente cargado
- **Funcionalidad**:
  - Chequea presencia del elemento `#app` cada 500ms
  - Espera 2 segundos adicionales de seguridad
  - Retorna Promise

---

## 📈 Estadísticas por Tamaño

### Funciones Grandes (>50 líneas)

1. **`useMessage(text)`** - 155 líneas ⭐ _Función más compleja_
2. **`showFolderModal()`** - 108 líneas
3. **`showMessageModal()`** - 91 líneas
4. **`createFolderElement()`** - 66 líneas
5. **`createSidebar()`** - 52 líneas
6. **`createMessageElement()`** - 50 líneas

### Funciones Medianas (20-50 líneas)

1. **`loadData()`** - 42 líneas
2. **`setupEventListeners()`** - 34 líneas
3. **`getTypingDelayParams()`** - 26 líneas
4. **`findWhatsAppSendButton()`** - 21 líneas
5. **`editMessage()`** - 20 líneas
6. **`addMessage()`** - 19 líneas
7. **`findWhatsAppInputBox()`** - 19 líneas
8. **`addFolder()`** - 18 líneas
9. **`toggleSidebar()`** - 18 líneas
10. **`editFolder()`** - 17 líneas

### Funciones Pequeñas (<20 líneas)

1. **`gaussianRandom()`** - 13 líneas
2. **`deleteFolder()`** - 13 líneas
3. **`init()`** - 13 líneas
4. **`waitForWhatsAppToLoad()`** - 13 líneas
5. **`expandSidebar()`** - 12 líneas
6. **`deleteMessage()`** - 12 líneas
7. **`renderFolders()`** - 11 líneas
8. **`toggleFolder()`** - 8 líneas
9. **`saveData()`** - 5 líneas
10. **`escapeHtml()`** - 4 líneas
11. **`generateId()`** - 3 líneas
12. **`sleep()`** - 3 líneas

---

## 🔄 Flujo de Ejecución

```
Inicio
  ↓
init()
  ↓
waitForWhatsAppToLoad() ──→ Espera #app
  ↓
loadData() ──→ Carga desde storage
  ↓
createSidebar()
  ├─→ setupEventListeners()
  │     ├─→ addFolder → showFolderModal
  │     ├─→ toggleSidebar
  │     ├─→ speedSlider → saveData
  │     └─→ autoSendToggle → saveData
  │
  └─→ renderFolders()
        └─→ createFolderElement()
              ├─→ createMessageElement()
              │     └─→ useMessage() ──→ Auto-send?
              ├─→ addMessage → showMessageModal
              ├─→ editMessage → showMessageModal
              ├─→ deleteMessage
              ├─→ editFolder → showFolderModal
              ├─→ deleteFolder
              └─→ toggleFolder
```

---

## 🎯 Funciones Críticas para el Funcionamiento

1. **`useMessage()`** - Core de la extensión, simula escritura humana
2. **`loadData()` / `saveData()`** - Persistencia de datos
3. **`createSidebar()`** - Interfaz principal
4. **`renderFolders()`** - Actualización dinámica de UI
5. **`showMessageModal()` / `showFolderModal()`** - Entrada de datos del usuario

---

## 💡 Optimizaciones Posibles

- **`useMessage()`**: Podría dividirse en sub-funciones (handleLineBreak, handleCharacter)
- **Modales**: Extraer lógica común en función base
- **Event listeners**: Usar delegación de eventos en lugar de múltiples listeners
- **Renderizado**: Implementar virtual DOM o diff para actualizaciones parciales
