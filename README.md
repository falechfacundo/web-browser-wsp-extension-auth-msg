# 📝 WhatsApp Web - Mensajes Rápidos

Extensión de Chrome para guardar y usar mensajes predeterminados en WhatsApp Web con escritura simulada carácter por carácter.

## ✨ Características

### 🎯 Core
- **Barra lateral integrada** en WhatsApp Web sin romper el layout
- **Organización por carpetas** con colores personalizables
- **Escritura simulada** carácter por carácter con distribución gaussiana (efecto humano realista)
- **Almacenamiento persistente** usando chrome.storage.local
- **Interfaz intuitiva** con botones para agregar, editar y eliminar

### 🚀 Funcionalidades Avanzadas
- **Secuencias de mensajes** - Envía múltiples mensajes consecutivos automáticamente
- **Exportar/Importar** - Respalda y comparte tus categorías y mensajes (formato JSON)
- **Búsqueda inteligente** - Encuentra carpetas y mensajes rápidamente (insensible a acentos)
- **Control de velocidad** - Ajusta la velocidad de tipeo (Lento/Normal/Rápido)
- **Envío automático** - Opción para enviar automáticamente después de escribir
- **Botón de cancelar** - Detén el tipeo en cualquier momento
- **Animaciones visuales** - Indicadores visuales durante la escritura
- **Soporte multilínea** - Los mensajes preservan saltos de línea correctamente

## 🚀 Instalación

### Chrome / Edge / Opera

1. **Descarga o clona** este repositorio en tu computadora

2. **Abre Chrome** y ve a:

   ```
   chrome://extensions/
   ```

3. **Activa el "Modo de desarrollador"** (esquina superior derecha)

4. **Haz clic en "Cargar extensión sin empaquetar"**

5. **Selecciona la carpeta** que contiene los archivos de la extensión

6. La extensión se instalará y verás el ícono en la barra de herramientas

### 🦁 Brave Browser

**⚠️ IMPORTANTE**: Brave requiere configuración adicional debido a sus protecciones de privacidad.

**[📖 Lee la guía completa para Brave aquí](BRAVE.md)**

**Resumen rápido**:
1. Instala la extensión como en Chrome (`brave://extensions/`)
2. **Desactiva Brave Shields** para WhatsApp Web (icono del león en la barra de direcciones)
3. Recarga WhatsApp Web (F5)

Si la barra lateral no aparece, **haz clic en el icono del león 🦁** en WhatsApp Web y selecciona "Shields desactivados para este sitio".

## 📖 Uso

### Primera vez

