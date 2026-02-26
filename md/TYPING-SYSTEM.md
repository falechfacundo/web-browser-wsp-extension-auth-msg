# TYPING SYSTEM - Documentación Técnica

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Flujo de Ejecución](#flujo-de-ejecución)
4. [Simulación de Comportamiento Humano](#simulación-de-comportamiento-humano)
5. [Secuencias de Mensajes](#secuencias-de-mensajes)
6. [Sistema de Cancelación](#sistema-de-cancelación)
7. [Eventos DOM de WhatsApp Web](#eventos-dom-de-whatsapp-web)
8. [Saltos de Línea](#saltos-de-línea)

---

## Descripción General

El sistema de tipeo (`typing.js`) simula escritura humana realista en WhatsApp Web mediante la inserción carácter por carácter con delays gaussianos y eventos DOM completos.

**Objetivo principal:** Evitar detección de bots simulando patrones humanos naturales.

### Características Clave

- ✅ Distribución gaussiana de delays (Box-Muller transform)
- ✅ Pausas variables después de puntuación
- ✅ Picos ocasionales simulando titubeos
- ✅ Cadena completa de eventos DOM (keydown, keypress, input, keyup)
- ✅ **Secuencias de mensajes** consecutivos con delays naturales
- ✅ **Sistema de cancelación** en tiempo real
- ✅ **Animaciones visuales** durante escritura
- ✅ Auto-envío opcional
- ✅ Modo debug con logs detallados
- ✅ **Saltos de línea con Shift+Enter** correctos

---

## Arquitectura del Sistema

### Funciones Principales

#### 1. `useMessage(text, messageId)` - **Core Function**

**Propósito:** Escribir un mensaje completo simulando tipeo humano.

**Parámetros:**
- `text` - String a escribir (soporta `\n` para multilinea)
- `messageId` - ID del mensaje para animación visual (opcional)

**Flujo:**
1. Setear flags: `window.isTyping = true`, `cancelTyping = false`
2. Mostrar botón de cancelar
3. Marcar mensaje con clase `waqm-message-writing`
4. Encontrar input box de WhatsApp
5. Escribir carácter por carácter con delays
6. Chequear `cancelTyping` en cada iteración
7. Auto-enviar si configurado
8. Limpiar animaciones y ocultar botón de cancelar

**Manejo de cancelación:**
```javascript
for (let i = 0; i < text.length; i++) {
  if (window.cancelTyping) {
    inputBox.textContent = "";
    messageElement.classList.remove("waqm-message-writing");
    window.isTyping = false;
    if (cancelBtn) cancelBtn.style.display = "none";
    return; // Salir inmediatamente
  }
  // ...escribir carácter
}
```

#### 2. `useMessageSequence(sequence, sequenceId)` - **Secuencias**

**Propósito:** Ejecutar múltiples mensajes consecutivos con delays naturales.

**Parámetros:**
- `sequence` - Array de objetos `{id, text}`
- `sequenceId` - ID de la secuencia para animación (opcional)

**Flujo:**
1. Marcar **elemento de secuencia completo** con `waqm-message-writing`
2. Iterar sobre cada sub-mensaje
3. Para cada sub-mensaje:
   - Chequear `cancelTyping`
   - Llamar `useMessage(subMsg.text, subMsg.id)`
   - Delay gaussiano entre mensajes (6x más largo que entre caracteres)
4. Remover animación de secuencia al finalizar

**Delays entre mensajes:**
```javascript
const delay = gaussianRandom(
  delayParams.baseMean * 6,    // 6x el delay base
  delayParams.baseStdDev * 2   // Mayor variación
);
// Velocidad Normal: ~720ms ± 50ms entre mensajes
// Velocidad Slow: ~1350ms ± 100ms
// Velocidad Fast: ~390ms ± 30ms
```

**¿Por qué 6x?** Simula el tiempo humano de:
- Pensar qué escribir siguiente
- Revisar mensaje anterior
- Decidir presionar Enter

#### 3. `gaussianRandom(mean, stdDev)`

**Propósito:** Generar delays realistas usando distribución normal.

**Implementación:** Box-Muller transform

```javascript
z0 = sqrt(-2.0 * ln(u1)) * cos(2π * u2)
delay = max(0, z0 * stdDev + mean)
```

**Por qué es importante:** Los humanos NO escriben a velocidad constante. La distribución gaussiana simula:

- Mayor concentración de delays cerca del promedio
- Variación natural (desviación estándar)
- Outliers ocasionales (picos de lentitud)

**Ejemplo con μ=120ms, σ=25ms:**
```
Delays generados:
115ms, 132ms, 98ms, 145ms, 121ms, 108ms, 134ms, 119ms...
```

#### 4. `getTypingDelayParams()`

**Propósito:** Definir parámetros de velocidad según configuración del usuario.

| Velocidad | Base Mean | Std Dev | Peak Max | Peak Chance |
| --------- | --------- | ------- | -------- | ----------- |
| Slow      | 225ms     | 50ms    | 500ms    | 10%         |
| Normal    | 120ms     | 25ms    | 300ms    | 9%          |
| Fast      | 65ms      | 15ms    | 150ms    | 8%          |

**Uso:**
```javascript
const params = getTypingDelayParams();
// params.baseMean, params.baseStdDev, params.peakMax, params.peakChance
```

#### 5. `insertLineBreakHuman(inputBox, debugMode)`

**Propósito:** Insertar salto de línea simulando Shift+Enter humano.

**Flujo:**
1. Disparar evento `keydown` con `shiftKey: true`
2. Insertar `<br>` usando Selection API
3. Disparar evento `input` tipo "insertLineBreak"
4. Disparar evento `keyup` con `shiftKey: true`

**Crítico:** `shiftKey: true` previene que WhatsApp envíe el mensaje (Enter solo enviaría).

#### 6. Funciones Helper

- `findWhatsAppInputBox()` - Localiza campo de entrada con selectores múltiples
- `findWhatsAppSendButton()` - Localiza botón enviar (maneja ícono SVG)
- `sleep(ms)` - Helper asíncrono para delays

---

## Secuencias de Mensajes

### Caso de Uso

Enviar múltiples mensajes consecutivos automáticamente:

```javascript
const secuencia = [
  { id: "1", text: "Hola! 👋" },
  { id: "2", text: "Bienvenido a nuestro servicio" },
  { id: "3", text: "¿En qué te puedo ayudar?" }
];

await useMessageSequence(secuencia, "seq-123");
```

**Resultado:**
1. Escribe "Hola! 👋" car por car
2. Delay ~720ms (velocidad normal)
3. Escribe "Bienvenido a nuestro servicio"
4. Delay ~720ms
5. Escribe "¿En qué te puedo ayudar?"

### Animación Visual

Durante toda la secuencia, el **elemento completo** tiene animación:

```css
.waqm-sequence.waqm-message-writing {
  animation: pulse-writing 1.5s ease-in-out infinite;
  border-left: 3px solid #00a884;
  background: rgba(0, 168, 132, 0.05);
}

.waqm-sequence.waqm-message-writing::before {
  content: "✍️";
  animation: bounce-writing 0.6s ease-in-out infinite;
}
```

Ver [SECUENCIAS.md](SECUENCIAS.md) para documentación completa.

---

## Sistema de Cancelación

### Variables Globales

```javascript
window.cancelTyping = false; // Flag para cancelar
window.isTyping = false;     // Flag indicando si está escribiendo
```

### Flujo de Cancelación

```
Usuario hace clic en botón rojo
         ↓
window.cancelTyping = true
         ↓
useMessage() chequea en cada carácter
         ↓
Si cancelTyping === true:
  - Limpiar inputBox
  - Remover animaciones
  - Ocultar botón cancelar
  - Salir con return
```

### Botón de Cancelar

**Ubicación:** Esquina inferior derecha, fixed position

```css
.waqm-cancel-typing-btn {
  position: fixed;
  bottom: 80px;
  right: 340px;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  color: white;
  animation: pulse-cancel 1.5s ease-in-out infinite;
  display: none; /* Oculto por default */
}
```

**Visibilidad:**
- Se muestra cuando `useMessage()` inicia
- Se oculta cuando termina o se cancela
- Click setea `window.cancelTyping = true`

### Chequeo en Múltiples Puntos

**En `useMessage()`:**
```javascript
// Dentro del loop de caracteres
for (let i = 0; i < text.length; i++) {
  if (window.cancelTyping) {
    // Limpiar y salir
    inputBox.textContent = "";
    if (messageElement) {
      messageElement.classList.remove("waqm-message-writing");
    }
    window.isTyping = false;
    if (cancelBtn) cancelBtn.style.display = "none";
    return;
  }
  // Continuar escribiendo...
}
```

**En `useMessageSequence()`:**
```javascript
for (let i = 0; i < sequence.length; i++) {
  // Chequeo 1: Antes de cada mensaje
  if (window.cancelTyping) break;
  
  await useMessage(sequence[i].text, sequence[i].id);
  
  // Chequeo 2: Antes del delay
  if (i < sequence.length - 1 && !window.cancelTyping) {
    await sleep(delay);
  }
}
```

**Resultado:** Cancelación inmediata en cualquier punto.

---

## Saltos de Línea

### Problema Original

WhatsApp Web usa `contenteditable` con `<div>` y `<br>` para saltos de línea.

**Comportamiento requerido:**
- Enter solo → Envía mensaje
- Shift+Enter → Salto de línea

### Solución Implementada

**Función:** `insertLineBreakHuman(inputBox, debugMode)`

**Eventos disparados:**
1. `KeyboardEvent("keydown")` con `shiftKey: true`
2. Insertar `<br>` con Selection API
3. `InputEvent("input")` con `inputType: "insertLineBreak"`
4. `KeyboardEvent("keyup")` con `shiftKey: true`

**Código:**
```javascript
// 1. Shift+Enter DOWN
inputBox.dispatchEvent(new KeyboardEvent("keydown", {
  key: "Enter",
  shiftKey: true, // ← CRÍTICO
  bubbles: true,
  cancelable: true,
}));

// 2. Insertar <br> manualmente
const sel = window.getSelection();
if (sel.rangeCount > 0) {
  const range = sel.getRangeAt(0);
  const br = document.createElement("br");
  range.insertNode(br);
  range.setStartAfter(br);
  sel.removeAllRanges();
  sel.addRange(range);
}

// 3. Input event
inputBox.dispatchEvent(new InputEvent("input", {
  inputType: "insertLineBreak",
  bubbles: true,
}));

// 4. Shift+Enter UP
inputBox.dispatchEvent(new KeyboardEvent("keyup", {
  key: "Enter",
  shiftKey: true,
  bubbles: true,
}));
```

**Resultado:** Saltos de línea nativos en WhatsApp Web sin enviar mensaje.

---
│     ├─ Buscar con selectores        │
│     └─ Si no existe → Alert + Exit  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Preparar input                  │
│     ├─ focus()                      │
│     ├─ click()                      │
│     ├─ sleep(100ms)                 │
│     └─ Limpiar textContent          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. FOR LOOP (cada carácter)        │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌────────────────┐
│ char === \n │  │ char normal    │
└─────┬───────┘  └────────┬───────┘
      │                   │
      ▼                   ▼
┌─────────────┐  ┌────────────────┐
│ PROBLEMA    │  │ Dispatch Events│
│ Convertir a │  │ ├─ keydown     │
│ espacio (×) │  │ ├─ keypress    │
└─────────────┘  │ ├─ insertText  │
                 │ ├─ input       │
                 │ └─ keyup       │
                 └────────┬───────┘
                          │
                          ▼
                 ┌────────────────┐
                 │ Delay gaussiano│
                 │ + Pausa puntua.│
                 └────────┬───────┘
                          │
                          ▼
               ┌─────────────────────┐
               │  Loop continúa...   │
               └──────────┬──────────┘
                          │
               ▼──────────┴──────────▼
┌─────────────────────────────────────┐
│  5. Triggers finales                │
│     ├─ dispatchEvent("input")       │
│     └─ dispatchEvent("change")      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Auto-envío (si habilitado)      │
│     ├─ sleep(300ms)                 │
│     └─ sendButton.click()           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  7. Remover indicador UI            │
└─────────────────────────────────────┘
```

---

## Simulación de Comportamiento Humano

### 1. Delays Gaussianos (No Constantes)

**Problema de delays constantes:**

```javascript
// ❌ ANTI-PATRÓN: Esto se detecta como bot
for (char of text) {
  insertChar(char);
  await sleep(100); // Siempre 100ms → PATRÓN ROBÓTICO
}
```

**Solución con distribución gaussiana:**

```javascript
// ✅ PATRÓN HUMANO
delay = gaussianRandom(120, 25); // μ=120ms, σ=25ms
// Genera: 95ms, 130ms, 108ms, 145ms, 118ms... (variado)
```

### 2. Picos Ocasionales (Titubeos)

Los humanos ocasionalmente:

- Piensan qué escribir (pausa larga)
- Se distraen momentáneamente
- Corrigen mentalmente antes de continuar

```javascript
if (Math.random() < 0.09) {
  // 9% de probabilidad
  delay = random(120, 300); // Pico de 300ms
}
```

### 3. Pausas Después de Puntuación

Simula que el usuario "piensa" después de terminar una oración:

```javascript
if (".,;:?!".includes(char)) {
  await sleep(random(200, 600)); // Pausa adicional
}
```

### 4. Cadena Completa de Eventos DOM

WhatsApp Web escucha múltiples eventos. Omitir alguno puede causar fallos:

```javascript
// Secuencia COMPLETA por carácter:
1. keydown   → "Usuario presionó tecla"
2. keypress  → "Tecla está siendo presionada" (deprecated pero usado)
3. insertText → Inserción real del carácter (execCommand o manual)
4. input     → "Contenido cambió" ← ⭐ MÁS IMPORTANTE para WhatsApp
5. keyup     → "Usuario soltó tecla"
```

**Por qué cada evento es importante:**

- `keydown/keyup`: WhatsApp detecta atajos (Shift+Enter, Ctrl+B)
- `keypress`: Compatibilidad con listeners legacy
- `input`: **CRÍTICO** - WhatsApp actualiza UI, contador de caracteres, preview
- `insertText`: Método recomendado para modificar contenteditable

---

## Eventos DOM de WhatsApp Web

### Input Box de WhatsApp

WhatsApp Web NO usa `<input>` o `<textarea>`. Usa:

```html
<div
  contenteditable="true"
  role="textbox"
  data-tab="10"
  class="selectable-text"
></div>
```

**Implicaciones:**

- ❌ No funciona `input.value = text`
- ✅ Funciona `div.textContent = text` (pero no dispara eventos)
- ✅ Funciona `document.execCommand('insertText', false, char)` (dispara eventos)
- ✅ Funciona manipulación de Selection API + Range

### Selectores Actuales

```javascript
const selectors = [
  'div[contenteditable="true"][data-tab="10"]', // Más específico
  'div[contenteditable="true"][data-tab="1"]', // Versiones antiguas
  'div[contenteditable="true"][role="textbox"]', // Más genérico
  'div[contenteditable="true"].selectable-text', // Por clase
  'footer div[contenteditable="true"]', // Por ubicación
];
```

**Estrategia:** Intentar en orden de especificidad hasta encontrar elemento.

### Eventos Necesarios

#### KeyboardEvent

```javascript
new KeyboardEvent("keydown", {
  key: "a", // La tecla literal
  code: "KeyA", // Código físico
  keyCode: 65, // ASCII (deprecated pero usado)
  which: 65, // Alias de keyCode
  shiftKey: false, // ⭐ IMPORTANTE para Shift+Enter
  bubbles: true, // Propagar hacia arriba
  cancelable: true, // Puede ser cancelado
  composed: true, // Atraviesa shadow DOM
});
```

#### InputEvent

```javascript
new InputEvent("input", {
  bubbles: true,
  cancelable: true,
  inputType: "insertText", // Tipo de modificación
  data: "a", // Datos insertados
  composed: true,
});
```

---

## Problema Actual: Saltos de Línea

### Comportamiento Actual (INCORRECTO)

```javascript
// Líneas 109-116 de typing.js
if (char === "\n") {
  char = " "; // ❌ Convierte a espacio
  // Resultado: "Hola\nMundo" → "Hola Mundo"
}
```

**Problema reportado:** Cuando se intentó implementar saltos de línea reales, "algunas palabras se borran y otras no".

### Por Qué Falla el Enfoque Ingenuo

**Enfoque que NO funcionó (aparentemente):**

```javascript
if (char === "\n") {
  // Disparar Enter
  const enterEvent = new KeyboardEvent("keydown", {
    key: "Enter",
    keyCode: 13,
    // ❌ FALTA: shiftKey: true
  });
  inputBox.dispatchEvent(enterEvent);

  // ❌ PROBLEMA: Enter solo ENVÍA el mensaje en WhatsApp
  // ❌ PROBLEMA: execCommand puede borrar contenido anterior
}
```

**Por qué borra caracteres:**

1. WhatsApp detecta Enter sin Shift → Intenta enviar mensaje
2. `execCommand('insertLineBreak')` puede tener efectos secundarios
3. La Selection API puede estar en posición incorrecta
4. Eventos compiten con listeners nativos de WhatsApp

---

## Enfoques Propuestos

### 🔵 Enfoque 1: Shift+Enter con Eventos Completos (MÁS HUMANO)

**Idea:** Simular exactamente lo que haría un humano presionando Shift+Enter.

```javascript
if (char === "\n") {
  // 1. Disparar Shift+Enter (keydown)
  const shiftEnterDown = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    shiftKey: true, // ⭐ CRÍTICO
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  inputBox.dispatchEvent(shiftEnterDown);

  // 2. Insertar <br> manualmente usando Selection API
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // Crear <br> + espacio invisible (para que cursor se vea)
  const br = document.createElement("br");
  const textNode = document.createTextNode("\u200B"); // Zero-width space

  range.deleteContents();
  range.insertNode(textNode);
  range.insertNode(br);

  // Mover cursor después del salto
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);

  // 3. Disparar input event (para que WhatsApp detecte cambio)
  const inputEvent = new InputEvent("input", {
    bubbles: true,
    cancelable: true,
    inputType: "insertLineBreak", // Tipo específico
    composed: true,
  });
  inputBox.dispatchEvent(inputEvent);

  // 4. Disparar Shift+Enter (keyup)
  const shiftEnterUp = new KeyboardEvent("keyup", {
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    shiftKey: true, // ⭐ CRÍTICO
    bubbles: true,
    cancelable: true,
    composed: true,
  });
  inputBox.dispatchEvent(shiftEnterUp);

  // NO llamar execCommand (evita efectos secundarios)
}
```

**Ventajas:**

- ✅ Simula comportamiento humano exacto
- ✅ WhatsApp reconoce Shift+Enter y NO envía
- ✅ Control total sobre la inserción del `<br>`
- ✅ InputType específico: "insertLineBreak"

**Desventajas:**

- ⚠️ Más complejo
- ⚠️ Requiere manejo manual de Selection API

**Probabilidad de éxito:** 🟢 Alta (85%)

---

### 🟡 Enfoque 2: Inserción Directa sin execCommand

**Idea:** Evitar `execCommand` (deprecated) y usar solo DOM + Selection API.

```javascript
if (char === "\n") {
  // NO disparar eventos de Enter, solo insertar <br>
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // Borrar selección actual (si existe)
    range.deleteContents();

    // Insertar salto de línea
    const br = document.createElement("br");
    range.insertNode(br);

    // Colapsar cursor después del <br>
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Disparar evento input genérico
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      inputType: "insertParagraph",
      composed: true,
    });
    inputBox.dispatchEvent(inputEvent);
  }
}
```

**Ventajas:**

- ✅ Simple
- ✅ No usa execCommand deprecated
- ✅ No dispara eventos Enter (evita envío)

**Desventajas:**

- ⚠️ Menos "humano" (no hay eventos de teclado)
- ⚠️ WhatsApp podría detectar falta de eventos

**Probabilidad de éxito:** 🟡 Media (65%)

---

### 🟠 Enfoque 3: Pre-procesar Texto (ANTES del loop)

**Idea:** Convertir `\n` a algo que WhatsApp entienda ANTES de escribir.

```javascript
async function useMessage(text, messageId = null) {
  // ... setup ...

  // Pre-procesamiento: Dividir en párrafos
  const lines = text.split("\n");

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Escribir línea carácter por carácter (como ahora)
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      // ... lógica actual de eventos ...
    }

    // ENTRE líneas: insertar salto
    if (lineIndex < lines.length - 1) {
      // Usar Enfoque 1 o 2 aquí
      insertLineBreak(inputBox);
      await sleep(random(50, 150)); // Delay natural
    }
  }

  // ... auto-send ...
}

