// WhatsApp Web - Mensajes Rápidos
// ui-folders.js - Gestión de carpetas y mensajes

// ==================== RENDERIZADO ====================

function renderFolders(searchTerm = "") {
  const container = document.getElementById("waqm-folders-container");
  if (!container) return;

  container.innerHTML = "";
  // Función para normalizar acentos y minúsculas
  function normalize(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  }

  const normalizedSearch = normalize(searchTerm.trim());

  window.appData.folders.forEach((folder) => {
    // Filtrar por nombre de carpeta o mensajes (insensible a acentos)
    const folderNameMatch = normalize(folder.name).includes(normalizedSearch);
    const filteredMessages = folder.messages.filter((msg) =>
      normalize(msg.name).includes(normalizedSearch) ||
      normalize(msg.text).includes(normalizedSearch)
    );
    if (normalizedSearch === "" || folderNameMatch || filteredMessages.length > 0) {
      // Clonar carpeta y filtrar mensajes si hay búsqueda
      const folderClone = { ...folder };
      folderClone.messages = normalizedSearch === "" ? folder.messages : filteredMessages;
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

  // Renderizar mensajes
  folder.messages.forEach((message) => {
    const messageEl = createMessageElement(message, folder.id);
    messagesContainer.appendChild(messageEl);
  });

  folderDiv.appendChild(folderHeader);
  folderDiv.appendChild(messagesContainer);

  // Event listeners para acciones de carpeta
  folderActions
    .querySelector('[data-action="add-message"]')
    .addEventListener("click", (e) => {
      e.stopPropagation();
      addMessage(folder.id);
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

  return messageDiv;
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
  });

  if (!result) return;

  const newMessage = {
    id: window.generateId(),
    name: result.name,
    text: result.text,
  };

  folder.messages.push(newMessage);
  window.saveData();
  renderFolders();
}

async function editMessage(folderId, messageId) {
  const folder = window.appData.folders.find((f) => f.id === folderId);
  if (!folder) return;

  const message = folder.messages.find((m) => m.id === messageId);
  if (!message) return;

  const result = await window.showMessageModal({
    title: "Editar Mensaje",
    nameValue: message.name,
    textValue: message.text,
  });

  if (!result) return;

  message.name = result.name;
  message.text = result.text;
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
window.toggleFolder = toggleFolder;
window.addFolder = addFolder;
window.editFolder = editFolder;
window.deleteFolder = deleteFolder;
window.addMessage = addMessage;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
