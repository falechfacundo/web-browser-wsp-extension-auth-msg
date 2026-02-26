// ==================== EXPORTAR E IMPORTAR DATOS ====================

window.exportFoldersAndMessages = function () {
  const data = {
    folders: window.appData.folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      collapsed: folder.collapsed,
      messages: folder.messages.map((msg) => {
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
        } else {
          return {
            id: msg.id,
            name: msg.name,
            text: msg.text,
          };
        }
      }),
    })),
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "waqm-categorias-mensajes.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

window.importFoldersAndMessages = function (data) {
  if (!data || !Array.isArray(data.folders)) {
    alert("El archivo no contiene datos válidos de carpetas y mensajes.");
    return;
  }

  // Validar y normalizar estructura de datos
  try {
    const normalizedFolders = data.folders.map((folder) => {
      if (!folder.id || !folder.name) {
        throw new Error("Carpeta inválida: falta id o nombre");
      }

      return {
        id: folder.id,
        name: folder.name,
        color: folder.color || window.FOLDER_COLORS[0].value,
        collapsed: folder.collapsed !== undefined ? folder.collapsed : false,
        messages: (folder.messages || []).map((msg) => {
          if (!msg.id) {
            throw new Error("Mensaje inválido: falta id");
          }

          // Mensaje de secuencia
          if (msg.type === "sequence") {
            return {
              id: msg.id,
              type: "sequence",
              name: msg.name || "Secuencia sin nombre",
              sequence: (msg.sequence || []).map((subMsg) => ({
                id: subMsg.id || window.generateId(),
                // Eliminar campo 'name' si existe (legacy data)
                text: subMsg.text || "",
              })),
            };
          }
          // Mensaje normal
          else {
            return {
              id: msg.id,
              name: msg.name || "Mensaje sin nombre",
              text: msg.text || "",
            };
          }
        }),
      };
    });

    // Confirmar con el usuario
    if (
      !confirm(
        "¿Deseas reemplazar todas las categorías y mensajes actuales por los importados?",
      )
    ) {
      return;
    }

    window.appData.folders = normalizedFolders;
    window.saveData();
    window.renderFolders();
    alert("¡Importación exitosa!");
  } catch (error) {
    alert("Error al importar datos: " + error.message);
    console.error("Error de importación:", error);
  }
};
// WhatsApp Web - Mensajes Rápidos
// init.js - Inicialización y configuración global

// ==================== CONFIGURACIÓN Y DATOS ====================

// Colores predefinidos para carpetas
window.FOLDER_COLORS = [
  { name: "Verde WhatsApp", value: "#00a884", light: "#e7f6f3" },
  { name: "Azul", value: "#0088cc", light: "#e6f3fa" },
  { name: "Púrpura", value: "#8b5cf6", light: "#f3eeff" },
  { name: "Rosa", value: "#ec4899", light: "#fce7f3" },
  { name: "Naranja", value: "#f97316", light: "#ffedd5" },
  { name: "Rojo", value: "#ef4444", light: "#fee2e2" },
  { name: "Amarillo", value: "#eab308", light: "#fef9c3" },
  { name: "Turquesa", value: "#14b8a6", light: "#ccfbf1" },
];

window.appData = {
  folders: [],
  typingSpeed: "normal", // 'slow', 'normal', 'fast'
  autoSend: false, // Envío automático de mensajes
  debugMode: false, // Modo debug: muestra logs de cada tecla
  // Estructura de datos:
  // folders: [
  //   {
  //     id: 'folder-1',
  //     name: 'Trabajo',
  //     color: '#00a884',
  //     collapsed: false,
  //     messages: [
  //       // Mensajes individuales
  //       { id: 'msg-1', name: 'Saludo', text: 'Hola, ¿cómo estás?' },
  //       // Secuencia de mensajes programados
  //       { id: 'seq-1', type: 'sequence', name: 'Secuencia bienvenida', sequence: [
  //           { id: 'msg-2', text: '¡Hola!' },
  //           { id: 'msg-3', text: 'Soy Faia, ¿cómo puedo ayudarte?' }
  //         ] }
  //     ]
  //   }
  // ];
};

// ==================== INICIALIZACIÓN ====================

async function init() {
  console.log("WhatsApp Mensajes Rápidos - Inicializando...");

  // Esperar a que WhatsApp Web cargue completamente
  await waitForWhatsAppToLoad();

  // Cargar datos guardados
  await window.loadData();

  // Crear la barra lateral
  window.createSidebar();

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