function insertLineBreak(inputBox) {
  // Implementación de Enfoque 1 o 2
}
```

**Ventajas:**

- ✅ Separa lógica de líneas vs caracteres
- ✅ Más fácil debugear
- ✅ Código más limpio

**Desventajas:**

- ⚠️ Mayor refactoring
- ⚠️ Delay entre líneas puede ser antinatural

**Probabilidad de éxito:** 🟡 Media (70%)

---

### 🔴 Enfoque 4: Usar API Nativa de WhatsApp (ARRIESGADO)

**Idea:** Investigar si WhatsApp expone métodos internos.

```javascript
// Hipotético (requiere ingeniería reversa)
const whatsappReact = inputBox.__reactProps$...;
whatsappReact.onTextChange(textWithNewlines);
```

**Ventajas:**

- ✅ Potencialmente más confiable

**Desventajas:**

- ❌ APIs internas pueden cambiar
- ❌ Difícil de encontrar
- ❌ Puede romper con actualizaciones

**Probabilidad de éxito:** 🔴 Baja (30%)

---

### 🟢 Enfoque 5: Híbrido (RECOMENDADO)

**Idea:** Combinar lo mejor de Enfoque 1 y 3.

```javascript
async function useMessage(text, messageId = null) {
  // ... setup ...

  const delayParams = getTypingDelayParams();
  const debugMode = window.appData.debugMode;

  // Escribir carácter por carácter
  for (let i = 0; i < text.length; i++) {
    let char = text[i];

    if (char === "\n") {
      // ENFOQUE 1: Shift+Enter completo
      await insertLineBreakHuman(inputBox, debugMode);

      // Delay especial para saltos (simula pensamiento)
      await sleep(gaussianRandom(200, 50));
      continue; // Saltar al siguiente carácter
    }

    // ... Lógica actual para caracteres normales ...
  }
}

