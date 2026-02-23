// WhatsApp Web - Extensión de Mensajes Rápidos
// content.js - Script inyectado en web.whatsapp.com

// ==================== CONFIGURACIÓN Y DATOS ====================

let appData = {
  folders: [],
  typingSpeed: "normal", // 'slow', 'normal', 'fast'
  // Estructura de datos:
  // folders: [
  //   {
  //     id: 'folder-1',
  //     name: 'Trabajo',
  //     collapsed: false,
  //     messages: [
  //       { id: 'msg-1', name: 'Saludo', text: 'Hola, ¿cómo estás?' }
  //     ]
  //   }
  // ]
};

// ==================== FUNCIONES DE ALMACENAMIENTO ====================

// Cargar datos desde chrome.storage.local
async function loadData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["whatsappQuickMessages"], (result) => {
      if (result.whatsappQuickMessages) {
        appData = result.whatsappQuickMessages;
        // Asegurar que typingSpeed existe (para compatibilidad con versiones anteriores)
        if (!appData.typingSpeed) {
          appData.typingSpeed = "normal";
        }
      } else {
        // Datos de ejemplo para nueva instalación
        appData = {
          typingSpeed: "normal",
          folders: [
            {
              id: generateId(),
              name: "Ejemplos",
              collapsed: false,
              messages: [
                {
                  id: generateId(),
                  name: "Saludo",
                  text: "Hola, ¿cómo estás?",
                },
                {
                  id: generateId(),
                  name: "Gracias",
                  text: "Muchas gracias por tu ayuda 😊",
                },
              ],
            },
          ],
        };
      }
      resolve();
    });
  });
}

// Guardar datos en chrome.storage.local
function saveData() {
  chrome.storage.local.set({ whatsappQuickMessages: appData }, () => {
    console.log("Datos guardados exitosamente");
  });
}

// Generar ID único
function generateId() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

// ==================== CREACIÓN DE LA BARRA LATERAL ====================

function createSidebar() {
  // Verificar si ya existe
  if (document.getElementById("whatsapp-quick-messages-sidebar")) {
    return;
  }

  const sidebar = document.createElement("div");
  sidebar.id = "whatsapp-quick-messages-sidebar";
  sidebar.className = "waqm-sidebar";

  sidebar.innerHTML = `
    <div class="waqm-header">
      <h3>Mensajes Rápidos</h3>
      <button class="waqm-btn waqm-btn-mini waqm-toggle-btn" title="Minimizar/Expandir">−</button>
    </div>
    <div class="waqm-content">
      <div class="waqm-speed-control">
        <label class="waqm-speed-label">Velocidad de tipeo:</label>
        <div class="waqm-speed-slider-container">
          <input type="range" id="waqm-speed-slider" class="waqm-speed-slider" min="0" max="2" value="1" step="1">
          <div class="waqm-speed-labels">
            <span>Lento</span>
            <span>Normal</span>
            <span>Rápido</span>
          </div>
        </div>
      </div>
      <div class="waqm-folders-container" id="waqm-folders-container">
        <!-- Las carpetas se renderizan aquí -->
      </div>
      <button class="waqm-btn waqm-btn-primary waqm-add-folder-btn" id="waqm-add-folder-btn">
        Nueva Carpeta
      </button>
    </div>
  `;

  // Create expand button (hidden by default)
  const expandBtn = document.createElement("button");
  expandBtn.className = "waqm-expand-btn";
  expandBtn.title = "Expandir barra lateral";
  expandBtn.textContent = "◀";
  expandBtn.style.display = "none";
  expandBtn.addEventListener("click", expandSidebar);
  document.body.appendChild(expandBtn);

  document.body.appendChild(sidebar);

  // Event listeners
  setupEventListeners();
  renderFolders();
}

// ==================== RENDERIZADO ====================

function renderFolders() {
  const container = document.getElementById("waqm-folders-container");
  if (!container) return;

  container.innerHTML = "";

  appData.folders.forEach((folder) => {
    const folderEl = createFolderElement(folder);
    container.appendChild(folderEl);
  });
}

