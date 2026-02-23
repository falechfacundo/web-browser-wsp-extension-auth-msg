// WhatsApp Web - Mensajes Rápidos
// ui-modals.js - Modales para crear/editar mensajes y carpetas

// ==================== MODAL PERSONALIZADO ====================

function showMessageModal({ title, nameValue, textValue }) {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "waqm-modal-overlay";

    // Crear modal
    const modal = document.createElement("div");
    modal.className = "waqm-modal";

    modal.innerHTML = `
      <div class="waqm-modal-header">
        <h3 class="waqm-modal-title">${escapeHtml(title)}</h3>
      </div>
      <div class="waqm-modal-body">
        <div class="waqm-modal-field">
          <label class="waqm-modal-label">Nombre del mensaje</label>
          <input type="text" class="waqm-modal-input" id="waqm-modal-name" value="${escapeHtml(nameValue)}" placeholder='Ej: "Saludo formal"' />
        </div>
        <div class="waqm-modal-field">
          <label class="waqm-modal-label">Texto del mensaje</label>
          <textarea class="waqm-modal-textarea" id="waqm-modal-text" placeholder="Escribe tu mensaje aquí...\nPuedes usar múltiples líneas">${escapeHtml(textValue)}</textarea>
        </div>
      </div>
      <div class="waqm-modal-footer">
        <button class="waqm-modal-btn waqm-modal-btn-secondary" id="waqm-modal-cancel">Cancelar</button>
        <button class="waqm-modal-btn waqm-modal-btn-primary" id="waqm-modal-save">Guardar</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Referencias a elementos
    const nameInput = modal.querySelector("#waqm-modal-name");
    const textInput = modal.querySelector("#waqm-modal-text");
    const cancelBtn = modal.querySelector("#waqm-modal-cancel");
    const saveBtn = modal.querySelector("#waqm-modal-save");

    // Focus en el campo de nombre
    setTimeout(() => nameInput.focus(), 100);

    // Función para cerrar modal
    const closeModal = () => {
      overlay.remove();
    };

    // Event listeners
    cancelBtn.addEventListener("click", () => {
      closeModal();
      resolve(null);
    });

    saveBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = "#ff0000";
        setTimeout(() => {
          nameInput.style.borderColor = "";
        }, 2000);
        return;
      }

      if (!text) {
        textInput.focus();
        textInput.style.borderColor = "#ff0000";
        setTimeout(() => {
          textInput.style.borderColor = "";
        }, 2000);
        return;
      }

      closeModal();
      resolve({ name, text });
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(null);
      }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        resolve(null);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Guardar con Ctrl+Enter
    const handleCtrlEnter = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        saveBtn.click();
        document.removeEventListener("keydown", handleCtrlEnter);
      }
    };
    document.addEventListener("keydown", handleCtrlEnter);
  });
}

// Modal para añadir/editar carpetas con selector de color
function showFolderModal({ title, nameValue, colorValue }) {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement("div");
    overlay.className = "waqm-modal-overlay";

    // Crear modal
    const modal = document.createElement("div");
    modal.className = "waqm-modal";

    // Generar opciones de color
    const colorOptions = window.FOLDER_COLORS.map(
      (color) => `
      <div class="waqm-color-option ${color.value === colorValue ? "waqm-color-selected" : ""}" 
           data-color="${color.value}" 
           style="background: ${color.light}; border-left: 4px solid ${color.value};">
        <div class="waqm-color-dot" style="background: ${color.value};"></div>
        <span>${color.name}</span>
      </div>
    `,
    ).join("");

    modal.innerHTML = `
      <div class="waqm-modal-header">
        <h3 class="waqm-modal-title">${escapeHtml(title)}</h3>
      </div>
      <div class="waqm-modal-body">
        <div class="waqm-modal-field">
          <label class="waqm-modal-label">Nombre de la carpeta</label>
          <input type="text" class="waqm-modal-input" id="waqm-folder-modal-name" value="${escapeHtml(nameValue)}" placeholder='Ej: "Trabajo"' />
        </div>
        <div class="waqm-modal-field">
          <label class="waqm-modal-label">Color</label>
          <div class="waqm-color-picker" id="waqm-color-picker">
            ${colorOptions}
          </div>
        </div>
      </div>
      <div class="waqm-modal-footer">
        <button class="waqm-modal-btn waqm-modal-btn-secondary" id="waqm-folder-modal-cancel">Cancelar</button>
        <button class="waqm-modal-btn waqm-modal-btn-primary" id="waqm-folder-modal-save">Guardar</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Referencias a elementos
    const nameInput = modal.querySelector("#waqm-folder-modal-name");
    const cancelBtn = modal.querySelector("#waqm-folder-modal-cancel");
    const saveBtn = modal.querySelector("#waqm-folder-modal-save");
    const colorPicker = modal.querySelector("#waqm-color-picker");
    let selectedColor = colorValue;

    // Event listeners para opciones de color
    colorPicker.querySelectorAll(".waqm-color-option").forEach((option) => {
      option.addEventListener("click", () => {
        // Remover selección previa
        colorPicker.querySelectorAll(".waqm-color-option").forEach((opt) => {
          opt.classList.remove("waqm-color-selected");
        });
        // Marcar como seleccionado
        option.classList.add("waqm-color-selected");
        selectedColor = option.dataset.color;
      });
    });

    // Focus en el campo de nombre
    setTimeout(() => nameInput.focus(), 100);

    // Función para cerrar modal
    const closeModal = () => {
      overlay.remove();
    };

    // Event listeners
    cancelBtn.addEventListener("click", () => {
      closeModal();
      resolve(null);
    });

    saveBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();

      if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = "#ff0000";
        setTimeout(() => {
          nameInput.style.borderColor = "";
        }, 2000);
        return;
      }

      closeModal();
      resolve({ name, color: selectedColor });
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(null);
      }
    });

    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        resolve(null);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  });
}

// ==================== UTILIDADES ====================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Exportar funciones
window.showMessageModal = showMessageModal;
window.showFolderModal = showFolderModal;
window.escapeHtml = escapeHtml;
