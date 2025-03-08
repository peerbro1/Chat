document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const analysisResults = document.getElementById("analysis-results");
    const uploadStatus = document.getElementById("upload-status");

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
            addMessage("bot", data.output || "Fehler: Keine Antwort erhalten.");
        })
        .catch(() => {
            addMessage("bot", "❌ Fehler bei der Verbindung zum Server.");
        });

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message ${sender}`;
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

        uploadStatus.innerHTML = "📂 Datei wird hochgeladen... Bitte warten.";

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            uploadStatus.innerHTML = "✅ Datei erfolgreich hochgeladen! Die Analyse läuft...";
            setTimeout(() => {
                displayAnalysisResults(data.output);
                uploadStatus.innerHTML = "✅ Analyse abgeschlossen!";
            }, 2000);
        })
        .catch(() => {
            uploadStatus.innerHTML = "❌ Fehler beim Hochladen.";
        });
    }

    function displayAnalysisResults(data) {
        analysisResults.innerHTML = ""; // Vorherige Ergebnisse löschen

        if (!data || Object.keys(data).length === 0) {
            analysisResults.innerHTML = "<p>❌ Keine Analyse-Ergebnisse gefunden.</p>";
            return;
        }

        const categories = {
            "passende_qualifikationen": { label: "✅ Das passt gut:", color: "green" },
            "zu_klaerende_punkte": { label: "🧐 Sollten wir noch mal anschauen:", color: "orange" },
            "red_flags": { label: "❌ Red Flags:", color: "red" }
        };

        Object.entries(data).forEach(([key, value]) => {
            if (!categories[key]) return;

            const div = document.createElement("div");
            div.className = `analysis-box ${categories[key].color}`;
            div.innerHTML = `<strong>${categories[key].label}</strong> ${value.join(", ")}`;
            analysisResults.appendChild(div);
        });
    }
});
