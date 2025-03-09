document.addEventListener("DOMContentLoaded", function () {
  // DOM-Elemente
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const fileInput = document.getElementById("file-input");
  const fileLabel = document.getElementById("file-label");
  const uploadButton = document.getElementById("upload-button");
  const analysisResults = document.getElementById("analysis-results");
  const uploadStatus = document.getElementById("upload-status");

  // n8n Webhook URLs
  const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
  const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

  // Chat-Funktionalität
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage("user", message);
    userInput.value = "";
    userInput.disabled = true;
    sendButton.disabled = true;

    fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    })
      .then(response => response.json())
      .then(data => {
        addMessage("bot", data.output || "Keine Antwort erhalten.");
      })
      .catch(() => {
        addMessage("bot", "Fehler beim Abrufen der Antwort.");
      })
      .finally(() => {
        userInput.disabled = false;
        sendButton.disabled = false;
      });
  }

  function addMessage(sender, text) {
    const msgElement = document.createElement("div");
    msgElement.className = `message ${sender}`;
    msgElement.textContent = text;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Datei-Upload
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      fileLabel.textContent = fileInput.files[0].name;
      uploadButton.disabled = false;
    }
  });

  uploadButton.addEventListener("click", uploadFile);

  function uploadFile() {
    const file = fileInput.files[0];
    if (!file || file.type !== "application/pdf") {
      uploadStatus.innerHTML = "Bitte eine PDF-Datei hochladen.";
      return;
    }

    uploadStatus.innerHTML = "⏳ Datei wird hochgeladen...";
    uploadButton.disabled = true;

    const formData = new FormData();
    formData.append("file", file);

    fetch(FILE_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log("Antwort von n8n:", data); // Debugging

        uploadStatus.innerHTML = "✅ Datei erfolgreich hochgeladen!";
        processAnalysisData(data);
      })
      .catch(() => {
        uploadStatus.innerHTML = "❌ Fehler beim Hochladen.";
      });
  }

  // Verarbeitung der Analyse-Daten aus n8n
  function processAnalysisData(data) {
    console.log("Debug: Komplette Antwort von n8n:", data);

    // Falls data.output ein JSON-String ist, muss er geparst werden
    let parsedObj = typeof data.output === "string" ? JSON.parse(data.output) : data.output;

    if (!parsedObj || typeof parsedObj !== "object") {
      console.error("Fehler: Daten sind kein gültiges JSON-Objekt", parsedObj);
      analysisResults.innerHTML = "<p>⚠️ Fehler beim Verarbeiten der Analyse-Daten</p>";
      return;
    }

    // Falls keine Daten enthalten sind
    if (Object.keys(parsedObj).length === 0) {
      analysisResults.innerHTML = "<p>⚠️ Keine Daten zur Analyse verfügbar.</p>";
      return;
    }

    // 🎨 FARBCODES FÜR DIE KATEGORIEN
    const categoryColors = {
      "passende_qualifikationen": "#28a745",
      "zu_klaerende_punkte": "#ffc107",
      "red_flags": "#dc3545"
    };

    // 🎨 STYLE FÜR DIE BUBBLES
    const bubbleStyle = `
      display: inline-block;
      padding: 8px 12px;
      border-radius: 15px;
      margin: 5px;
      color: white;
      font-weight: bold;
      font-size: 14px;
    `;

    let outputHTML = `
      <h3 style="text-align: center; color: #333;">📊 <strong>Ergebnisse des Profilabgleichs</strong></h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    `;

    Object.entries(parsedObj).forEach(([category, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        outputHTML += `
          <h4 style="color: ${categoryColors[category] || "#007bff"}; margin-top: 15px;">
            ${category.replace(/_/g, " ").toUpperCase()}
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 5px;">
        `;

        items.forEach(item => {
          outputHTML += `
            <span style="${bubbleStyle} background-color: ${categoryColors[category] || "#007bff"}">
              ${item}
            </span>
          `;
        });

        outputHTML += `</div>`;
      }
    });

    outputHTML += `</div>`;
    analysisResults.innerHTML = outputHTML;
  }
});
