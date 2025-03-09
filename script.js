document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const analysisResults = document.getElementById("analysis-results");

    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/file-upload";

    // Chat senden
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        addMessage("user", message);
        showTypingIndicator();

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message })
        })
        .then(response => response.json())
        .then(data => {
            removeTypingIndicator();
            addMessage("bot", data.output || "⚠️ Keine Antwort erhalten.");
        })
        .catch(() => {
            removeTypingIndicator();
            addMessage("bot", "⚠️ Fehler bei der Verbindung zum Server.");
        });

        userInput.value = "";
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
        typingIndicator.className = "message bot";
        typingIndicator.textContent = "Der Chatbot schreibt...";
        chatBox.appendChild(typingIndicator);
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) typingIndicator.remove();
    }

    // Datei-Upload
    uploadButton.addEventListener("click", function () {
        const file = fileInput.files[0];
        if (!file) return alert("Bitte eine Datei auswählen!");

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => {
            analysisResults.innerHTML = "✅ Analyse abgeschlossen!";
        })
        .catch(() => {
            analysisResults.innerHTML = "❌ Fehler beim Hochladen.";
        });
    });
});
