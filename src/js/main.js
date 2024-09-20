// Variables globales para almacenar el último tamaño de byte usado y el texto cifrado
let lastByteSize = 2;
let lastEncryptedText = "";
let asciiTableData = {}; // Para almacenar la tabla de cifrado ASCII

// Función para generar un número aleatorio entre min y max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para cifrar el texto
function encrypt() {
  if (!validateByteSize()) {
    return;
  }
  const input = document.getElementById("textToEncrypt").value;
  const byteSize = parseInt(document.getElementById("byteSize").value);
  lastByteSize = byteSize; // Guardar el tamaño de byte usado
  const maxValue = Math.pow(2, byteSize * 8) - 1;
  let encrypted = "";
  asciiTableData = {}; // Reiniciar la tabla ASCII

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const randomFactor = getRandomInt(1, maxValue);
    const encryptedChar = (charCode * randomFactor) % (maxValue + 1);
    encrypted +=
      encryptedChar.toString(16).padStart(byteSize * 2, "0") +
      randomFactor.toString(16).padStart(byteSize * 2, "0");

    // Almacenar en la tabla ASCII
    asciiTableData[charCode] = {
      char: input[i],
      ascii: charCode,
      hex: charCode.toString(16).toUpperCase().padStart(2, "0"),
      encrypted: encryptedChar.toString(16).padStart(byteSize * 2, "0"),
      randomFactor: randomFactor.toString(16).padStart(byteSize * 2, "0"),
    };
  }
  document.getElementById("encryptedText").value = encrypted;
  lastEncryptedText = encrypted; // Guardar el texto cifrado
  document.getElementById("inputEncrypted").value = encrypted; // Actualizar el campo de entrada para descifrar
  showAsciiTable(); // Actualizar la tabla ASCII
}

// Función para descifrar el texto
function decrypt() {
  const input = document.getElementById("inputEncrypted").value;
  if (input !== lastEncryptedText) {
    // Si el texto cifrado es diferente, intentamos determinar el tamaño de byte
    const possibleByteSizes = [2, 4, 8, 16];
    for (let size of possibleByteSizes) {
      if (input.length % (size * 4) === 0) {
        lastByteSize = size;
        break;
      }
    }
    if (input.length % (lastByteSize * 4) !== 0) {
      alert(
        "No se pudo determinar el tamaño de byte del texto cifrado. Asegúrese de que sea completo y correcto."
      );
      return;
    }
  }
  const byteSize = lastByteSize;
  const maxValue = Math.pow(2, byteSize * 8) - 1;
  let decrypted = "";
  asciiTableData = {}; // Reiniciar la tabla ASCII

  for (let i = 0; i < input.length; i += byteSize * 4) {
    const encryptedChar = parseInt(input.substr(i, byteSize * 2), 16);
    const randomFactor = parseInt(
      input.substr(i + byteSize * 2, byteSize * 2),
      16
    );
    let originalChar = 0;
    for (let j = 0; j <= 255; j++) {
      if ((j * randomFactor) % (maxValue + 1) === encryptedChar) {
        originalChar = j;
        break;
      }
    }
    decrypted += String.fromCharCode(originalChar);

    // Almacenar en la tabla ASCII
    asciiTableData[originalChar] = {
      char: String.fromCharCode(originalChar),
      ascii: originalChar,
      hex: originalChar.toString(16).toUpperCase().padStart(2, "0"),
      encrypted: encryptedChar.toString(16).padStart(byteSize * 2, "0"),
      randomFactor: randomFactor.toString(16).padStart(byteSize * 2, "0"),
    };
  }
  document.getElementById("decryptedText").value = decrypted;
  showAsciiTable(); // Actualizar la tabla ASCII
}

// Función para mostrar la tabla ASCII
function showAsciiTable() {
  const table = document.getElementById("asciiTable");
  // Limpiar tabla existente
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
  // Llenar la tabla con los datos de asciiTableData
  for (let ascii in asciiTableData) {
    const data = asciiTableData[ascii];
    const row = table.insertRow(-1);
    row.insertCell(0).textContent = data.char;
    row.insertCell(1).textContent = data.ascii;
    row.insertCell(2).textContent = data.hex;
    row.insertCell(3).textContent = data.encrypted;
    row.insertCell(4).textContent = data.randomFactor;
  }
}