1. Abre [WhatsApp Web](https://web.whatsapp.com) y escanea el código QR

2. **La barra lateral aparecerá automáticamente** en el lado derecho de la pantalla

3. Por defecto verás una carpeta de "Ejemplos" con algunos mensajes de prueba

### Crear carpetas

1. Haz clic en **"➕ Nueva Carpeta"** (botón inferior)
2. Ingresa el nombre de la carpeta
3. Selecciona un color para organizarla visualmente
4. La carpeta aparecerá en la lista con el color elegido

### Agregar mensajes

#### Mensaje simple
1. Dentro de una carpeta, haz clic en **"➕ Nuevo Mensaje"**
2. Ingresa un **nombre** para identificar el mensaje (ej: "Saludo formal")
3. Ingresa el **texto completo** del mensaje (soporta múltiples líneas)
4. Haz clic en **Guardar**

#### Secuencia de mensajes
1. Dentro de una carpeta, haz clic en **"➕ Nuevo Mensaje"**
2. **Activa el toggle "Secuencia de mensajes"**
3. Ingresa un nombre para la secuencia (ej: "Proceso de bienvenida")
4. Haz clic en **"Agregar mensaje"** para cada sub-mensaje de la secuencia
5. Escribe el texto de cada mensaje y usa las flechas ⬆️⬇️ para reordenar
6. Los mensajes se enviarán automáticamente uno tras otro con delays naturales

### Usar un mensaje

1. **Abre una conversación** en WhatsApp Web
2. En la barra lateral, haz clic en el **botón ✅** del mensaje o secuencia que quieras usar
3. El mensaje se escribirá **carácter por carácter** en el campo de texto
4. Verás una **animación visual** (✍️) indicando que se está escribiendo
5. **Para cancelar**: Haz clic en el botón rojo de cancelar que aparece en la esquina inferior derecha
6. Si el envío automático está desactivado, revisa el mensaje y presiona Enter manualmente
7. Si está activado, el mensaje se enviará automáticamente al finalizar

### Editar o eliminar

- **Editar carpeta**: Haz clic en ✏️ junto al nombre de la carpeta
- **Eliminar carpeta**: Haz clic en 🗑️ (eliminará también todos sus mensajes)
- **Editar mensaje**: Haz clic en ✏️ en el mensaje
- **Eliminar mensaje**: Haz clic en 🗑️ en el mensaje

### Búsqueda

1. Usa el campo de búsqueda en la parte superior de la barra lateral
2. Escribe cualquier término (insensible a mayúsculas y acentos)
3. Se filtrarán automáticamente carpetas, mensajes y secuencias que coincidan
4. La búsqueda también busca dentro del texto de los mensajes y sub-mensajes de secuencias

### Exportar/Importar

#### Exportar
1. Haz clic en el botón **📤** en la barra superior
2. Se descargará un archivo JSON con todas tus categorías y mensajes
3. Úsalo para respaldo o para compartir con otros dispositivos

#### Importar
1. Haz clic en el botón **📥** en la barra superior
2. Selecciona un archivo JSON previamente exportado
3. Confirma para reemplazar tus datos actuales

### Ajustes

- **Velocidad de tipeo**: Usa el slider para ajustar entre Lento/Normal/Rápido
- **Envío automático**: Activa el toggle para enviar mensajes automáticamente después de escribirlos

### Colapsar/Expandir

- **Carpetas**: Haz clic en el nombre de la carpeta para colapsar/expandir
- **Barra lateral**: Haz clic en el botón **−** en la esquina superior derecha para minimizar

## 🛠️ Estructura del Proyecto

```
whatsapp-outreach/
│
├── manifest.json           # Configuración de la extensión (Manifest V3)
├── init.js                 # Entry point + exportar/importar
├── storage.js              # Gestión de almacenamiento (loadData, saveData, generateId)
├── typing.js               # Simulación de escritura humana + secuencias
├── ui-modals.js            # Modales (mensajes/secuencias/carpetas)
├── ui-folders.js           # Renderizado de carpetas y mensajes
├── ui-sidebar.js           # Creación de barra lateral y controles
├── styles.css              # Estilos de la barra lateral
│
├── md/                     # Documentación técnica
│   ├── ARQUITECTURA.md     # Estructura modular y flujo de datos
│   ├── FUNCIONES.md        # Mapeo completo de todas las funciones
│   ├── INSTALACION.md      # Guía de instalación paso a paso
│   ├── SECUENCIAS.md       # Documentación de secuencias de mensajes
│   └── TYPING-SYSTEM.md    # Documentación del sistema de tipeo
│
├── generate-icons.html     # Generador de iconos (opcional)
└── README.md               # Este archivo
```

### Arquitectura Modular

La extensión está dividida en 6 módulos JavaScript:

- **init.js** - Inicialización y export/import
- **storage.js** - Persistencia de datos (Chrome Storage API)
- **typing.js** - Motor de escritura con simulación humana
- **ui-modals.js** - Sistema de modales (unificado para mensajes/secuencias)
- **ui-folders.js** - Lógica de carpetas, mensajes y secuencias
- **ui-sidebar.js** - UI de la barra lateral y controles

Para más detalles técnicos, consulta [md/ARQUITECTURA.md](md/ARQUITECTURA.md)

## 🔬 Características Técnicas

### Sistema de Tipeo Anti-Bot

- **Distribución Gaussiana** (Box-Muller transform) para delays realistas
- **Pausas variables** después de puntuación
- **Picos ocasionales** simulando titubeos humanos
- **Eventos DOM completos** (keydown, keypress, input, keyup)
- **Soporte Shift+Enter** para saltos de línea nativos

### Estructura de Datos

**Mensaje normal:**
```javascript
{
  id: "id-1234567890-abc",
  name: "Saludo formal",
  text: "Buenos días, ¿cómo estás?"
}
```

**Secuencia de mensajes:**
```javascript
{
  id: "id-1234567890-xyz",
  type: "sequence",
  name: "Proceso de bienvenida",
  sequence: [
    { id: "id-1234567890-001", text: "Hola! 👋" },
    { id: "id-1234567890-002", text: "Bienvenido a nuestro servicio" },
    { id: "id-1234567890-003", text: "¿En qué te puedo ayudar?" }
  ]
}
```

### Exportar/Importar

El formato de exportación es JSON compatible:
```json
{
  "folders": [
    {
      "id": "folder-123",
      "name": "Ventas",
      "color": "#00a884",
      "collapsed": false,
      "messages": [...]
    }
  ]
}
```

## 🔧 Tecnologías

- **Manifest V3** - Última versión del sistema de extensiones de Chrome
- **Vanilla JavaScript** - Sin dependencias externas
- **Chrome Storage API** - Para persistencia de datos
- **Content Scripts** - Inyección en WhatsApp Web

## ⚙️ Funcionamiento Técnico

### Inyección del Sidebar

El script `content.js` se inyecta automáticamente en `web.whatsapp.com` y crea un `div` flotante que funciona como barra lateral sin modificar el DOM de WhatsApp.

### Almacenamiento de Datos

Los datos se guardan en `chrome.storage.local` con la siguiente estructura:

```javascript
{
  whatsappQuickMessages: {
    folders: [
      {
        id: "unique-id",
        name: "Nombre de Carpeta",
        collapsed: false,
        messages: [
          {
            id: "unique-id",
            name: "Nombre del Mensaje",
            text: "Texto completo del mensaje",
          },
        ],
      },
    ];
  }
}
```

### Escritura Simulada

La función `useMessage()` busca el campo de entrada de WhatsApp Web (un `div` con `contenteditable="true"`) y escribe carácter por carácter con delays aleatorios de 30-80ms para simular escritura humana natural.

## 🐛 Solución de Problemas

### La barra lateral no aparece

**En Chrome/Edge**:
- Verifica que estás en `web.whatsapp.com`
- Recarga la página (F5)
- Asegúrate de que la extensión está habilitada en `chrome://extensions/`

**En Brave** 🦁:
- **Desactiva Brave Shields** para WhatsApp Web (icono del león)
- Recarga la página (F5)
- Abre la consola (F12) y busca mensajes de la extensión
- **[Ver guía completa para Brave](BRAVE.md)**

### El mensaje no se escribe

- Asegúrate de tener **una conversación abierta**
- El campo de texto de WhatsApp debe estar visible
- Intenta hacer clic en el campo de texto primero

### Los mensajes no se guardan

- Verifica que la extensión tenga permisos de almacenamiento
- Abre la consola del navegador (F12) y busca errores
- **En Brave**: Verifica que las cookies y almacenamiento estén permitidos

### Ver logs de debugging

Abre la consola del navegador (F12) para ver mensajes detallados:
```
[WhatsApp Mensajes Rápidos] Inicializando en Chrome/Brave...
[WhatsApp Mensajes Rápidos] ✅ Extensión cargada exitosamente!
```

## 📝 Notas Importantes

- La extensión **NO envía mensajes automáticamente** - solo los escribe en el campo de texto
- Los datos se guardan **localmente** en tu navegador (no se sincronizan entre dispositivos)
- Compatible con la versión actual de WhatsApp Web (2026)
- Funciona en **Chrome, Brave, Edge, Opera** y otros navegadores basados en Chromium
- **Brave requiere desactivar Shields** - [Ver guía](BRAVE.md)

## 🔐 Privacidad

- Esta extensión **no recopila ni envía datos** a servidores externos
- Todos los mensajes se almacenan **solo en tu navegador**
- No requiere acceso a internet más allá de WhatsApp Web

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y comercial.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras errores o tienes ideas para mejorar la extensión, no dudes en crear un issue o pull request.

## 📚 Documentación Completa

Para más información técnica detallada, consulta la documentación en la carpeta `md/`:

- **[INSTALACION.md](md/INSTALACION.md)** - Guía paso a paso para instalar la extensión
- **[ARQUITECTURA.md](md/ARQUITECTURA.md)** - Estructura modular del código y diseño del sistema
- **[FUNCIONES.md](md/FUNCIONES.md)** - Mapeo completo de todas las funciones (35+ funciones documentadas)
- **[TYPING-SYSTEM.md](md/TYPING-SYSTEM.md)** - Sistema de tipeo anti-bot con distribución gaussiana
- **[SECUENCIAS.md](md/SECUENCIAS.md)** - Documentación completa de secuencias de mensajes

## ⚡ Características Completadas

- ✅ Exportar/importar configuración (JSON)
- ✅ Búsqueda de mensajes y carpetas (insensible a acentos)
- ✅ Secuencias de mensajes múltiples
- ✅ Control de velocidad de tipeo (Lento/Normal/Rápido)
- ✅ Envío automático opcional
- ✅ Botón de cancelar escritura
- ✅ Animaciones visuales durante tipeo
- ✅ Colores personalizables para carpetas
- ✅ Soporte multilinea (Shift+Enter)
- ✅ Sistema anti-detección de bots

## 🚀 Próximas Mejoras Potenciales

- [ ] Drag & drop para reordenar carpetas y mensajes
- [ ] Variables dinámicas en mensajes ({{nombre}}, {{fecha}}, etc.)
- [ ] Atajos de teclado personalizables
- [ ] Tema oscuro
- [ ] Estadísticas de uso de mensajes
- [ ] Plantillas predefinidas de secuencias
- [ ] Sincronización en la nube (opcional)

---

**Versión:** 2.0.0  
**Última actualización:** Febrero 2026  
**Desarrollado con ❤️ para facilitar la comunicación en WhatsApp Web**
