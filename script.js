document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const statusContainer = document.getElementById("status-container");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redflagsList = document.getElementById("redflags-list");

    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        addMessage("user", message);
        addMessage("bot", "✍️ Ich denke nach...");

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            chatBox.lastChild.remove();
            addMessage("bot", data.output || "Fehler: Keine Antwort erhalten.");
        })
        .catch(() => {
            chatBox.lastChild.remove();
            addMessage("bot", "❌ Fehler bei der Verbindung zum Server.");
        });

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message ${sender}`;
        msg.innerHTML = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    uploadButton.addEventListener("click", uploadFile);

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            addMessage("bot", "❌ Bitte wähle eine PDF-Datei aus!");
            return;
        }

        addMessage("bot", "📤 Datei wird hochgeladen...");

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            addMessage("bot", "📊 Die Analyse beginnt...");
            setTimeout(() => {
                displayAnalysisResults(data);
                addMessage("bot", "✅ Die Analyse ist abgeschlossen! Hier sind die Ergebnisse:");
            }, 2000);
        })
        .catch(() => {
            addMessage("bot", "❌ Fehler beim Hochladen.");
        });
    }

    function displayAnalysisResults(data) {
        matchList.innerHTML = data.passende_qualifikationen.map(item => `<li>${item}</li>`).join('') || "Keine Daten.";
        openList.innerHTML = data.zu_klaerende_punkte.map(item => `<li>${item}</li>`).join('') || "Keine Daten.";
        redflagsList.innerHTML = data.red_flags.map(item => `<li>${item}</li>`).join('') || "Keine Daten.";
    }
});
