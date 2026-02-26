// WhatsApp Web - Mensajes Rápidos
// ui-modals.js - Modales para crear/editar mensajes y carpetas

// ==================== MODAL UNIFICADO MENSAJE/SECUENCIA ====================
window.showMessageModal = function ({
  title,
  nameValue = "",
  textValue = "",
  sequenceValue = [],
  isSequence = false,
}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "waqm-modal-overlay";
    const modal = document.createElement("div");
    modal.className = "waqm-modal";
    modal.innerHTML = `
      <div class="waqm-modal-header">
        <h3 class="waqm-modal-title">${escapeHtml(title)}</h3>
        <label class="waqm-modal-toggle">
          <input type="checkbox" id="waqm-modal-sequence-toggle" ${isSequence ? "checked" : ""} />
          <span>Secuencia de mensajes</span>
        </label>
      </div>
      <div class="waqm-modal-body">
        <div class="waqm-modal-field waqm-modal-single" style="display:${isSequence ? "none" : "block"}">
          <label class="waqm-modal-label">Nombre del mensaje</label>
          <input type="text" class="waqm-modal-input" id="waqm-modal-name" value="${escapeHtml(nameValue)}" placeholder='Ej: "Saludo formal"' />
          <label class="waqm-modal-label">Texto del mensaje</label>
          <textarea class="waqm-modal-textarea" id="waqm-modal-text" placeholder="Escribe tu mensaje aquí...\nPuedes usar múltiples líneas">${escapeHtml(textValue)}</textarea>
        </div>
        <div class="waqm-modal-field waqm-modal-sequence" style="display:${isSequence ? "block" : "none"}">
          <label class="waqm-modal-label">Nombre de la secuencia</label>
          <input type="text" class="waqm-modal-input" id="waqm-modal-sequence-name" value="${escapeHtml(nameValue)}" placeholder='Ej: "Secuencia bienvenida"' />
          <div class="waqm-sequence-edit-list"></div>
        </div>
      </div>
      <div class="waqm-modal-footer">
        <button class="waqm-modal-btn waqm-modal-btn-secondary" id="waqm-sequence-add" style="margin-right: auto;">Agregar mensaje</button>
        <button class="waqm-modal-btn waqm-modal-btn-secondary" id="waqm-modal-cancel">Cancelar</button>
        <button class="waqm-modal-btn waqm-modal-btn-primary" id="waqm-modal-save">Guardar</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Referencias
    const sequenceToggle = modal.querySelector("#waqm-modal-sequence-toggle");
    const singleField = modal.querySelector(".waqm-modal-single");
    const sequenceField = modal.querySelector(".waqm-modal-sequence");
    const nameInput = modal.querySelector("#waqm-modal-name");
    const textInput = modal.querySelector("#waqm-modal-text");
    const seqNameInput = modal.querySelector("#waqm-modal-sequence-name");
    const seqListDiv = modal.querySelector(".waqm-sequence-edit-list");
    const seqAddBtn = modal.querySelector("#waqm-sequence-add");
    const cancelBtn = modal.querySelector("#waqm-modal-cancel");
    const saveBtn = modal.querySelector("#waqm-modal-save");

    let steps = sequenceValue.map((msg) => ({ ...msg }));

    // Toggle UI
    sequenceToggle.onchange = () => {
      if (sequenceToggle.checked) {
        singleField.style.display = "none";
        sequenceField.style.display = "block";
      } else {
        singleField.style.display = "block";
        sequenceField.style.display = "none";
      }
    };

    // Render lista de pasos
    function renderList() {
      seqListDiv.innerHTML = "";
      steps.forEach((msg, idx) => {
        const row = document.createElement("div");
        row.className = "waqm-sequence-edit-row";
        row.innerHTML = `
          <textarea class="waqm-sequence-edit-text" placeholder="Escribe el mensaje ${idx + 1}...">${window.escapeHtml(msg.text || "")}</textarea>
          <button class="waqm-sequence-edit-up">⬆️</button>
          <button class="waqm-sequence-edit-down">⬇️</button>
          <button class="waqm-sequence-edit-delete">🗑️</button>
        `;
        row.querySelector(".waqm-sequence-edit-up").onclick = () => {
          if (idx > 0) {
            [steps[idx - 1], steps[idx]] = [steps[idx], steps[idx - 1]];
            renderList();
          }
        };
        row.querySelector(".waqm-sequence-edit-down").onclick = () => {
          if (idx < steps.length - 1) {
            [steps[idx], steps[idx + 1]] = [steps[idx + 1], steps[idx]];
            renderList();
          }
        };
        row.querySelector(".waqm-sequence-edit-delete").onclick = () => {
          steps.splice(idx, 1);
          renderList();
        };
        row.querySelector(".waqm-sequence-edit-text").oninput = (e) => {
          steps[idx].text = e.target.value;
        };
        seqListDiv.appendChild(row);
      });
    }
    renderList();
    seqAddBtn.onclick = () => {
      steps.push({ id: window.generateId(), text: "" });
      renderList();
    };

    // Guardar
    saveBtn.onclick = () => {
      overlay.remove();
      if (sequenceToggle.checked) {
        resolve({
          isSequence: true,
          name: seqNameInput.value.trim(),
          sequence: steps,
        });
      } else {
        resolve({
          isSequence: false,
          name: nameInput.value.trim(),
          text: textInput.value.trim(),
        });
      }
    };
    // Cancelar
    cancelBtn.onclick = () => {
      overlay.remove();
      resolve(null);
    };
    // Cerrar con ESC
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        overlay.remove();
        resolve(null);
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  });
};

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
