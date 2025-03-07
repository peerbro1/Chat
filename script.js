document.addEventListener("DOMContentLoaded", function() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const uploadButton = document.getElementById("uploadButton");
    const imageUpload = document.getElementById("imageUpload");
    const uploadStatus = document.getElementById("uploadStatus");

    // Nachricht an den Chatbot senden
    sendButton.addEventListener("click", function() {
        const message = userInput.value.trim();
        if (message !== "") {
            addMessage("Du", message);
            fetchChatbotResponse(message);
            userInput.value = "";
        }
    });

    // Chatbot-Antwort abrufen
    function fetchChatbotResponse(message) {
        fetch("https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => addMessage("Chatbot", data.output))
        .catch(() => addMessage("Chatbot", "Fehler bei der Verbindung."));
    }

    // Nachricht in den Chat einfügen
    function addMessage(sender, text) {
        const messageElement = document.createElement("p");
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Datei hochladen
    uploadButton.addEventListener("click", function() {
        const file = imageUpload.files[0];
        if (!file) {
            uploadStatus.innerText = "Bitte wähle eine Datei aus.";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch("https://peerbro1.app.n8n.cloud/webhook/3eab9c4f-c20b-4432-adcd-095e94f0d84a", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            uploadStatus.innerText = "Upload erfolgreich!";
            addMessage("System", "Datei erfolgreich hochgeladen!");
        })
        .catch(() => {
            uploadStatus.innerText = "Fehler beim Hochladen.";
            addMessage("System", "Fehler beim Hochladen der Datei.");
        });
    });
});
