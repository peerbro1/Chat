document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redFlagsList = document.getElementById("redflags-list");
    const statusContainer = document.getElementById("status-container");

    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    // Chat-Funktion wieder aktivieren
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
            body: JSON.stringify({ message }),
        })
        .then((response) => response.json())
        .then((data) => {
            addMessage("bot", data.reply || "Keine Antwort vom Server.");
        })
        .catch((error) => {
            addMessage("bot", "Fehler bei der Verbindung zum Server.");
            console.error(error);
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
            statusContainer.textContent = "Bitte Datei auswählen!";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        statusContainer.textContent = "Lade hoch und analysiere...";

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                let parsedData;

                if (typeof data.output === "string") {
                    parsedData = JSON.parse(data.output);
                } else {
                    parsedData = data.output;
                }

                updateLists(parsedData.passende_qualifikationen, parsedData.zu_klaerende_punkte, parsedData.red_flags);
                statusContainer.textContent = "Analyse fertig!";
            })
            .catch((error) => {
                console.error(error);
                statusContainer.textContent = "Fehler: " + error.message;
            });
    }

    function updateLists(matching, open, redFlags) {
        matchList.innerHTML = matching.map(m => `<li>${m}</li>`).join("");
        openList.innerHTML = open.map(item => `<li>${item}</li>`).join("");
        redFlagsList.innerHTML = redFlags.length 
            ? redFlags.map(item => `<li>${item}</li>`).join("") 
            : "<li>Keine Red Flags gefunden.</li>";
    }

    uploadButton.addEventListener("click", uploadFile);
});
