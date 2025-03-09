document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const analysisResults = document.getElementById("analysis-results");

    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/DEIN_CHAT_WEBHOOK";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/DEIN_FILE_WEBHOOK";

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        addMessage("user", message);

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
            .then(response => response.json())
            .then(data => addMessage("bot", data.output))
            .catch(() => addMessage("bot", "⚠️ Fehler bei der Verbindung zum Server."));

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message ${sender}`;
        msg.textContent = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    uploadButton.addEventListener("click", () => {
        if (!fileInput.files.length) return alert("Bitte Datei auswählen!");

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        addMessage("bot", "📤 Datei wird hochgeladen...");

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                addMessage("bot", "📊 Die Analyse beginnt...");
                setTimeout(() => {
                    analysisResults.innerHTML = formatAnalysisResults(data);
                    addMessage("bot", "✅ Die Analyse ist abgeschlossen!");
                }, 2000);
            })
            .catch(() => addMessage("bot", "❌ Fehler beim Hochladen."));
    });

    function formatAnalysisResults(data) {
        return `
            <p>✅ <strong>Passende Qualifikationen</strong>: ${data.passende_qualifikationen || "Keine Daten."}</p>
            <p>🧐 <strong>Zu klärende Punkte</strong>: ${data.zu_klaerende_punkte || "Keine Daten."}</p>
            <p>⚠️ <strong>Red Flags</strong>: ${data.red_flags || "Keine Daten."}</p>
        `;
    }
});
