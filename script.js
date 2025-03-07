document.addEventListener("DOMContentLoaded", function() {
    // DOM-Elemente
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const statusContainer = document.getElementById("status-container");

    // Webhook-URLs
    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    // Event-Listener
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") sendMessage();
    });
    uploadButton.addEventListener("click", uploadFile);
    
    // Optional: Dateiname anzeigen, wenn eine Datei ausgewählt wurde
    fileInput.addEventListener("change", function() {
        if (fileInput.files.length > 0) {
            statusContainer.textContent = `Ausgewählte Datei: ${fileInput.files[0].name}`;
            statusContainer.className = "";
        } else {
            statusContainer.textContent = "";
        }
    });

    // Nachricht senden
    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== "") {
            addMessage("user", message);
            
            // Status aktualisieren
            statusContainer.textContent = "Nachricht wird gesendet...";
            statusContainer.className = "loading";
            
            // Chatbot-Antwort abrufen
            fetchChatbotResponse(message);
            userInput.value = "";
        }
    }

    // Chatbot-Antwort vom Webhook abrufen
    function fetchChatbotResponse(message) {
        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Serverfehler: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            addMessage("bot", data.output);
            statusContainer.textContent = "";
        })
        .catch(error => {
            console.error("Fehler bei der API-Anfrage:", error);
            addMessage("bot", "Es gab ein Problem bei der Verbindung zum Server. Bitte versuche es später noch einmal.");
            statusContainer.textContent = `Fehler: ${error.message}`;
            statusContainer.className = "error";
        });
    }

    // Nachricht zur Chat-Box hinzufügen
    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.innerHTML = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Datei hochladen
    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            statusContainer.textContent = "Bitte wähle zuerst eine Datei aus.";
            statusContainer.className = "error";
            addMessage("bot", "Bitte wähle zuerst eine Datei aus.");
            return;
        }

        // Überprüfen, ob es sich um eine PDF-Datei handelt
        if (file.type !== "application/pdf") {
            statusContainer.textContent = "Nur PDF-Dateien werden unterstützt.";
            statusContainer.className = "error";
            addMessage("bot", "Nur PDF-Dateien werden unterstützt.");
            return;
        }

        // Status aktualisieren
        statusContainer.textContent = "Datei wird hochgeladen...";
        statusContainer.className = "loading";
        addMessage("bot", "Datei wird hochgeladen und analysiert...");

        // FormData für Datei-Upload erstellen
        const formData = new FormData();
        formData.append("file", file);

        // Datei zum Webhook senden
        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Serverfehler: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Status aktualisieren
            statusContainer.textContent = "Datei erfolgreich hochgeladen!";
            statusContainer.className = "success";
            
            // Erfolgsnachricht im Chat anzeigen
            addMessage("bot", "📄 Die Stellenausschreibung wurde erfolgreich hochgeladen und analysiert!");
            
            // Listen mit den Ergebnissen aktualisieren
            updateLists(data.matching, data.open);
        })
        .catch(error => {
            console.error("Fehler beim Datei-Upload:", error);
            statusContainer.textContent = `Fehler beim Upload: ${error.message}`;
            statusContainer.className = "error";
            addMessage("bot", "❌ Fehler beim Hochladen der Datei. Bitte versuche es erneut oder kontaktiere den Support.");
        });
    }

    // Listen für Qualifikationen und offene Punkte aktualisieren
    function updateLists(matching, open) {
        // Listen leeren
        matchList.innerHTML = "";
        openList.innerHTML = "";

        // Wenn keine Daten vorhanden sind
        if (!matching || !Array.isArray(matching)) {
            const li = document.createElement("li");
            li.textContent = "Keine passenden Qualifikationen gefunden.";
            matchList.appendChild(li);
        } else {
            // Passende Qualifikationen hinzufügen
            matching.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                matchList.appendChild(li);
            });
        }

        if (!open || !Array.isArray(open)) {
            const li = document.createElement("li");
            li.textContent = "Keine offenen Punkte gefunden.";
            openList.appendChild(li);
        } else {
            // Offene Punkte hinzufügen
            open.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                openList.appendChild(li);
            });
        }
    }

    // Initialisierung: Begrüßungsnachricht anzeigen
    addMessage("bot", "Hallo! Ich bin dein Jobanalyse-Chatbot. Lade eine Stellenausschreibung hoch, um zu sehen, welche Qualifikationen du bereits erfüllst und welche Punkte noch zu klären sind. Du kannst mir auch Fragen zum Bewerbungsprozess stellen.");
});