function createFolderElement(folder) {
  const folderDiv = document.createElement("div");
  folderDiv.className = "waqm-folder";
  folderDiv.dataset.folderId = folder.id;

  const folderHeader = document.createElement("div");
  folderHeader.className = "waqm-folder-header";

  const folderTitle = document.createElement("div");
  folderTitle.className = "waqm-folder-title";
  folderTitle.innerHTML = `
    <span class="waqm-collapse-icon">${folder.collapsed ? "▶" : "▼"}</span>
    <span class="waqm-folder-name">${escapeHtml(folder.name)}</span>
  `;
  folderTitle.addEventListener("click", () => toggleFolder(folder.id));

  const folderActions = document.createElement("div");
  folderActions.className = "waqm-folder-actions";
  folderActions.innerHTML = `
    <button class="waqm-btn-icon" title="Editar carpeta" data-action="edit-folder">✏️</button>
    <button class="waqm-btn-icon" title="Eliminar carpeta" data-action="delete-folder">🗑️</button>
  `;

  folderHeader.appendChild(folderTitle);
  folderHeader.appendChild(folderActions);

  const messagesContainer = document.createElement("div");
  messagesContainer.className = "waqm-messages-container";
  messagesContainer.style.display = folder.collapsed ? "none" : "block";

  // Renderizar mensajes
  folder.messages.forEach((message) => {
    const messageEl = createMessageElement(message, folder.id);
    messagesContainer.appendChild(messageEl);
  });

  // Botón añadir mensaje
  const addMessageBtn = document.createElement("button");
  addMessageBtn.className = "waqm-btn waqm-btn-secondary waqm-add-message-btn";
  addMessageBtn.textContent = "Nuevo Mensaje";
  addMessageBtn.addEventListener("click", () => addMessage(folder.id));
  messagesContainer.appendChild(addMessageBtn);

  folderDiv.appendChild(folderHeader);
  folderDiv.appendChild(messagesContainer);

  // Event listeners para acciones de carpeta
  folderActions
    .querySelector('[data-action="edit-folder"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      editFolder(folder.id);
    });
  folderActions
    .querySelector('[data-action="delete-folder"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      deleteFolder(folder.id);
    });

  return folderDiv;
}

function createMessageElement(message, folderId) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "waqm-message";
  messageDiv.dataset.messageId = message.id;
  messageDiv.dataset.folderId = folderId;

  messageDiv.innerHTML = `
    <div class="waqm-message-content">
      <div class="waqm-message-name">${escapeHtml(message.name)}</div>
      <div class="waqm-message-preview">${escapeHtml(message.text.substring(0, 50))}${message.text.length > 50 ? "..." : ""}</div>
    </div>
    <div class="waqm-message-actions">
      <button class="waqm-btn-icon" title="Usar mensaje" data-action="use-message">✅</button>
      <button class="waqm-btn-icon" title="Editar mensaje" data-action="edit-message">✏️</button>
      <button class="waqm-btn-icon" title="Eliminar mensaje" data-action="delete-message">🗑️</button>
    </div>
  `;

  // Event listeners
  messageDiv
    .querySelector('[data-action="use-message"]')
    .addEventListener("click", () => {
      useMessage(message.text);
    });
  messageDiv
    .querySelector('[data-action="edit-message"]')
    .addEventListener("click", () => {
      editMessage(folderId, message.id);
    });
  messageDiv
    .querySelector('[data-action="delete-message"]')
    .addEventListener("click", () => {
      deleteMessage(folderId, message.id);
    });

  return messageDiv;
}

// ==================== FUNCIONES DE CARPETAS ====================

function toggleFolder(folderId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (folder) {
    folder.collapsed = !folder.collapsed;
    saveData();
    renderFolders();
  }
}

function addFolder() {
  const name = prompt("Nombre de la nueva carpeta:");
  if (name && name.trim()) {
    const newFolder = {
      id: generateId(),
      name: name.trim(),
      collapsed: false,
      messages: [],
    };
    appData.folders.push(newFolder);
    saveData();
    renderFolders();
  }
}

function editFolder(folderId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (folder) {
    const newName = prompt("Nuevo nombre de la carpeta:", folder.name);
    if (newName && newName.trim()) {
      folder.name = newName.trim();
      saveData();
      renderFolders();
    }
  }
}

function deleteFolder(folderId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (folder) {
    if (
      confirm(`¿Eliminar la carpeta "${folder.name}" y todos sus mensajes?`)
    ) {
      appData.folders = appData.folders.filter((f) => f.id !== folderId);
      saveData();
      renderFolders();
    }
  }
}

