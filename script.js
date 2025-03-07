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

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                let parsedData = typeof data.output === "string" ? JSON.parse(data.output) : data.output;
                updateAnalysisTable(parsedData);
            })
            .catch((error) => {
                console.error(error);
                alert("Fehler beim Hochladen: " + error.message);
            });
    }

    function updateAnalysisTable(data) {
        analysisTable.innerHTML = "";
        Object.entries(data).forEach(([key, value]) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${key}</td><td>${value.join(", ")}</td>`;
            analysisTable.appendChild(row);
        });
    }
});
