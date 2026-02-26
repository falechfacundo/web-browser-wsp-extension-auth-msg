# 📬 Secuencias de Mensajes - Documentación

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [Flujo de Ejecución](#flujo-de-ejecución)
4. [Diferencias con Mensajes Normales](#diferencias-con-mensajes-normales)
5. [Interfaz de Usuario](#interfaz-de-usuario)
6. [Delays Entre Mensajes](#delays-entre-mensajes)
7. [Cancelación](#cancelación)

---

## Descripción General

Las **secuencias de mensajes** permiten programar múltiples mensajes que se envían consecutivamente de forma automática. Es ideal para:

- Procesos de bienvenida estructurados
- Scripts de ventas con múltiples pasos
- Respuestas complejas que requieren varios mensajes
- Tutoriales o explicaciones paso a paso

### Características Clave

- ✅ Múltiples mensajes en una sola secuencia
- ✅ Ejecución automática uno tras otro
- ✅ Delays gaussianos naturales entre mensajes
- ✅ Animación visual durante toda la secuencia
- ✅ Cancelación en cualquier momento
- ✅ Edición: agregar, eliminar, reordenar sub-mensajes
- ✅ Preview en sidebar con lista numerada

---

## Estructura de Datos

### Mensaje Normal vs Secuencia

**Mensaje Normal:**
```javascript
{
  id: "id-1234567890-abc",
  name: "Saludo formal",
  text: "Buenos días, ¿cómo estás?"
}
```

**Secuencia:**
```javascript
{
  id: "id-1234567890-xyz",
  type: "sequence",              // ← Identificador de tipo
  name: "Proceso de bienvenida", // ← Nombre de la secuencia completa
  sequence: [                    // ← Array de sub-mensajes
    {
      id: "id-1234567890-001",
      text: "Hola! 👋"
      // ⚠️ NO tiene campo 'name'
    },
    {
      id: "id-1234567890-002",
      text: "Bienvenido a nuestro servicio"
    },
    {
      id: "id-1234567890-003",
      text: "¿En qué te puedo ayudar?"
    }
  ]
}
```

### ⚠️ Nota Importante: Campo 'name'

- **La secuencia completa** tiene un campo `name` (para identificarla en el sidebar)
- **Los sub-mensajes** NO tienen campo `name`, solo `{id, text}`
- Esta distinción es intencional para simplificar la edición
- La migración de datos legacy elimina automáticamente el campo 'name' de sub-mensajes

---

## Flujo de Ejecución

### Diagrama de Flujo

```
┌─────────────────────────────────────────┐
│  Usuario hace clic en ✅ de secuencia   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  useMessageSequence(sequence, id)       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  1. Marcar elemento de secuencia con    │
│     clase "waqm-message-writing"        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Loop: Para cada sub-mensaje...      │
└──────────────┬──────────────────────────┘
               │
               ├───► Chequear cancelTyping
               │
               ├───► useMessage(subMsg.text, subMsg.id)
               │     └─► Escribe carácter por carácter
               │
               ├───► Delay gaussiano entre mensajes
               │     (6x más largo que entre caracteres)
               │
               └───► Siguiente mensaje...
               
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Remover animación de secuencia      │
└─────────────────────────────────────────┘
```

### Código Simplificado

```javascript
async function useMessageSequence(sequence, sequenceId) {
  // 1. Marcar secuencia como "escribiendo"
  const sequenceElement = document.querySelector(`[data-sequence-id="${sequenceId}"]`);
  if (sequenceElement) {
    sequenceElement.classList.add("waqm-message-writing");
  }
  
  // 2. Iterar sobre cada sub-mensaje
  for (let i = 0; i < sequence.length; i++) {
    // Chequear cancelación
    if (window.cancelTyping) break;
    
    // Escribir mensaje
    await window.useMessage(sequence[i].text, sequence[i].id);
    
    // Delay entre mensajes (si no es el último)
    if (i < sequence.length - 1 && !window.cancelTyping) {
      const delay = gaussianRandom(delayParams.baseMean * 6, delayParams.baseStdDev * 2);
      await sleep(delay);
    }
  }
  
  // 3. Limpiar animación
  if (sequenceElement) {
    sequenceElement.classList.remove("waqm-message-writing");
  }
}
```

---

## Diferencias con Mensajes Normales

| Aspecto | Mensaje Normal | Secuencia |
|---------|---------------|-----------|
| **Estructura** | `{id, name, text}` | `{id, type: 'sequence', name, sequence: [...]}` |
| **Campo 'name'** | Sí, para identificar en sidebar | Solo en secuencia completa, NO en sub-mensajes |
| **Ejecución** | Un solo mensaje | Múltiples mensajes consecutivos |
| **Delays** | Entre caracteres | Entre caracteres + entre mensajes |
| **Animación** | Elemento individual | Elemento de secuencia completo |
| **Edición** | Nombre + texto | Nombre + lista de sub-mensajes |
| **Icono en sidebar** | ✅ | ✅ (mismo, no diferencia visual en botón) |
| **Preview** | Primeras 50 caracteres | Lista numerada de sub-mensajes |

---

## Interfaz de Usuario

### Vista en Sidebar

```
┌───────────────────────────────────────┐
│ 📁 Ventas                             │
├───────────────────────────────────────┤
│ ✅ Saludo formal                      │
│    Buenos días, ¿cómo estás?         │
│                                       │
│ ✅ Proceso de bienvenida    ← Secuencia
│    1. Hola! 👋                        │
│    2. Bienvenido a nuestro servicio   │
│    3. ¿En qué te puedo ayudar?        │
└───────────────────────────────────────┘
```

### Modal Unificado (Toggle)

El modal tiene un **toggle** en la parte superior:

```
┌─────────────────────────────────────────┐
│  Nuevo mensaje o secuencia              │
│  [ ] Secuencia de mensajes   ← Toggle   │
├─────────────────────────────────────────┤
│                                         │
│  Modo desactivado (Mensaje simple):    │
│  ┌───────────────────────────────────┐ │
│  │ Nombre del mensaje                │ │
│  ├───────────────────────────────────┤ │
│  │ Texto del mensaje (multilínea)   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ✅ Modo activado (Secuencia):         │
│  ┌───────────────────────────────────┐ │
│  │ Nombre de la secuencia            │ │
│  ├───────────────────────────────────┤ │
│  │ 1. [Texto mensaje 1...] ⬆️ ⬇️ 🗑️ │ │
│  │ 2. [Texto mensaje 2...] ⬆️ ⬇️ 🗑️ │ │
│  │ 3. [Texto mensaje 3...] ⬆️ ⬇️ 🗑️ │ │
│  └───────────────────────────────────┘ │
│  [+ Agregar mensaje]                   │
│                                         │
│          [Cancelar]  [Guardar]         │
└─────────────────────────────────────────┘
```

### Botones de Edición en Secuencias

- **⬆️** - Mover sub-mensaje arriba
- **⬇️** - Mover sub-mensaje abajo
- **🗑️** - Eliminar sub-mensaje
- **+ Agregar mensaje** - Añadir nuevo sub-mensaje al final

---

## Delays Entre Mensajes

### Tipos de Delays

1. **Entre caracteres**: Distribución gaussiana según velocidad configurada
   - Slow: 225ms ± 50ms
   - Normal: 120ms ± 25ms
   - Fast: 65ms ± 15ms

2. **Entre mensajes en secuencia**: 6x más largo
   - Se calcula: `gaussianRandom(baseMean * 6, baseStdDev * 2)`
   - **Slow**: ~1350ms ± 100ms (~1.3 segundos)
   - **Normal**: ~720ms ± 50ms (~0.7 segundos)
   - **Fast**: ~390ms ± 30ms (~0.4 segundos)

### ¿Por Qué 6x?

Un humano naturalmente hace una pausa más larga entre mensajes separados que entre caracteres:
- Tiempo para pensar qué escribir
- Revisar el mensaje anterior
- Decidir si presionar Enter

El factor 6x simula este comportamiento realista.

### Código de Delay

```javascript
if (i < sequence.length - 1 && !window.cancelTyping) {
  const delayParams = getTypingDelayParams();
  const delay = gaussianRandom(
    delayParams.baseMean * 6,    // 6x el delay base
    delayParams.baseStdDev * 2   // 2x la desviación estándar
  );
  await sleep(delay);
}
```

---

## Cancelación

### Flujo de Cancelación

1. **Usuario hace clic en botón rojo de cancelar**
2. Se setea `window.cancelTyping = true`
3. **En `useMessageSequence()`**:
   - Loop chequea `cancelTyping` antes de cada mensaje
   - Si es `true`, hace `break` del loop
4. **En `useMessage()`** (sub-mensaje actual):
   - Loop chequea `cancelTyping` en cada carácter
   - Si es `true`, limpia input y sale
5. **Resultado**: Se detiene inmediatamente

### Ejemplo de Cancelación

```
Secuencia: ["Hola!", "Bienvenido", "¿Necesitas ayuda?"]

Escritura:
  Mensaje 1: "Hola!" ✅ (completo)
  Delay: ~700ms
  Mensaje 2: "Bienv..." ❌ (usuario cancela aquí)
  
Resultado:
  - Campo de WhatsApp queda limpio
  - Secuencia se marca como NO escribiendo
  - Mensaje 3 nunca se ejecuta
```

### Código de Chequeo

**En `useMessageSequence()`:**
```javascript
for (let i = 0; i < sequence.length; i++) {
  if (window.cancelTyping) break; // ← Chequeo 1
  
  await useMessage(sequence[i].text, sequence[i].id);
  
  if (i < sequence.length - 1 && !window.cancelTyping) { // ← Chequeo 2
    // delay...
  }
}
```

**En `useMessage()`:**
```javascript
for (let i = 0; i < text.length; i++) {
  if (window.cancelTyping) { // ← Chequeo 3
    inputBox.textContent = "";
    // limpiar y salir
    return;
  }
  // escribir carácter...
}
```

---

## Casos de Uso

### 1. Proceso de Ventas

**Secuencia: "Oferta de servicio"**
1. "Hola! Vi que estabas interesado en nuestro producto 😊"
2. "Tenemos una oferta especial esta semana"
3. "¿Te gustaría conocer los detalles?"

### 2. Onboarding de Cliente

**Secuencia: "Bienvenida nuevo usuario"**
1. "¡Bienvenido a [Empresa]! 🎉"
2. "Estoy aquí para ayudarte con cualquier duda"
3. "Para empezar, cuéntame: ¿qué te interesa más de nuestro servicio?"

### 3. Seguimiento Post-Venta

**Secuencia: "Check-in cliente"**
1. "Hola! ¿Cómo va todo con tu compra?"
2. "Quería asegurarme de que estés satisfecho con el producto"
3. "Si tienes alguna pregunta, no dudes en escribirme"

### 4. Tutorial paso a paso

**Secuencia: "Instrucciones de uso"**
1. "Te voy a explicar cómo usar la plataforma paso a paso"
2. "Primero, ingresa a www.ejemplo.com e inicia sesión"
3. "Una vez dentro, ve a la sección 'Mi cuenta'"
4. "Ahí podrás configurar todas tus preferencias"

---

## Consideraciones Técnicas

### 1. Migración de Datos Legacy

Si una versión anterior tenía sub-mensajes con campo 'name', la migración los elimina automáticamente:

**Antes (legacy):**
```javascript
sequence: [
  { id: "123", name: "Paso 1", text: "Hola" } // ❌ name innecesario
]
```

**Después (normalizado):**
```javascript
sequence: [
  { id: "123", text: "Hola" } // ✅ solo id y text
]
```

**Ubicaciones de normalización:**
- `storage.js` → `loadData()` al cargar datos
- `init.js` → `importFoldersAndMessages()` al importar JSON

### 2. Identificación de Secuencias

En el array `folder.messages`, se distinguen por el campo `type`:

```javascript
// Mensaje normal
{ id: "...", name: "...", text: "..." }

// Secuencia
{ id: "...", type: "sequence", name: "...", sequence: [...] }
```

**Renderizado:**
```javascript
folder.messages.forEach((message) => {
  if (message.type === 'sequence') {
    const seqEl = createSequenceElement(message, folder.id);
    messagesContainer.appendChild(seqEl);
  } else {
    const msgEl = createMessageElement(message, folder.id);
    messagesContainer.appendChild(msgEl);
  }
});
```

### 3. Animación Visual

La clase `waqm-message-writing` se aplica al **elemento completo de la secuencia**:

```css
.waqm-sequence.waqm-message-writing {
  animation: pulse-writing 1.5s ease-in-out infinite;
  border-left: 3px solid #00a884;
  background: rgba(0, 168, 132, 0.05);
}

.waqm-sequence.waqm-message-writing::before {
  content: "✍️";
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  animation: bounce-writing 0.6s ease-in-out infinite;
}
```

### 4. Export/Import

Las secuencias se exportan e importan correctamente:

**Exportación:**
```javascript
if (msg.type === "sequence") {
  return {
    id: msg.id,
    type: "sequence",
    name: msg.name,
    sequence: msg.sequence.map((subMsg) => ({
      id: subMsg.id,
      text: subMsg.text,
    })),
  };
}
```

**Importación:**
```javascript
if (msg.type === "sequence") {
  return {
    id: msg.id,
    type: "sequence",
    name: msg.name || "Secuencia sin nombre",
    sequence: (msg.sequence || []).map((subMsg) => ({
      id: subMsg.id || window.generateId(),
      text: subMsg.text || "",
      // Eliminar campo 'name' si existe (legacy data)
    })),
  };
}
```

---

## Troubleshooting

### La secuencia no se ejecuta completa

**Posibles causas:**
1. Usuario canceló manualmente (botón rojo)
2. Error en WhatsApp Web (campo de entrada no encontrado)
3. Conexión perdida durante la secuencia

**Solución:** 
- Reabrir conversación en WhatsApp Web
- Verificar que el campo de texto esté visible
- Intentar nuevamente

### Los delays son muy largos/cortos

**Causa:** Velocidad de tipeo configurada incorrecta

**Solución:**
- Ajustar slider de velocidad (Lento/Normal/Rápido)
- Los delays entre mensajes son 6x los delays entre caracteres

### Secuencia se envía demasiado rápido

**Causa:** Envío automático activado

**Solución:**
- Desactivar toggle "Envío automático" si quieres revisar antes

### No puedo reordenar sub-mensajes

**Causa:** Modal cerrado sin guardar o error de UI

**Solución:**
- Asegurarse de guardar cambios antes de cerrar modal
- Usar botones ⬆️⬇️ para reordenar
- Los cambios solo se persisten al hacer clic en "Guardar"

---

## Próximas Mejoras Sugeridas

1. **Delays configurables**: Permitir al usuario ajustar el factor de delay entre mensajes
2. **Previsualización**: Botón para "probar" secuencia sin enviarla realmente
3. **Plantillas**: Secuencias predefinidas para casos de uso comunes
4. **Variables**: Soporte para `{nombre}`, `{empresa}` en sub-mensajes
5. **Condiciones**: Ejecutar sub-mensaje solo si se cumple condición
6. **Estadísticas**: Tracking de cuántas veces se usa cada secuencia

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0
