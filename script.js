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
  
  // n8n Webhook URLs (ggf. anpassen)
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Chat-Response von n8n:", data);
        const botMessage = data?.output || "Ich konnte keine Antwort generieren.";
        addMessage("bot", botMessage);
      })
      .catch(error => {
        console.error("Fehler:", error);
        addMessage("bot", "Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.");
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

  // Datei-Upload Funktionalität
  fileInput.addEventListener("change", function() {
    const file = fileInput.files[0];
    fileLabel.textContent = file ? file.name : "Datei auswählen";
    uploadButton.disabled = !file;
  });

  uploadButton.addEventListener("click", uploadFile);

  function uploadFile() {
    const file = fileInput.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Bitte wähle eine gültige PDF-Datei aus.");
      return;
    }

    uploadButton.disabled = true;
    uploadStatus.innerHTML = "⏳ Datei wird hochgeladen und analysiert...";
    analysisResults.innerHTML = "⏳ Analyse wird durchgeführt...";

    const formData = new FormData();
    formData.append("file", file);

    fetch(FILE_WEBHOOK_URL, {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log("Upload-Response von n8n:", data);
        displayAnalysisResults(data);
      })
      .catch(error => {
        console.error("Upload-Fehler:", error);
        analysisResults.innerHTML = "⚠️ Fehler beim Hochladen. Bitte versuche es erneut.";
      });
  }

  function displayAnalysisResults(data) {
    if (!data || Object.keys(data).length === 0) {
      analysisResults.innerHTML = "⚠️ Keine Analyseergebnisse verfügbar.";
      return;
    }

    let tableHTML = `
      <h3>Ergebnisse des Profilabgleichs</h3>
      <table class="analysis-table">
        <thead>
          <tr>
            <th>Passende Qualifikationen</th>
            <th>Zu klärende Punkte</th>
            <th>Red Flags</th>
          </tr>
        </thead>
        <tbody>
    `;

    const maxRows = Math.max(
      data.passende_qualifikationen?.length || 0,
      data.zu_klaerende_punkte?.length || 0,
      data.red_flags?.length || 0
    );

    for (let i = 0; i < maxRows; i++) {
      tableHTML += `
        <tr>
          <td>${data.passende_qualifikationen?.[i] || ""}</td>
          <td>${data.zu_klaerende_punkte?.[i] || ""}</td>
          <td>${data.red_flags?.[i] || ""}</td>
        </tr>
      `;
    }

    tableHTML += `</tbody></table>`;
    analysisResults.innerHTML = tableHTML;
  }

  // Erste Nachricht des Chatbots
  addMessage("bot", "Hallo! Ich bin der Bewerbungsbot und kann dir Fragen zu meinem Profil beantworten. Was möchtest du wissen?");
});
