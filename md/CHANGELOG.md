# 📝 Changelog - WhatsApp Mensajes Rápidos

## [2.0.0] - 2026-02-26

### 🚀 Nuevas Funcionalidades Mayores

#### Secuencias de Mensajes
- **Modal unificado** con toggle para crear mensajes simples o secuencias
- Múltiples mensajes enviados automáticamente uno tras otro
- Delays gaussianos naturales entre mensajes (6x el delay entre caracteres)
- Editor visual con agregar/eliminar/reordenar sub-mensajes
- Preview numerado en sidebar (1., 2., 3., ...)
- Animación visual durante toda la ejecución de la secuencia
- Los sub-mensajes NO requieren nombre individual, solo la secuencia completa

#### Exportar/Importar
- **Botón de exportar** (📤) en header - descarga JSON con todas las categorías y mensajes
- **Botón de importar** (📥) en header - carga JSON previamente exportado
- Validación y normalización de estructura de datos
- Migración automática de datos legacy (elimina campos obsoletos)
- Formato JSON legible y editable manualmente
- Preserva secuencias y mensajes multilinea

#### Búsqueda Inteligente
- Barra de búsqueda en la parte superior del sidebar
- Búsqueda en tiempo real (sin necesidad de presionar Enter)
- **Insensible a acentos y mayúsculas** ("Nino" encuentra "Niño")
- Busca en nombres de carpetas, nombres de mensajes y contenido de textos
- **Busca dentro de secuencias** (en todos los sub-mensajes)
- Filtra automáticamente carpetas y mensajes que coincidan

#### Sistema de Cancelación
- **Botón rojo de cancelar** aparece en esquina inferior derecha durante escritura
- Cancela inmediatamente la escritura en progreso
- Funciona tanto para mensajes simples como secuencias
- Limpia el campo de texto de WhatsApp al cancelar
- Remueve animaciones visuales
- Chequeo en múltiples puntos (cada carácter y entre mensajes)

### ✨ Mejoras de Interfaz

#### Iconos Mejorados
- Cambio de iconos de exportar/importar: ⬇️⬆️ → 📤📥 (más descriptivos)
- Unificación de botón de ejecutar: ▶️ → ✅ (mismo para mensajes y secuencias)

#### Layout de Secuencias Reorganizado
- Mensajes de secuencia ahora usan el mismo layout que mensajes normales
- Título arriba, sub-mensajes debajo (no al lado con línea divisoria)
- Mayor consistencia visual en el sidebar

#### Animaciones Visuales
- Emoji ✍️ animado durante escritura
- Clase `waqm-message-writing` para mensajes y secuencias
- Animación de pulso en el borde
- Fondo verde claro durante escritura
- Bounce animation en el emoji

### 🐛 Correcciones de Bugs

#### Búsqueda Reparada
- **Corregido:** Búsqueda se rompía al escribir un solo carácter
- **Causa:** Función `normalize()` no manejaba valores `undefined`
- **Solución:** Chequeo de valores nulos y búsqueda en secuencias correctamente implementada

#### Declaraciones Múltiples de Variables
- **Corregido:** `const cancelBtn` declarado múltiples veces en typing.js
- **Solución:** Una sola declaración al inicio de la función, referencias sin `const`

#### Text Color del Toggle
- **Corregido:** Texto del toggle "Secuencia de mensajes" era blanco sobre blanco (invisible)
- **Solución:** Cambio de color a `#111b21` (negro) en styles.css

#### Data Schema de Secuencias
- **Corregido:** Sub-mensajes tenían campo 'name' innecesario
- **Solución:** Eliminar campo 'name' de sub-mensajes, solo `{id, text}`
- **Migración:** Datos legacy se normalizan automáticamente en `loadData()` e `importFoldersAndMessages()`

### 🔧 Cambios Técnicos

#### Estructura de Datos
```javascript
// Mensaje normal
{
  id: "id-xxx",
  name: "Saludo",
  text: "Hola!"
}

// Secuencia (ACTUALIZADA)
{
  id: "id-yyy",
  type: "sequence",
  name: "Bienvenida", // Solo la secuencia tiene nombre
  sequence: [
    { id: "id-001", text: "Hola!" },      // Sin campo 'name'
    { id: "id-002", text: "Bienvenido" }  // Sin campo 'name'
  ]
}
```

