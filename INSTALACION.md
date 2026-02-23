# 🚀 Instalación Rápida

## Pasos para instalar la extensión

### Para Chrome / Edge / Opera

### 1. Abrir Extensions

Abre tu navegador y navega a:

- **Chrome**: `chrome://extensions/`
- **Edge**: `edge://extensions/`
- **Opera**: `opera://extensions/`
- **Brave**: `brave://extensions/`

O usa el menú: **Más herramientas → Extensiones**

### 2. Activar Modo Desarrollador

Activa el interruptor **"Modo de desarrollador"** en la esquina superior derecha

### 3. Cargar Extensión

- Haz clic en **"Cargar extensión sin empaquetar"**
- Navega a la carpeta: `extension-custom-chrome`
- Selecciona la carpeta
- Haz clic en **"Seleccionar carpeta"**

### 4. ¡Listo! 🎉

La extensión se instalará automáticamente. Ahora:

1. Abre [WhatsApp Web](https://web.whatsapp.com)
2. Escanea el código QR
3. Verás la barra lateral aparecer en el lado derecho
4. ¡Comienza a usar tus mensajes rápidos!

---

## 🦁 ¿Usas Brave Browser?

**⚠️ PASO ADICIONAL REQUERIDO**:

Brave tiene protecciones de privacidad más estrictas. Después de instalar:

1. Abre WhatsApp Web
2. **Haz clic en el icono del león 🦁** (Brave Shields) en la barra de direcciones
3. Selecciona **"Shields desactivados para este sitio"**
4. Recarga la página (F5)
5. La barra lateral debería aparecer ahora

**[📖 Lee la guía completa para Brave aquí](BRAVE.md)** si sigues teniendo problemas.

---

## 📝 Primer Uso

La extensión viene con una carpeta de ejemplo llamada **"Ejemplos"** que contiene dos mensajes de prueba. Puedes:

- **Usar un mensaje**: Abre una conversación y haz clic en ✅
- **Crear nueva carpeta**: Haz clic en "➕ Nueva Carpeta"
- **Agregar mensaje**: Dentro de una carpeta, haz clic en "➕ Nuevo Mensaje"

---

## ❓ Solución de Problemas

### La barra no aparece

**En Chrome/Edge/Opera**:
- Recarga WhatsApp Web (F5)
- Verifica que la extensión esté habilitada en las extensiones

**En Brave** 🦁:
- **¡Esto es lo más común!** Desactiva Brave Shields
- Haz clic en el icono del león en la barra de direcciones
- Selecciona "Shields desactivados para este sitio"
- Recarga WhatsApp Web (F5)

### El mensaje no se escribe

- Asegúrate de tener una conversación abierta
- El campo de texto de WhatsApp debe estar visible

### Ver logs de debugging

Presiona **F12** para abrir la consola y deberías ver:
```
[WhatsApp Mensajes Rápidos] ✅ Extensión cargada exitosamente!
```

Si ves errores o no aparecen mensajes, revisa la configuración de la extensión.

---

## 🎨 Iconos Opcionales

Si deseas agregar iconos personalizados:

1. Abre `generate-icons.html` en tu navegador
2. Haz clic en "Descargar Todos los Iconos"
3. Guarda los archivos en la carpeta de la extensión
4. Descomenta la sección de iconos en `manifest.json`:

```json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

---

**¿Necesitas ayuda?** Lee el [README.md](README.md) completo para más detalles.