// Función para descargar el texto cifrado
function downloadEncrypted(format) {
  const encrypted = document.getElementById("encryptedText").value;
  const fileName = prompt(
    "Ingrese el nombre del archivo:",
    "texto_cifrado"
  );

  if (fileName) {
    if (format === "pdf") {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(encrypted, 10, 10);
      simulateDownload(() => doc.save(fileName + ".pdf"));
    } else if (format === "docx") {
      const docx = window.docx;
      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            children: [
              new docx.Paragraph({
                children: [new docx.TextRun(encrypted)],
              }),
            ],
          },
        ],
      });

      docx.Packer.toBlob(doc).then((blob) => {
        simulateDownload(() => {
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName + ".docx";
          link.click();
        });
      });
    }
  }
}

// Función para simular una descarga con barra de progreso
function simulateDownload(callback) {
  const progressBar = document.getElementById("progressBarFill");
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressBar.style.width = "0%";
        callback();
      }, 500);
    }
  }, 100);
}

// Función para descargar la Tabla de Cifrado ASCII en PDF
function downloadAsciiTable() {
  const fileName = prompt(
    "Ingrese el nombre del archivo para la Tabla de Cifrado ASCII:",
    "tabla_cifrado_ascii"
  );
  if (fileName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPos = 10;
    doc.setFontSize(16);
    doc.text("Tabla de Cifrado ASCII", 10, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Tamaño de byte: ${lastByteSize}`, 10, yPos);
    yPos += 10;

    for (let charCode in asciiTableData) {
      const data = asciiTableData[charCode];
      doc.text(
        `Carácter: ${data.char}, ASCII: ${data.ascii}, Hex: ${data.hex}`,
        10,
        yPos
      );
      yPos += 5;
      doc.text(
        `Cifrado: ${data.encrypted}, Factor Aleatorio: ${data.randomFactor}`,
        10,
        yPos
      );
      yPos += 10;

      if (yPos > 280) {
        doc.addPage();
        yPos = 10;
      }
    }

    simulateDownload(() => doc.save(fileName + ".pdf"));
  }
}

// Función para leer archivo cifrado
function readEncryptedFile() {
  const fileInput = document.getElementById("encryptedFileInput");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      let content = e.target.result;
      if (file.name.endsWith(".pdf")) {
        // Usar pdf.js para leer el contenido del PDF
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(content));
        loadingTask.promise.then(function (pdf) {
          pdf.getPage(1).then(function (page) {
            page.getTextContent().then(function (textContent) {
              const pageText = textContent.items
                .map((item) => item.str)
                .join(" ");
              document.getElementById("inputEncrypted").value = pageText;
              decrypt(); // Descifrar automáticamente después de cargar
            });
          });
        });
      } else if (file.name.endsWith(".docx")) {
        // Usar mammoth.js para leer el contenido del DOCX
        mammoth
          .extractRawText({ arrayBuffer: content })
          .then(function (result) {
            document.getElementById("inputEncrypted").value =
              result.value;
            decrypt(); // Descifrar automáticamente después de cargar
          });
      } else {
        // Para otros formatos de texto plano
        document.getElementById("inputEncrypted").value = content;
        decrypt(); // Descifrar automáticamente después de cargar
      }
    };
    if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }
}

// Función para leer la Tabla de Cifrado ASCII
function readAsciiTableFile() {
  const fileInput = document.getElementById("asciiTableFileInput");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = new Uint8Array(e.target.result);
      const loadingTask = pdfjsLib.getDocument(content);
      loadingTask.promise.then(function (pdf) {
        pdf.getPage(1).then(function (page) {
          page.getTextContent().then(function (textContent) {
            const pageText = textContent.items
              .map((item) => item.str)
              .join(" ");
            // Parsear el contenido del PDF para reconstruir la tabla ASCII
            const lines = pageText.split("\n");
            asciiTableData = {};
            let currentChar = {};
            for (let line of lines) {
              if (line.includes("Carácter:")) {
                const parts = line.split(",");
                currentChar = {
                  char: parts[0].split(":")[1].trim(),
                  ascii: parseInt(parts[1].split(":")[1].trim()),
                  hex: parts[2].split(":")[1].trim(),
                };
              } else if (line.includes("Cifrado:")) {
                const parts = line.split(",");
                currentChar.encrypted = parts[0].split(":")[1].trim();
                currentChar.randomFactor = parts[1].split(":")[1].trim();
                asciiTableData[currentChar.ascii] = currentChar;
              }
            }
            lastByteSize = parseInt(
              pageText.match(/Tamaño de byte: (\d+)/)[1]
            );
            alert("Tabla de Cifrado ASCII cargada correctamente.");
            showAsciiTable(); // Mostrar la tabla ASCII cargada
            // Intentar descifrar si hay texto cifrado cargado
            if (document.getElementById("inputEncrypted").value) {
              decrypt();
            }
          });
        });
      });
    };
    reader.readAsArrayBuffer(file);
  }
}

// Validación de entrada
document
  .getElementById("textToEncrypt")
  .addEventListener("input", function (e) {
    // Permitir todos los caracteres imprimibles y algunos caracteres especiales comunes
    this.value = this.value.replace(/[^\x20-\x7E\n\r\t]/g, "");
  });

document
  .getElementById("inputEncrypted")
  .addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9a-fA-F]/g, ""); // Solo permite caracteres hexadecimales
  });

// Función para validar el tamaño de bytes seleccionado
function validateByteSize() {
  const byteSize = parseInt(document.getElementById("byteSize").value);
  const input = document.getElementById("textToEncrypt").value;
  const maxChar = Math.pow(2, byteSize * 8) - 1;

  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) > maxChar) {
      alert(
        `El carácter "${input[i]}" en la posición ${
          i + 1
        } no es válido para el tamaño de bytes seleccionado.`
      );
      return false;
    }
  }
  return true;
}

// Función para cambiar el tema
function changeTheme(theme) {
  const root = document.documentElement;
  switch (theme) {
    case "light":
      root.style.setProperty("--bg-color", "#f0f0f0");
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty("--container-bg", "white");
      root.style.setProperty("--button-bg", "#4CAF50");
      root.style.setProperty("--button-hover", "#45a049");
      root.style.setProperty("--nav-bg", "#333");
      root.style.setProperty("--nav-text", "white");
      break;
    case "dark":
      root.style.setProperty("--bg-color", "#333");
      root.style.setProperty("--text-color", "#f0f0f0");
      root.style.setProperty("--container-bg", "#444");
      root.style.setProperty("--button-bg", "#4CAF50");
      root.style.setProperty("--button-hover", "#45a049");
      root.style.setProperty("--nav-bg", "#222");
      root.style.setProperty("--nav-text", "#f0f0f0");
      break;
    case "modern":
      root.style.setProperty("--bg-color", "#ecf0f1");
      root.style.setProperty("--text-color", "#2c3e50");
      root.style.setProperty("--container-bg", "white");
      root.style.setProperty("--button-bg", "#3498db");
      root.style.setProperty("--button-hover", "#2980b9");
      root.style.setProperty("--nav-bg", "#34495e");
      root.style.setProperty("--nav-text", "white");
      break;
    case "churrasco":
      root.style.setProperty("--bg-color", "#ffebcd");
      root.style.setProperty("--text-color", "#8b4513");
      root.style.setProperty("--container-bg", "#ffdab9");
      root.style.setProperty("--button-bg", "#d2691e");
      root.style.setProperty("--button-hover", "#a0522d");
      root.style.setProperty("--nav-bg", "#8b4513");
      root.style.setProperty("--nav-text", "#ffdab9");
      break;
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
  // Asegurarse de que los elementos de la interfaz estén listos
  const textToEncrypt = document.getElementById("textToEncrypt");
  const byteSizeSelect = document.getElementById("byteSize");
  const encryptButton = document.querySelector(
    'button[onclick="encrypt()"]'
  );
  const decryptButton = document.querySelector(
    'button[onclick="decrypt()"]'
  );

  // Verificar que todos los elementos necesarios existen
  if (textToEncrypt && byteSizeSelect && encryptButton && decryptButton) {
    console.log("Interfaz cargada correctamente");
  } else {
    console.error("Algunos elementos de la interfaz no se encontraron");
  }

  // Configurar pdf.js
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";
});