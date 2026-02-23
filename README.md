# 📝 WhatsApp Web - Mensajes Rápidos

Extensión de Chrome para guardar y usar mensajes predeterminados en WhatsApp Web con escritura simulada carácter por carácter.

## ✨ Características

- **Barra lateral integrada** en WhatsApp Web sin romper el layout
- **Organización por carpetas** para categorizar tus mensajes
- **Escritura simulada** carácter por carácter (efecto humano)
- **No envía automáticamente** - el mensaje solo se escribe en el campo de texto
- **Almacenamiento persistente** usando chrome.storage.local
- **Interfaz intuitiva** con botones para agregar, editar y eliminar

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
3. La carpeta aparecerá en la lista

### Agregar mensajes

1. Dentro de una carpeta, haz clic en **"➕ Nuevo Mensaje"**
2. Ingresa un **nombre** para identificar el mensaje (ej: "Saludo formal")
3. Ingresa el **texto completo** del mensaje
4. El mensaje se guardará automáticamente

### Usar un mensaje

1. **Abre una conversación** en WhatsApp Web
2. En la barra lateral, haz clic en el **botón ✅** del mensaje que quieras usar
3. El mensaje se escribirá **carácter por carácter** en el campo de texto
4. **Revisa el mensaje** y presiona Enter manualmente para enviarlo

### Editar o eliminar

- **Editar carpeta**: Haz clic en ✏️ junto al nombre de la carpeta
- **Eliminar carpeta**: Haz clic en 🗑️ (eliminará también todos sus mensajes)
- **Editar mensaje**: Haz clic en ✏️ en el mensaje
- **Eliminar mensaje**: Haz clic en 🗑️ en el mensaje

### Colapsar/Expandir

- **Carpetas**: Haz clic en el nombre de la carpeta para colapsar/expandir
- **Barra lateral**: Haz clic en el botón **−** en la esquina superior derecha para minimizar

## 🛠️ Estructura del Proyecto

```
extension-custom-chrome/
│
├── manifest.json       # Configuración de la extensión (Manifest V3)
├── content.js          # Script principal - inyecta sidebar y maneja lógica
├── styles.css          # Estilos de la barra lateral
├── icon16.png          # Ícono 16x16
├── icon48.png          # Ícono 48x48
├── icon128.png         # Ícono 128x128
└── README.md           # Este archivo
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

## ⚡ Próximas Mejoras

- [ ] Drag & drop para reordenar carpetas y mensajes
- [ ] Exportar/importar configuración
- [ ] Búsqueda de mensajes
- [ ] Variables dinámicas (nombre, fecha, etc.)
- [ ] Atajos de teclado
- [ ] Tema oscuro

---

**Versión:** 1.0.0  
**Desarrollado con ❤️ para facilitar la comunicación en WhatsApp Web**