// ==================== FUNCIONES DE MENSAJES ====================

function addMessage(folderId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const name = prompt('Nombre del mensaje (ej: "Saludo formal"):');
  if (!name || !name.trim()) return;

  const text = prompt("Texto del mensaje:");
  if (!text || !text.trim()) return;

  const newMessage = {
    id: generateId(),
    name: name.trim(),
    text: text.trim(),
  };

  folder.messages.push(newMessage);
  saveData();
  renderFolders();
}

function editMessage(folderId, messageId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const message = folder.messages.find((m) => m.id === messageId);
  if (!message) return;

  const newName = prompt("Nombre del mensaje:", message.name);
  if (!newName || !newName.trim()) return;

  const newText = prompt("Texto del mensaje:", message.text);
  if (!newText || !newText.trim()) return;

  message.name = newName.trim();
  message.text = newText.trim();
  saveData();
  renderFolders();
}

function deleteMessage(folderId, messageId) {
  const folder = appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const message = folder.messages.find((m) => m.id === messageId);
  if (message) {
    if (confirm(`¿Eliminar el mensaje "${message.name}"?`)) {
      folder.messages = folder.messages.filter((m) => m.id !== messageId);
      saveData();
      renderFolders();
    }
  }
}

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
  const speed = appData.typingSpeed || "normal";

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

// ==================== UTILIDADES ====================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Botón añadir carpeta
  const addFolderBtn = document.getElementById("waqm-add-folder-btn");
  if (addFolderBtn) {
    addFolderBtn.addEventListener("click", addFolder);
  }

  // Botón toggle (minimizar/expandir sidebar)
  const toggleBtn = document.querySelector(".waqm-toggle-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
  }

  // Slider de velocidad de tipeo
  const speedSlider = document.getElementById("waqm-speed-slider");
  if (speedSlider) {
    // Establecer valor inicial desde appData
    const speedMap = { slow: 0, normal: 1, fast: 2 };
    speedSlider.value = speedMap[appData.typingSpeed] || 1;

    speedSlider.addEventListener("input", (e) => {
      const speedValues = ["slow", "normal", "fast"];
      appData.typingSpeed = speedValues[parseInt(e.target.value)];
      saveData();
    });
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("whatsapp-quick-messages-sidebar");
  const content = sidebar.querySelector(".waqm-content");
  const toggleBtn = sidebar.querySelector(".waqm-toggle-btn");
  const expandBtn = document.querySelector(".waqm-expand-btn");

  if (sidebar.classList.contains("waqm-minimized")) {
    sidebar.classList.remove("waqm-minimized");
    content.style.display = "block";
    toggleBtn.textContent = "−";
    sidebar.style.display = "flex";
    if (expandBtn) expandBtn.style.display = "none";
  } else {
    sidebar.classList.add("waqm-minimized");
    content.style.display = "none";
    toggleBtn.textContent = "+";
    sidebar.style.display = "none";
    if (expandBtn) expandBtn.style.display = "flex";
  }
}

function expandSidebar() {
  const sidebar = document.getElementById("whatsapp-quick-messages-sidebar");
  const content = sidebar.querySelector(".waqm-content");
  const toggleBtn = sidebar.querySelector(".waqm-toggle-btn");
  const expandBtn = document.querySelector(".waqm-expand-btn");

  sidebar.classList.remove("waqm-minimized");
  sidebar.style.display = "flex";
  content.style.display = "block";
  toggleBtn.textContent = "−";
  if (expandBtn) expandBtn.style.display = "none";
}

// ==================== INICIALIZACIÓN ====================

async function init() {
  console.log("WhatsApp Mensajes Rápidos - Inicializando...");

  // Esperar a que WhatsApp Web cargue completamente
  await waitForWhatsAppToLoad();

  // Cargar datos guardados
  await loadData();

  // Crear la barra lateral
  createSidebar();

  console.log("WhatsApp Mensajes Rápidos - Listo!");
}

// Esperar a que WhatsApp Web cargue
function waitForWhatsAppToLoad() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      // Verificar que el elemento principal de WhatsApp exista
      const whatsappMain = document.querySelector("#app");
      if (whatsappMain) {
        clearInterval(checkInterval);
        // Esperar un poco más para asegurar que todo está cargado
        setTimeout(resolve, 2000);
      }
    }, 500);
  });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
