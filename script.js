document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const analysisTable = document.querySelector("#analysis-table tbody");

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
        .then(response => {
            console.log("Antwort-Status:", response.status);
            return response.json();
        })
        .then(data => {
            console.log("Antwort-Body:", data);
            if (data && data.output) {
                addMessage("bot", data.output);
            } else {
                addMessage("bot", "Fehler: Keine gültige Antwort erhalten.");
            }
        })
        .catch(error => {
            console.error("Fetch-Fehler:", error);
            addMessage("bot", "Fehler bei der Verbindung zum Server.");
        });

        userInput.value = "";
    }

    function addMessage(sender, text) {
        const msg = document.createElement("div");
        msg.className = `message bubble ${sender}`;
        msg.textContent = text;
        chatBox.appendChild(msg);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll immer zum neuesten Eintrag
    }

    uploadButton.addEventListener("click", uploadFile);

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            alert("Bitte Datei auswählen!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Fehler beim Hochladen");
            }
            return response.json();
        })
        .then(data => {
            let parsedData = typeof data.output === "string" ? JSON.parse(data.output) : data.output;
            updateAnalysisTable(parsedData);
        })
        .catch(error => {
            console.error(error);
            alert("Fehler beim Hochladen: " + error.message);
        });
    }

    function updateAnalysisTable(data) {
        analysisTable.innerHTML = "";
        const renamedKeys = {
            "passende_qualifikationen": "Das passt gut 🤗",
            "zu_klaerende_punkte": "Sollten wir noch mal anschauen 🧐",
            "red_flags": "Red Flags? 😧"
        };

        Object.entries(data).forEach(([key, value]) => {
            const newKey = renamedKeys[key] || key;
            const row = document.createElement("tr");
            row.innerHTML = `<td>${newKey}</td><td>${value.join(", ")}</td>`;
            analysisTable.appendChild(row);
        });
    }
});
