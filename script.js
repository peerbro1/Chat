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
    let parsedObj = data.output; // Direkt als Objekt verwenden

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

    // Darstellung als Liste (anstatt von Bubbles)
    let outputHTML = `<h3>📊 Ergebnisse des Profilabgleichs</h3>`;

    Object.entries(parsedObj).forEach(([category, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        outputHTML += `<h4>🔹 ${category.replace(/_/g, " ").toUpperCase()}</h4><ul>`;
        items.forEach(item => {
          outputHTML += `<li>${item}</li>`;
        });
        outputHTML += `</ul>`;
      }
    });

    analysisResults.innerHTML = outputHTML;
  }
});
