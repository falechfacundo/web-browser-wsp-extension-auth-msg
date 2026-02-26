// WhatsApp Web - Mensajes Rápidos
// ui-folders.js - Gestión de carpetas y mensajes

// ==================== RENDERIZADO ====================

function renderFolders(searchTerm = "") {
  const container = document.getElementById("waqm-folders-container");
  if (!container) return;

  container.innerHTML = "";
  // Función para normalizar acentos y minúsculas
  function normalize(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  }

  const normalizedSearch = normalize(searchTerm.trim());

  window.appData.folders.forEach((folder) => {
    // Filtrar por nombre de carpeta o mensajes (insensible a acentos)
    const folderNameMatch = normalize(folder.name).includes(normalizedSearch);
    const filteredMessages = folder.messages.filter((msg) => {
      // Buscar en el nombre del mensaje o secuencia
      if (normalize(msg.name).includes(normalizedSearch)) return true;

      // Si es un mensaje normal, buscar en el texto
      if (
        msg.type !== "sequence" &&
        normalize(msg.text).includes(normalizedSearch)
      ) {
        return true;
      }

      // Si es una secuencia, buscar en los sub-mensajes
      if (msg.type === "sequence" && msg.sequence) {
        return msg.sequence.some((subMsg) =>
          normalize(subMsg.text).includes(normalizedSearch),
        );
      }

      return false;
    });
    if (
      normalizedSearch === "" ||
      folderNameMatch ||
      filteredMessages.length > 0
    ) {
      // Clonar carpeta y filtrar mensajes si hay búsqueda
      const folderClone = { ...folder };
      folderClone.messages =
        normalizedSearch === "" ? folder.messages : filteredMessages;
      const folderEl = createFolderElement(folderClone);
      container.appendChild(folderEl);
    }
  });
}

