# Mapeo de Funciones - WhatsApp Mensajes Rápidos

## 📊 Resumen General

- **Total de funciones**: 27
- **Líneas totales del archivo**: 1033
- **Funciones asíncronas**: 5
- **Funciones de UI**: 11
- **Funciones de lógica**: 16

---

## 🗂️ Funciones por Categoría

### 📦 ALMACENAMIENTO (3 funciones)

#### `loadData()` - **42 líneas** (38-79)

- **Tipo**: `async function`
- **Descripción**: Carga los datos guardados desde `chrome.storage.local`
- **Funcionalidad**:
  - Recupera configuración y carpetas guardadas
  - Asegura compatibilidad con versiones anteriores (agrega `typingSpeed`, `autoSend`, `color`)
  - Inicializa datos de ejemplo si es primera instalación
  - Retorna una Promise

#### `saveData()` - **5 líneas** (92-96)

- **Tipo**: `function`
- **Descripción**: Guarda los datos en `chrome.storage.local`
- **Funcionalidad**:
  - Persiste el objeto `appData` completo
  - Muestra log de confirmación en consola

#### `generateId()` - **3 líneas** (99-101)

- **Tipo**: `function`
- **Descripción**: Genera identificadores únicos
- **Funcionalidad**:
  - Combina timestamp con string aleatorio
  - Formato: `"id-{timestamp}-{random}"`

---

### 🎨 INTERFAZ DE USUARIO - SIDEBAR (3 funciones)

#### `createSidebar()` - **52 líneas** (105-156)

- **Tipo**: `function`
- **Descripción**: Crea la barra lateral completa de la extensión
- **Funcionalidad**:
  - Verifica si ya existe (evita duplicados)
  - Genera HTML con controles de velocidad y auto-envío
  - Crea botón de expansión
  - Inicializa event listeners
  - Llama a `renderFolders()`

#### `toggleSidebar()` - **18 líneas** (968-985)

- **Tipo**: `function`
- **Descripción**: Alterna entre estado minimizado/expandido del sidebar
- **Funcionalidad**:
  - Cambia clases CSS
  - Muestra/oculta contenido
  - Alterna texto del botón entre "−" y "+"
  - Controla visibilidad del botón de expansión

#### `expandSidebar()` - **12 líneas** (987-998)

- **Tipo**: `function`
- **Descripción**: Expande el sidebar desde estado minimizado
- **Funcionalidad**:
  - Remueve clase `waqm-minimized`
  - Restaura display y contenido
  - Oculta botón de expansión flotante

---

### 📂 RENDERIZADO (3 funciones)

#### `renderFolders()` - **11 líneas** (160-170)

- **Tipo**: `function`
- **Descripción**: Renderiza todas las carpetas en el contenedor
- **Funcionalidad**:
  - Limpia contenedor actual
  - Itera sobre `appData.folders`
  - Crea elementos de carpeta con `createFolderElement()`

#### `createFolderElement(folder)` - **66 líneas** (172-237)

- **Tipo**: `function`
- **Parámetros**: `folder` - objeto con datos de carpeta
- **Descripción**: Crea el elemento DOM completo de una carpeta
- **Funcionalidad**:
  - Aplica color personalizado al header (background + border)
  - Renderiza título, ícono de colapso, y acciones
  - Itera mensajes y crea sus elementos
  - Agrega botón "Nuevo Mensaje"
  - Conecta event listeners (editar, eliminar)

#### `createMessageElement(message, folderId)` - **50 líneas** (239-288)

- **Tipo**: `function`
- **Parámetros**:
  - `message` - objeto con datos del mensaje
  - `folderId` - ID de la carpeta padre
- **Descripción**: Crea el elemento DOM de un mensaje individual
- **Funcionalidad**:
  - Genera preview del texto (primeras 50 caracteres)
  - Detecta mensajes multilínea (agrega indicador `↵`)
  - Crea botones de acción (usar, editar, eliminar)
  - Conecta event listeners para cada acción

---

### 📁 GESTIÓN DE CARPETAS (4 funciones)

#### `toggleFolder(folderId)` - **8 líneas** (292-299)

- **Tipo**: `function`
- **Parámetros**: `folderId` - ID de carpeta
- **Descripción**: Alterna estado colapsado/expandido de una carpeta
- **Funcionalidad**:
  - Invierte valor de `folder.collapsed`
  - Guarda y re-renderiza

#### `addFolder()` - **18 líneas** (301-318)

- **Tipo**: `function`
- **Descripción**: Crea una nueva carpeta
- **Funcionalidad**:
  - Muestra modal con nombre y selector de color
  - Crea objeto carpeta con ID único
  - Agrega a `appData.folders`
  - Guarda y re-renderiza

#### `editFolder(folderId)` - **17 líneas** (320-336)

- **Tipo**: `function`
- **Parámetros**: `folderId` - ID de carpeta
- **Descripción**: Edita nombre y color de carpeta existente
- **Funcionalidad**:
  - Busca carpeta por ID
  - Muestra modal pre-llenado
  - Actualiza propiedades
  - Guarda y re-renderiza

#### `deleteFolder(folderId)` - **13 líneas** (338-350)

- **Tipo**: `function`
- **Parámetros**: `folderId` - ID de carpeta
- **Descripción**: Elimina una carpeta y todos sus mensajes
- **Funcionalidad**:
  - Muestra confirmación al usuario
  - Filtra carpeta del array
  - Guarda y re-renderiza

---

### 💬 GESTIÓN DE MENSAJES (3 funciones)

#### `addMessage(folderId)` - **19 líneas** (354-372)

- **Tipo**: `async function`
- **Parámetros**: `folderId` - ID de carpeta padre
- **Descripción**: Agrega un nuevo mensaje a una carpeta
- **Funcionalidad**:
  - Busca carpeta por ID
  - Muestra modal de mensaje
  - Crea objeto mensaje con ID único
  - Agrega a array de mensajes
  - Guarda y re-renderiza

#### `editMessage(folderId, messageId)` - **20 líneas** (374-393)

- **Tipo**: `async function`
- **Parámetros**:
  - `folderId` - ID de carpeta
  - `messageId` - ID del mensaje
- **Descripción**: Edita un mensaje existente
- **Funcionalidad**:
  - Busca carpeta y mensaje por IDs
  - Muestra modal pre-llenado
  - Actualiza propiedades del mensaje
  - Guarda y re-renderiza

#### `deleteMessage(folderId, messageId)` - **12 líneas** (395-406)

- **Tipo**: `function`
- **Parámetros**:
  - `folderId` - ID de carpeta
  - `messageId` - ID del mensaje
- **Descripción**: Elimina un mensaje
- **Funcionalidad**:
  - Muestra confirmación
  - Filtra mensaje del array
  - Guarda y re-renderiza

---

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
