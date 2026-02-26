// WhatsApp Web - Mensajes Rápidos
// storage.js - Gestión de almacenamiento de datos

// ==================== FUNCIONES DE ALMACENAMIENTO ====================

// Cargar datos desde chrome.storage.local
async function loadData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["whatsappQuickMessages"], (result) => {
      if (result.whatsappQuickMessages) {
        window.appData = result.whatsappQuickMessages;
        // Asegurar que typingSpeed y autoSend existen (para compatibilidad con versiones anteriores)
        if (!window.appData.typingSpeed) {
          window.appData.typingSpeed = "normal";
        }
        if (window.appData.autoSend === undefined) {
          window.appData.autoSend = false;
        }
        if (window.appData.debugMode === undefined) {
          window.appData.debugMode = false;
        }
        // Normalizar estructura de datos
        window.appData.folders.forEach((folder) => {
          // Asegurar que cada carpeta tenga un color
          if (!folder.color) {
            folder.color = window.FOLDER_COLORS[0].value;
          }
          // Normalizar mensajes y secuencias
          if (folder.messages) {
            folder.messages.forEach((msg) => {
              // Si es secuencia, limpiar campo 'name' de sub-mensajes (legacy)
              if (msg.type === "sequence" && msg.sequence) {
                msg.sequence = msg.sequence.map((subMsg) => ({
                  id: subMsg.id,
                  text: subMsg.text || "",
                  // Eliminar 'name' si existe
                }));
              }
            });
          }
        });
      } else {
        // Datos de ejemplo para nueva instalación
        window.appData = {
          typingSpeed: "normal",
          autoSend: false,
          debugMode: false,
          folders: [
            {
              id: generateId(),
              name: "Ejemplos",
              color: window.FOLDER_COLORS[0].value,
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
  chrome.storage.local.set({ whatsappQuickMessages: window.appData }, () => {
    console.log("Datos guardados exitosamente");
  });
}

// Generar ID único
function generateId() {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

// Exportar funciones
window.loadData = loadData;
window.saveData = saveData;
window.generateId = generateId;