function createFolderElement(folder) {
  const folderDiv = document.createElement("div");
  folderDiv.className = "waqm-folder";
  folderDiv.dataset.folderId = folder.id;

  // Obtener el color de la carpeta
  const folderColor =
    window.FOLDER_COLORS.find((c) => c.value === folder.color) ||
    window.FOLDER_COLORS[0];

  // Aplicar color de fondo a todo el contenedor de la carpeta
  folderDiv.style.background = folderColor.light;
  folderDiv.style.borderLeft = `4px solid ${folderColor.value}`;

  const folderHeader = document.createElement("div");
  folderHeader.className = "waqm-folder-header";
  // El header ya no necesita background propio, lo hereda del contenedor
  // Pero puede tener un tono ligeramente diferente si se desea

  const folderTitle = document.createElement("div");
  folderTitle.className = "waqm-folder-title";
  folderTitle.innerHTML = `
    <span class="waqm-collapse-icon">${folder.collapsed ? "▶" : "▼"}</span>
    <span class="waqm-folder-name">${window.escapeHtml(folder.name)}</span>
  `;
  folderTitle.addEventListener("click", () => toggleFolder(folder.id));

  const folderActions = document.createElement("div");
  folderActions.className = "waqm-folder-actions";
  folderActions.innerHTML = `
    <button class="waqm-btn-icon" title="Nuevo mensaje" data-action="add-message">➕</button>
    <button class="waqm-btn-icon" title="Editar carpeta" data-action="edit-folder">✏️</button>
    <button class="waqm-btn-icon" title="Eliminar carpeta" data-action="delete-folder">🗑️</button>
  `;

  folderHeader.appendChild(folderTitle);
  folderHeader.appendChild(folderActions);

  const messagesContainer = document.createElement("div");
  messagesContainer.className = "waqm-messages-container";
  messagesContainer.style.display = folder.collapsed ? "none" : "block";

  // Renderizar mensajes y secuencias
  folder.messages.forEach((message) => {
    if (message.type === "sequence") {
      const seqEl = createSequenceElement(message, folder.id);
      messagesContainer.appendChild(seqEl);
    } else {
      const messageEl = createMessageElement(message, folder.id);
      messagesContainer.appendChild(messageEl);
    }
  });
  // Agregar mensaje o secuencia (modal unificado)
  async function addMessageOrSequence(folderId) {
    const folder = window.appData.folders.find((f) => f.id === folderId);
    if (!folder) return;
    const result = await window.showMessageModal({
      title: "Nuevo mensaje o secuencia",
    });
    if (!result) return;
    if (result.isSequence) {
      // Efecto visual: fondo especial para secuencia
      const newSeq = {
        id: window.generateId(),
        type: "sequence",
        name: result.name,
        sequence: result.sequence,
      };
      folder.messages.push(newSeq);
    } else {
      const newMessage = {
        id: window.generateId(),
        name: result.name,
        text: result.text,
      };
      folder.messages.push(newMessage);
    }
    window.saveData();
    renderFolders();
  }
  // Crear elemento DOM para una secuencia de mensajes
  function createSequenceElement(sequence, folderId) {
    const seqDiv = document.createElement("div");
    seqDiv.className = "waqm-sequence waqm-message"; // Efecto visual similar a mensaje
    seqDiv.dataset.sequenceId = sequence.id;
    seqDiv.dataset.messageId = sequence.id; // Para compatibilidad con drag and drop
    seqDiv.dataset.folderId = folderId;
    seqDiv.draggable = true;

    seqDiv.innerHTML = `
    <div class="waqm-message-content">
      <div class="waqm-message-name">${window.escapeHtml(sequence.name)}</div>
      <div class="waqm-sequence-messages">
        ${sequence.sequence
          .map(
            (msg, idx) => `
          <div class="waqm-sequence-message">
            <span class="waqm-sequence-step">${idx + 1}.</span>
            <span class="waqm-sequence-msg-preview">${window.escapeHtml((msg.text || "").substring(0, 50))}${(msg.text || "").length > 50 ? "..." : ""}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
    <div class="waqm-message-actions">
      <button class="waqm-btn-icon" title="Usar secuencia" data-action="use-sequence">✅</button>
      <button class="waqm-btn-icon" title="Editar secuencia" data-action="edit-sequence">✏️</button>
      <button class="waqm-btn-icon" title="Eliminar secuencia" data-action="delete-sequence">🗑️</button>
    </div>
  `;

    // Acciones de secuencia
    seqDiv.querySelector('[data-action="use-sequence"]').onclick = () => {
      window.useMessageSequence(sequence.sequence, sequence.id);
    };
    seqDiv.querySelector('[data-action="edit-sequence"]').onclick = () => {
      editSequence(folderId, sequence.id);
    };
    seqDiv.querySelector('[data-action="delete-sequence"]').onclick = () => {
      deleteSequence(folderId, sequence.id);
    };

    // Drag and drop events
    setupDragAndDrop(seqDiv);

    return seqDiv;
  }

  // Agregar nueva secuencia
  async function addSequence(folderId) {
    // Ya no se usa, reemplazado por addMessageOrSequence
  }

  // Editar secuencia
  async function editSequence(folderId, sequenceId) {
    const folder = window.appData.folders.find((f) => f.id === folderId);
    if (!folder) return;
    const seq = folder.messages.find(
      (m) => m.id === sequenceId && m.type === "sequence",
    );
    if (!seq) return;
    // Modal unificado para editar secuencia
    const result = await window.showMessageModal({
      title: "Editar secuencia",
      nameValue: seq.name,
      sequenceValue: seq.sequence,
      isSequence: true,
    });
    if (result && result.isSequence) {
      seq.name = result.name;
      seq.sequence = result.sequence;
      window.saveData();
      renderFolders();
    }
  }

  // Eliminar secuencia
  function deleteSequence(folderId, sequenceId) {
    const folder = window.appData.folders.find((f) => f.id === folderId);
    if (!folder) return;
    if (confirm("¿Eliminar esta secuencia de mensajes?")) {
      folder.messages = folder.messages.filter((m) => m.id !== sequenceId);
      window.saveData();
      renderFolders();
    }
  }

  folderDiv.appendChild(folderHeader);
  folderDiv.appendChild(messagesContainer);

  // Event listeners para acciones de carpeta
  folderActions
    .querySelector('[data-action="add-message"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      addMessageOrSequence(folder.id);
    });
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
  messageDiv.draggable = true;

  // Crear preview: mostrar la primera línea y agregar indicador si hay más
  const lines = message.text.split("\n");
  const firstLine = lines[0] || "";
  const hasMultipleLines = lines.length > 1;
  const previewText = firstLine.substring(0, 50);
  const previewSuffix =
    firstLine.length > 50 ? "..." : hasMultipleLines ? " ↵" : "";

  messageDiv.innerHTML = `
    <div class="waqm-message-content">
      <div class="waqm-message-name">${window.escapeHtml(message.name)}</div>
      <div class="waqm-message-preview">${window.escapeHtml(previewText)}${previewSuffix}</div>
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
      window.useMessage(message.text, message.id);
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

  // Drag and drop events
  setupDragAndDrop(messageDiv);

  return messageDiv;
}

// ==================== DRAG AND DROP ====================

let draggedElement = null;

function setupDragAndDrop(element) {
  element.addEventListener("dragstart", (e) => {
    draggedElement = element;
    element.classList.add("waqm-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", element.innerHTML);
  });

  element.addEventListener("dragend", (e) => {
    element.classList.remove("waqm-dragging");
    // Limpiar todos los drag-over
    document.querySelectorAll(".waqm-drag-over").forEach((el) => {
      el.classList.remove("waqm-drag-over");
    });
    draggedElement = null;
  });

  element.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedElement || draggedElement === element) return;

    // Solo permitir reordenar dentro de la misma carpeta
    if (draggedElement.dataset.folderId !== element.dataset.folderId) return;

    element.classList.add("waqm-drag-over");
  });

  element.addEventListener("dragleave", (e) => {
    element.classList.remove("waqm-drag-over");
  });

  element.addEventListener("drop", (e) => {
    e.preventDefault();
    element.classList.remove("waqm-drag-over");

    if (!draggedElement || draggedElement === element) return;

    // Solo permitir reordenar dentro de la misma carpeta
    if (draggedElement.dataset.folderId !== element.dataset.folderId) return;

    const folderId = element.dataset.folderId;
    const draggedMessageId = draggedElement.dataset.messageId;
    const targetMessageId = element.dataset.messageId;

    reorderMessages(folderId, draggedMessageId, targetMessageId);
  });
}

