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
  // Estructura de datos:
  // folders: [
  //   {
  //     id: 'folder-1',
  //     name: 'Trabajo',
  //     color: '#00a884',
  //     collapsed: false,
  //     messages: [
  //       { id: 'msg-1', name: 'Saludo', text: 'Hola, ¿cómo estás?' }
  //     ]
  //   }
  // ]
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
