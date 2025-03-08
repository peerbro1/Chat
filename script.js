document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const analysisResults = document.getElementById("analysis-results");

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

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            addMessage("bot", data.output || "Fehler: Keine gültige Antwort erhalten.");
        })
        .catch(() => {
            addMessage("bot", "Fehler bei der Verbindung zum Server.");
        });

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message bubble ${sender}`;
        msg.textContent = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    uploadButton.addEventListener("click", uploadFile);

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            alert("Bitte Datei auswählen!");
            return;
        }

        addMessage("bot", "📂 Datei wird hochgeladen... Bitte einen Moment Geduld.");

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            addMessage("bot", "🔄 Die Analyse läuft... Einen Moment bitte.");
            setTimeout(() => {
                updateAnalysisResults(data.output);
                addMessage("bot", "✅ Die Analyse ist abgeschlossen. Schau dir die Ergebnisse an!");
            }, 2000);
        })
        .catch(() => {
            addMessage("bot", "Fehler beim Hochladen.");
        });
    }

    function updateAnalysisResults(data) {
        analysisResults.innerHTML = "";

        const categories = {
            "passende_qualifikationen": { label: "Das passt gut 🤗", color: "green" },
            "zu_klaerende_punkte": { label: "Sollten wir noch mal anschauen 🧐", color: "orange" },
            "red_flags": { label: "Red Flags? 😧", color: "red" }
        };

        Object.entries(data).forEach(([key, value]) => {
            const div = document.createElement("div");
            div.className = `bubble ${categories[key].color}`;
            div.innerHTML = `<strong>${categories[key].label}:</strong> ${value.join(", ")}`;
            analysisResults.appendChild(div);
        });
    }
});