#### Funciones Nuevas/Actualizadas

**typing.js:**
- `useMessageSequence(sequence, sequenceId)` - Nueva
- `useMessage(text, messageId)` - Actualizada con cancelación
- Variables globales: `window.cancelTyping`, `window.isTyping`

**ui-folders.js:**
- `renderFolders(searchTerm)` - Actualizada con búsqueda
- `createSequenceElement(sequence, folderId)` - Nueva
- `addMessageOrSequence(folderId)` - Nueva (modal unificado)
- `editSequence(folderId, sequenceId)` - Nueva
- `deleteSequence(folderId, sequenceId)` - Nueva
- `normalize(str)` - Nueva (para búsqueda sin acentos)

**ui-modals.js:**
- `showMessageModal()` - Completamente rediseñada con toggle

**ui-sidebar.js:**
- Botón de cancelar añadido con listeners
- Botones exportar/importar añadidos
- Barra de búsqueda con listener `input`

**init.js:**
- `exportFoldersAndMessages()` - Nueva
- `importFoldersAndMessages(data)` - Nueva

**storage.js:**
- `loadData()` - Actualizada con migración de datos legacy

#### CSS
- `.waqm-sequence` - Nuevos estilos
- `.waqm-sequence-messages` - Layout actualizado
- `.waqm-cancel-typing-btn` - Botón de cancelar con animación
- `.waqm-message-writing` - Animaciones para mensajes y secuencias
- `.waqm-modal-toggle span` - Color de texto corregido

### 📚 Documentación

#### Nuevos Archivos
- **SECUENCIAS.md** - Documentación completa de secuencias (casos de uso, flujo, delays)
- **CHANGELOG.md** - Este archivo

#### Actualizados
- **README.md** - Todas las nuevas funcionalidades documentadas
- **ARQUITECTURA.md** - Módulos y funciones actualizadas
- **FUNCIONES.md** - Mapeo completo de 35+ funciones
- **TYPING-SYSTEM.md** - Secciones de secuencias y cancelación añadidas
- **SALTOS-DE-LINEA-IMPLEMENTACION.md** - Estado actualizado a "Producción"

---

## [1.0.0] - 2026-02-20 (Versión Original Modularizada)

### Funcionalidades Base

- ✅ Barra lateral integrada en WhatsApp Web
- ✅ Organización por carpetas con colores personalizables
- ✅ Mensajes rápidos con nombre y texto
- ✅ Escritura simulada carácter por carácter
- ✅ Distribución gaussiana de delays (Box-Muller)
- ✅ Control de velocidad (Lento/Normal/Rápido)
- ✅ Toggle de envío automático
- ✅ Saltos de línea con Shift+Enter
- ✅ Almacenamiento persistente (chrome.storage.local)
- ✅ Modularización en 6 archivos JavaScript
- ✅ Colapsar/expandir carpetas
- ✅ Editar y eliminar carpetas/mensajes
- ✅ Minimizar sidebar

### Módulos Iniciales

- `init.js` - Entry point
- `storage.js` - Persistencia de datos
- `typing.js` - Simulación de tipeo humano
- `ui-modals.js` - Sistema de modales
- `ui-folders.js` - Lógica de carpetas y mensajes
- `ui-sidebar.js` - UI de la barra lateral

---

## Roadmap Futuro

### Planificado para v2.1
- [ ] Drag & drop para reordenar
- [ ] Variables dinámicas ({{nombre}}, {{fecha}})
- [ ] Atajos de teclado
- [ ] Estadísticas de uso

### Considerado para v3.0
- [ ] Tema oscuro
- [ ] Sincronización en la nube
- [ ] Plantillas de secuencias predefinidas
- [ ] Condiciones en secuencias
- [ ] API para integraciones

---

**Mantener actualizado:** Este changelog debe actualizarse con cada nueva versión o funcionalidad agregada.