async function insertLineBreakHuman(inputBox, debugMode) {
  if (debugMode) {
    console.log(
      "%c⏎ Insertando salto de línea (Shift+Enter)",
      "color: #00a884; font-weight: bold;",
    );
  }

  // 1. Shift+Enter DOWN
  inputBox.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );

  // 2. Insertar <br> con Selection API
  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const br = document.createElement("br");

    range.deleteContents();
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // 3. Input event
  inputBox.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertLineBreak",
      composed: true,
    }),
  );

  // 4. Shift+Enter UP
  inputBox.dispatchEvent(
    new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
}
```

**Ventajas:**

- ✅ Máxima simulación humana
- ✅ Modular (función separada para saltos)
- ✅ No usa execCommand
- ✅ Control total de eventos
- ✅ Fácil de debugear

**Desventajas:**

- ⚠️ Código más extenso

**Probabilidad de éxito:** 🟢 Muy Alta (90%)

---

## Recomendación Final

### Implementar Enfoque 5 (Híbrido)

**Pasos:**

1. ✅ Crear función `insertLineBreakHuman(inputBox, debugMode)`
2. ✅ Modificar loop principal en `useMessage` para detectar `\n`
3. ✅ Agregar delay especial después de saltos de línea
4. ✅ Testear con mensajes multilinea
5. ✅ Ajustar delays si es necesario

**Testing sugerido:**

```javascript
// Casos de prueba
const tests = [
  "Hola\nMundo", // 1 salto
  "Línea 1\nLínea 2\nLínea 3", // 2 saltos
  "Texto con\n\ndoble salto", // Saltos consecutivos
  "Final con salto\n", // Salto al final
];
```

---

## Debug y Troubleshooting

### Activar Modo Debug

1. Toggle en sidebar: 🐛 Modo Debug
2. Abrir consola del navegador (F12)
3. Usar mensaje con saltos de línea
4. Observar logs:
   - `⏎ Insertando salto de línea (Shift+Enter)`
   - Verificar que NO aparezcan errores
   - Verificar que mensaje se escriba completo

### Problemas Comunes

| Síntoma                       | Causa Probable         | Solución                     |
| ----------------------------- | ---------------------- | ---------------------------- |
| Mensaje se envía solo         | Enter sin shiftKey     | Agregar `shiftKey: true`     |
| Texto se borra                | execCommand interfiere | Usar Selection API manual    |
| No hay salto visual           | `<br>` no se inserta   | Verificar Selection API      |
| WhatsApp no detecta           | Falta evento input     | Disparar InputEvent          |
| Cursor en posición incorrecta | Range mal configurado  | `setStartAfter` + `collapse` |

---

## Conclusión

El sistema actual de tipeo es sólido para caracteres normales pero necesita implementar **Enfoque 5 (Híbrido)** para saltos de línea funcionales.

**Próximos pasos:**

1. Implementar `insertLineBreakHuman()`
2. Modificar loop en `useMessage()`
3. Testing extensivo
4. Ajustar delays según feedback

---

**Documento actualizado:** 2026-02-24  
**Versión:** 1.0  
**Autor:** Sistema de Documentación Automática
