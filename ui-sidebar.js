// WhatsApp Web - Mensajes Rápidos
// ui-sidebar.js - Barra lateral y sus controles

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
      <div class="waqm-header-btns">
        <button class="waqm-btn waqm-btn-mini waqm-export-btn" title="Exportar categorías y mensajes">📤</button>
        <button class="waqm-btn waqm-btn-mini waqm-import-btn" title="Importar categorías y mensajes">📥</button>
        <button class="waqm-btn waqm-btn-mini waqm-toggle-btn" title="Minimizar/Expandir">−</button>
        <input type="file" id="waqm-import-file" accept="application/json" style="display:none" />
      </div>
    </div>
    <div class="waqm-content">
      <div class="waqm-search-bar">
        <input type="text" id="waqm-search-input" class="waqm-search-input" placeholder="Buscar carpeta o mensaje..." autocomplete="off">
      </div>
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
      <div class="waqm-auto-send-control">
        <label class="waqm-auto-send-label">
          <input type="checkbox" id="waqm-auto-send-toggle" class="waqm-auto-send-toggle" ${window.appData.autoSend ? "checked" : ""}>
          <span class="waqm-toggle-slider"></span>
          <span class="waqm-auto-send-text">Envío automático</span>
        </label>
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

  // Create cancel typing button (hidden by default)
  const cancelTypingBtn = document.createElement("button");
  cancelTypingBtn.id = "waqm-cancel-typing-btn";
  cancelTypingBtn.className = "waqm-cancel-typing-btn";
  cancelTypingBtn.title = "Cancelar escritura";
  cancelTypingBtn.innerHTML = `
    <span class="waqm-cancel-icon">❌</span>
    <span class="waqm-cancel-text">Cancelar</span>
  `;
  cancelTypingBtn.style.display = "none";
  cancelTypingBtn.addEventListener("click", () => {
    window.cancelTyping = true;
  });
  document.body.appendChild(cancelTypingBtn);

  document.body.appendChild(sidebar);

  // Event listeners
  setupEventListeners();
  window.renderFolders();
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Botón exportar
  const exportBtn = document.querySelector(".waqm-export-btn");
  if (exportBtn) {
    exportBtn.addEventListener("click", window.exportFoldersAndMessages);
  }

  // Botón importar
  const importBtn = document.querySelector(".waqm-import-btn");
  const importFileInput = document.getElementById("waqm-import-file");
  if (importBtn && importFileInput) {
    importBtn.addEventListener("click", () => importFileInput.click());
    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target.result);
            window.importFoldersAndMessages(data);
          } catch (err) {
            alert("Archivo inválido o corrupto.");
          }
        };
        reader.readAsText(file);
      }
    });
  }
  // Buscador rápido
  const searchInput = document.getElementById("waqm-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      window.renderFolders(e.target.value);
    });
  }
  // Botón añadir carpeta
  const addFolderBtn = document.getElementById("waqm-add-folder-btn");
  if (addFolderBtn) {
    addFolderBtn.addEventListener("click", window.addFolder);
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
    speedSlider.value = speedMap[window.appData.typingSpeed] || 1;

    speedSlider.addEventListener("input", (e) => {
      const speedValues = ["slow", "normal", "fast"];
      window.appData.typingSpeed = speedValues[parseInt(e.target.value)];
      window.saveData();
    });
  }

  // Toggle de auto-envío
  const autoSendToggle = document.getElementById("waqm-auto-send-toggle");
  if (autoSendToggle) {
    autoSendToggle.addEventListener("change", (e) => {
      window.appData.autoSend = e.target.checked;
      window.saveData();
    });
  }

  // Toggle de debug
  const debugToggle = document.getElementById("waqm-debug-toggle");
  if (debugToggle) {
    debugToggle.addEventListener("change", (e) => {
      window.appData.debugMode = e.target.checked;
      window.saveData();
      if (e.target.checked) {
        console.log(
          "%c🐛 DEBUG MODE ACTIVADO",
          "background: #00a884; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;",
        );
      } else {
        console.log(
          "%c🐛 DEBUG MODE DESACTIVADO",
          "background: #ef4444; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;",
        );
      }
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

// Exportar funciones
window.createSidebar = createSidebar;
window.toggleSidebar = toggleSidebar;
window.expandSidebar = expandSidebar;
window.setupEventListeners = setupEventListeners;
