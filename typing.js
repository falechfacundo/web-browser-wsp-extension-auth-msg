// WhatsApp Web - Mensajes Rápidos
// typing.js - Simulación de escritura humana en WhatsApp

// ==================== ESCRITURA EN WHATSAPP ====================

// Función para generar delays con distribución gaussiana (Box-Muller transform)
// Esto simula mejor los tiempos de escritura humanos, donde la mayoría de delays
// están cerca del promedio con picos ocasionales
function gaussianRandom(mean, stdDev) {
  // Box-Muller transform para generar distribución normal
  let u1 = 0,
    u2 = 0;
  // Evitar u1 = 0 que causaría log(0)
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.max(0, z0 * stdDev + mean); // Asegurar que no sea negativo
}

// Obtener los parámetros de delay según la velocidad configurada
function getTypingDelayParams() {
  const speed = window.appData.typingSpeed || "normal";

  switch (speed) {
    case "slow":
      return {
        baseMean: 225, // Promedio de 150-300ms
        baseStdDev: 50, // Desviación estándar
        peakMax: 500, // Picos ocasionales
        peakChance: 0.1, // 10% de probabilidad de pico
      };
    case "fast":
      return {
        baseMean: 65, // Promedio de 40-90ms
        baseStdDev: 15,
        peakMax: 150,
        peakChance: 0.08,
      };
    case "normal":
    default:
      return {
        baseMean: 120, // Promedio de 80-160ms
        baseStdDev: 25,
        peakMax: 300,
        peakChance: 0.09,
      };
  }
}

// Función principal para usar un mensaje con tipeo anti-detección de bot
async function useMessage(text) {
  const inputBox = findWhatsAppInputBox();

  if (!inputBox) {
    alert(
      "No se encontró el campo de texto de WhatsApp. Asegúrate de tener una conversación abierta.",
    );
    return;
  }

  // Hacer foco en el campo de entrada
  inputBox.focus();
  inputBox.click();

  // Esperar un momento para que el foco se establezca
  await sleep(100);

  // Limpiar cualquier contenido previo
  inputBox.textContent = "";

  const delayParams = getTypingDelayParams();

  // Escribir carácter por carácter simulando escritura humana realista
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const keyCode = char.charCodeAt(0);

    // Manejar saltos de línea de forma especial
    if (char === "\n") {
      // Disparar eventos de Shift + Enter (salto de línea en WhatsApp)
      const keydownEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      inputBox.dispatchEvent(keydownEvent);

      // Insertar salto de línea
      if (document.execCommand) {
        document.execCommand("insertLineBreak", false);
      } else {
        // Fallback: insertar <br> o <div>
        const br = document.createElement("br");
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(br);
          range.setStartAfter(br);
          range.setEndAfter(br);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      const keyupEvent = new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      inputBox.dispatchEvent(keyupEvent);
    } else {
      // ======== 2a. CADENA COMPLETA DE EVENTOS DEL DOM ========
      // Disparar keydown
      const keydownEvent = new KeyboardEvent("keydown", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      inputBox.dispatchEvent(keydownEvent);

      // Disparar keypress (deprecated pero algunos sistemas lo usan)
      const keypressEvent = new KeyboardEvent("keypress", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        keyCode: keyCode,
        which: keyCode,
        charCode: keyCode,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      inputBox.dispatchEvent(keypressEvent);

      // Insertar el carácter usando execCommand (simula escritura real)
      if (document.execCommand) {
        document.execCommand("insertText", false, char);
      } else {
        // Fallback: insertar manualmente
        const currentText = inputBox.textContent || "";
        inputBox.textContent = currentText + char;

        // Mover el cursor al final
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(inputBox);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    // Disparar evento input (el más importante para WhatsApp Web)
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: char,
      composed: true,
    });
    inputBox.dispatchEvent(inputEvent);

    // Disparar keyup
    const keyupEvent = new KeyboardEvent("keyup", {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    inputBox.dispatchEvent(keyupEvent);

    // ======== 2c. DELAY CON DISTRIBUCIÓN GAUSSIANA ========
    let delay;
    // Genera picos ocasionales para simular titubeos naturales
    if (Math.random() < delayParams.peakChance) {
      delay =
        Math.random() * (delayParams.peakMax - delayParams.baseMean) +
        delayParams.baseMean;
    } else {
      delay = gaussianRandom(delayParams.baseMean, delayParams.baseStdDev);
    }

    await sleep(delay);

    // ======== 2b. PAUSAS LARGAS DESPUÉS DE PUNTUACIÓN ========
    // Simular que el usuario "piensa" después de signos de puntuación
    const punctuation = [".", ",", ";", ":", "?", "!"];
    if (punctuation.includes(char)) {
      // Pausa adicional aleatoria entre 200-600ms
      const thinkingPause = Math.random() * 400 + 200;
      await sleep(thinkingPause);
    }
  }

  // Trigger final para asegurar que WhatsApp detecta el cambio completo
  inputBox.dispatchEvent(new Event("input", { bubbles: true }));
  inputBox.dispatchEvent(new Event("change", { bubbles: true }));

  // Auto-envío si está habilitado
  if (window.appData.autoSend) {
    await sleep(300); // Pequeña pausa para asegurar que el texto está listo
    const sendButton = findWhatsAppSendButton();
    if (sendButton) {
      sendButton.click();
    }
  }
}

// Encontrar el botón de enviar de WhatsApp Web
function findWhatsAppSendButton() {
  const selectors = [
    'button[data-tab="11"]',
    'button[aria-label*="Enviar"]',
    'button[aria-label*="Send"]',
    'span[data-icon="send"]',
    'footer button[type="button"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Si encontramos un span (ícono), buscar el botón padre
      if (element.tagName === "SPAN") {
        return element.closest("button");
      }
      return element;
    }
  }

  return null;
}

// Encontrar el campo de entrada de WhatsApp Web
function findWhatsAppInputBox() {
  // WhatsApp usa un div contenteditable como input
  // Selectores actualizados para la versión actual de WhatsApp Web
  const selectors = [
    'div[contenteditable="true"][data-tab="10"]',
    'div[contenteditable="true"][data-tab="1"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"].selectable-text',
    'footer div[contenteditable="true"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

// Helper: sleep/delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exportar funciones
window.gaussianRandom = gaussianRandom;
window.getTypingDelayParams = getTypingDelayParams;
window.useMessage = useMessage;
window.findWhatsAppInputBox = findWhatsAppInputBox;
window.findWhatsAppSendButton = findWhatsAppSendButton;
window.sleep = sleep;
