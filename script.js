document.addEventListener("DOMContentLoaded", function() {
    // DOM-Elemente
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redFlagsList = document.getElementById("redflags-list");
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
    
    fileInput.addEventListener("change", function() {
        if (fileInput.files.length > 0) {
            statusContainer.textContent = `Ausgewählte Datei: ${fileInput.files[0].name}`;
            statusContainer.className = "";
        } else {
            statusContainer.textContent = "";
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== "") {
            addMessage("user", message);
            statusContainer.textContent = "Nachricht wird gesendet...";
            statusContainer.className = "loading";
            fetchChatbotResponse(message);
            userInput.value = "";
        }
    }

    function fetchChatbotResponse(message) {
        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage("bot", data.output);
            statusContainer.textContent = "";
        })
        .catch(error => {
            console.error("Fehler:", error);
            addMessage("bot", "Fehler bei der Verbindung zum Server.");
            statusContainer.textContent = `Fehler: ${error.message}`;
            statusContainer.className = "error";
        });
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.innerHTML = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            statusContainer.textContent = "Bitte wähle zuerst eine Datei aus.";
            statusContainer.className = "error";
            addMessage("bot", "Bitte wähle zuerst eine Datei aus.");
            return;
        }

        if (file.type !== "application/pdf") {
            statusContainer.textContent = "Nur PDF-Dateien werden unterstützt.";
            statusContainer.className = "error";
            addMessage("bot", "Nur PDF-Dateien werden unterstützt.");
            return;
        }

        statusContainer.textContent = "Datei wird hochgeladen...";
        statusContainer.className = "loading";
        addMessage("bot", "Datei wird hochgeladen und analysiert...");

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            statusContainer.textContent = "Analyse abgeschlossen!";
            statusContainer.className = "success";
            addMessage("bot", "📄 Die Stellenausschreibung wurde analysiert!");

            updateLists(data.passende_qualifikationen, data.zu_klaerende_punkte, data.red_flags);
        })
        .catch(error => {
            console.error("Fehler beim Upload:", error);
            statusContainer.textContent = `Fehler: ${error.message}`;
            statusContainer.className = "error";
            addMessage("bot", "❌ Fehler beim Hochladen der Datei.");
        });
    }

    function updateLists(matching, open, redFlags) {
        matchList.innerHTML = "";
        openList.innerHTML = "";
        redFlagsList.innerHTML = "";

        matching?.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            matchList.appendChild(li);
        });

        open?.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            openList.appendChild(li);
        });

        redFlags?.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            li.style.color = "red";
            redFlagsList.appendChild(li);
        });
    }

    addMessage("bot", "Hallo! Lade eine Stellenausschreibung hoch, um deine Chancen zu prüfen.");
});