function reorderMessages(folderId, draggedMessageId, targetMessageId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const draggedIndex = folder.messages.findIndex(
    (m) => m.id === draggedMessageId,
  );
  const targetIndex = folder.messages.findIndex(
    (m) => m.id === targetMessageId,
  );

  if (draggedIndex === -1 || targetIndex === -1) return;

  // Remover el mensaje de su posición original
  const [draggedMessage] = folder.messages.splice(draggedIndex, 1);

  // Insertar en la nueva posición
  folder.messages.splice(targetIndex, 0, draggedMessage);

  window.saveData();
  renderFolders();
}

// ==================== FUNCIONES DE CARPETAS ====================

function toggleFolder(folderId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (folder) {
    folder.collapsed = !folder.collapsed;
    window.saveData();
    renderFolders();
  }
}

function addFolder() {
  window
    .showFolderModal({
      title: "Nueva Carpeta",
      nameValue: "",
      colorValue: window.FOLDER_COLORS[0].value,
    })
    .then((result) => {
      if (result) {
        const newFolder = {
          id: window.generateId(),
          name: result.name,
          color: result.color,
          collapsed: false,
          messages: [],
        };
        window.appData.folders.push(newFolder);
        window.saveData();
        renderFolders();
      }
    });
}

function editFolder(folderId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (folder) {
    window
      .showFolderModal({
        title: "Editar Carpeta",
        nameValue: folder.name,
        colorValue: folder.color,
      })
      .then((result) => {
        if (result) {
          folder.name = result.name;
          folder.color = result.color;
          window.saveData();
          renderFolders();
        }
      });
  }
}

function deleteFolder(folderId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (folder) {
    if (
      confirm(`¿Eliminar la carpeta "${folder.name}" y todos sus mensajes?`)
    ) {
      window.appData.folders = window.appData.folders.filter(
        (f) => f.id !== folderId,
      );
      window.saveData();
      renderFolders();
    }
  }
}

// ==================== FUNCIONES DE MENSAJES ====================

async function addMessage(folderId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const result = await window.showMessageModal({
    title: "Nuevo Mensaje",
    nameValue: "",
    textValue: "",
    sequenceValue: [],
    isSequence: false,
  });

  if (!result) return;

  let newMessage;
  if (result.isSequence) {
    newMessage = {
      id: window.generateId(),
      type: "sequence",
      name: result.name,
      sequence: result.sequence,
    };
  } else {
    newMessage = {
      id: window.generateId(),
      name: result.name,
      text: result.text,
    };
  }

  folder.messages.push(newMessage);
  window.saveData();
  renderFolders();
}

async function editMessage(folderId, messageId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const message = folder.messages.find((m) => m.id === messageId);
  if (!message) return;

  const isSequence = message.type === "sequence";
  const result = await window.showMessageModal({
    title: "Editar Mensaje",
    nameValue: message.name,
    textValue: message.text || "",
    sequenceValue: message.sequence || [],
    isSequence: isSequence,
  });

  if (!result) return;

  // Actualizar el mensaje preservando el ID
  if (result.isSequence) {
    message.type = "sequence";
    message.name = result.name;
    message.sequence = result.sequence;
    // Eliminar campo text si existe (conversión de mensaje simple a secuencia)
    delete message.text;
  } else {
    message.name = result.name;
    message.text = result.text;
    // Eliminar campos de secuencia si existen (conversión de secuencia a mensaje simple)
    delete message.type;
    delete message.sequence;
  }

  window.saveData();
  renderFolders();
}

function deleteMessage(folderId, messageId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const message = folder.messages.find((m) => m.id === messageId);
  if (message) {
    if (confirm(`¿Eliminar el mensaje "${message.name}"?`)) {
      folder.messages = folder.messages.filter((m) => m.id !== messageId);
      window.saveData();
      renderFolders();
    }
  }
}

// Exportar funciones
window.renderFolders = renderFolders;
window.createFolderElement = createFolderElement;
window.createMessageElement = createMessageElement;
window.createSequenceElement = createSequenceElement;
window.setupDragAndDrop = setupDragAndDrop;
window.reorderMessages = reorderMessages;
window.toggleFolder = toggleFolder;
window.addFolder = addFolder;
window.editFolder = editFolder;
window.deleteFolder = deleteFolder;
window.addMessage = addMessage;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
