document.addEventListener("DOMContentLoaded", function() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redFlagsList = document.getElementById("redflags-list");
    const statusContainer = document.getElementById("status-container");

    // Webhook-URLs für den Chat und den Datei-Upload
    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    // Chat senden
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        addMessage("user", message);
        statusContainer.textContent = "Nachricht wird gesendet...";
        
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
        });

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Datei-Upload
    uploadButton.addEventListener("click", uploadFile);
    fileInput.addEventListener("change", function() {
        statusContainer.textContent = fileInput.files.length > 0 ? `Ausgewählte Datei: ${fileInput.files[0].name}` : "";
    });

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            statusContainer.textContent = "Bitte wähle zuerst eine Datei aus.";
            return;
        }

        statusContainer.textContent = "Datei wird hochgeladen...";

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            let parsedData;
            try {
                parsedData = JSON.parse(data.output);
            } catch (error) {
                console.error("Fehler beim Parsen der API-Antwort:", error);
                return;
            }

            updateLists(parsedData.passende_qualifikationen, parsedData.zu_klaerende_punkte, parsedData.red_flags);
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der API-Daten:", error);
            statusContainer.textContent = `Fehler: ${error.message}`;
        });
    }

    function updateLists(matching, open, redFlags) {
        matchList.innerHTML = "";
        openList.innerHTML = "";
        redFlagsList.innerHTML = "";

        matching.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("green-text");
            matchList.appendChild(li);
        });

        open.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("orange-text");
            openList.appendChild(li);
        });

        redFlags.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("red-text");
            redFlagsList.appendChild(li);
        });
    }
});
