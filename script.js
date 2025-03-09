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
    const modal = document.getElementById("notification-modal");
    const modalMessage = document.getElementById("notification-message");
    const closeButton = document.querySelector(".close-button");
  
    // n8n Webhook URLs (ggf. anpassen)
    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";
  
    // Statusvariablen
    let fileName = "";
    let isUploading = false;
  
    //------------------------------------------------
    // CHAT-FUNKTIONALITÄT
    //------------------------------------------------
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  
    function sendMessage() {
      const message = userInput.value.trim();
      if (message === "" || isUploading) return;
  
      addMessage("user", message);
      showTypingIndicator();
      userInput.value = "";
      userInput.disabled = true;
      sendButton.disabled = true;
  
      fetch(CHAT_WEBHOOK_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Netzwerkfehler");
          }
          return response.json();
        })
        .then(data => {
          removeTypingIndicator();
          console.log("Chat-Response von n8n:", data);
  
          // Falls n8n ein Array zurückgibt
          if (Array.isArray(data) && data.length > 0 && data[0].output) {
            addMessage("bot", data[0].output);
          }
          // Falls n8n ein Objekt { "output": "..." }
          else if (data.output) {
            addMessage("bot", data.output);
          }
          else {
            addMessage("bot", "Ich konnte keine Antwort generieren. Bitte versuche es erneut.");
          }
        })
        .catch(error => {
          console.error("Fehler:", error);
          removeTypingIndicator();
          addMessage("bot", "Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.");
        })
        .finally(() => {
          userInput.disabled = false;
          sendButton.disabled = false;
          userInput.focus();
        });
    }
  
    function addMessage(sender, text) {
      const msgElement = document.createElement("div");
      msgElement.className = `message ${sender}`;
      msgElement.textContent = text;
      chatBox.appendChild(msgElement);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function showTypingIndicator() {
      removeTypingIndicator();
      const typingIndicator = document.createElement("div");
      typingIndicator.id = "typing-indicator";
      typingIndicator.className = "message bot typing";
      typingIndicator.textContent = "Der Chatbot schreibt...";
      chatBox.appendChild(typingIndicator);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    function removeTypingIndicator() {
      const typingIndicator = document.getElementById("typing-indicator");
      if (typingIndicator) typingIndicator.remove();
    }
  
    //------------------------------------------------
    // DATEI-UPLOAD: STELLENABGLEICH
    //------------------------------------------------
    fileInput.addEventListener("change", function() {
      const file = fileInput.files[0];
      if (file) {
        fileName = file.name;
        fileLabel.textContent = fileName;
        uploadButton.disabled = false;
      } else {
        fileLabel.textContent = "Datei auswählen";
        uploadButton.disabled = true;
      }
    });
  
    uploadButton.addEventListener("click", uploadFile);
  
    function uploadFile() {
      const file = fileInput.files[0];
      if (!file) {
        showNotification("Bitte wähle zuerst eine PDF-Datei aus.");
        return;
      }
  
      if (file.type !== "application/pdf") {
        showNotification("Bitte lade nur PDF-Dateien hoch.");
        return;
      }
  
      isUploading = true;
      uploadButton.disabled = true;
      uploadStatus.innerHTML = '<span style="color: var(--primary-color);">⏳ Datei wird hochgeladen und analysiert...</span>';
      analysisResults.innerHTML = '<p>⏳ Analyse wird durchgeführt...</p>';
  
      const formData = new FormData();
      formData.append("file", file);
  
      fetch(FILE_WEBHOOK_URL, {
        method: "POST",
        mode: "cors",
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Netzwerkfehler beim Hochladen");
          }
          return response.json();
        })
        .then(data => {
          isUploading = false;
          uploadStatus.innerHTML = '<span style="color: var(--success-color);">✅ Datei erfolgreich hochgeladen und analysiert!</span>';
          console.log("Upload-Response von n8n:", data);
  
          // data ist ein Array, z. B.:
          // [
          //   {
          //     "output": "{\n  \"passende_qualifikationen\": [...],\n  \"zu_klaerende_punkte\": [...],\n  \"red_flags\": [...]\n}"
          //   }
          // ]
          if (Array.isArray(data) && data.length > 0 && data[0].output) {
            try {
              const parsedObj = JSON.parse(data[0].output);
              displayAnalysisResults(parsedObj);
            } catch (err) {
              console.error("Fehler beim JSON-Parse:", err);
              analysisResults.innerHTML = '<p>⚠️ Konnte die Analyse-Daten nicht verarbeiten (Parse-Fehler).</p>';
            }
          } else {
            analysisResults.innerHTML = '<p>⚠️ Keine detaillierten Analyseergebnisse verfügbar.</p>';
          }
  
          // Zurücksetzen
          fileInput.value = "";
          fileLabel.textContent = "Datei auswählen";
          uploadButton.disabled = true;
        })
        .catch(error => {
          console.error("Upload-Fehler:", error);
          isUploading = false;
          uploadStatus.innerHTML = '<span style="color: var(--error-color);">❌ Fehler beim Hochladen. Bitte versuche es erneut.</span>';
          analysisResults.innerHTML = '<p>⚠️ Keine Analyse-Ergebnisse verfügbar aufgrund eines Fehlers.</p>';
          uploadButton.disabled = false;
        });
    }
  
    /**
     * Baut eine 3-Spalten-Tabelle:
     *   passende_qualifikationen
     *   zu_klaerende_punkte
     *   red_flags
     */
    function displayAnalysisResults(parsedObj) {
      const arrPassend = parsedObj.passende_qualifikationen || [];
      const arrKlaeren = parsedObj.zu_klaerende_punkte || [];
      const arrFlags = parsedObj.red_flags || [];
  
      if (arrPassend.length === 0 && arrKlaeren.length === 0 && arrFlags.length === 0) {
        analysisResults.innerHTML = '<p>Keine detaillierten Analyseergebnisse verfügbar.</p>';
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
  
      const maxRows = Math.max(arrPassend.length, arrKlaeren.length, arrFlags.length);
      for (let i = 0; i < maxRows; i++) {
        const col1 = arrPassend[i] || "";
        const col2 = arrKlaeren[i] || "";
        const col3 = arrFlags[i] || "";
        tableHTML += `
          <tr>
            <td>${col1}</td>
            <td>${col2}</td>
            <td>${col3}</td>
          </tr>
        `;
      }
  
      tableHTML += `
          </tbody>
        </table>
      `;
  
      analysisResults.innerHTML = tableHTML;
  
      // Styles für Tabelle nur einmal anhängen
      if (!document.getElementById('analysis-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'analysis-styles';
        styleElement.textContent = `
          .analysis-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .analysis-table th,
          .analysis-table td {
            border: 1px solid #ccc;
            padding: 10px;
            vertical-align: top;
          }
          .analysis-table th {
            background-color: var(--primary-color);
            color: #fff;
          }
        `;
        document.head.appendChild(styleElement);
      }
    }
  
    //------------------------------------------------
    // MODAL-FUNKTION
    //------------------------------------------------
    function showNotification(message) {
      modalMessage.textContent = message;
      modal.style.display = "block";
    }
  
    closeButton.addEventListener("click", function() {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  
    // Erste Bot-Nachricht
    addMessage("bot", "Hallo! Ich bin der Bewerbungsbot und kann dir Fragen zu meinem Profil beantworten. Was möchtest du wissen?");
  });
  