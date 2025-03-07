document.addEventListener("DOMContentLoaded", function () {
    const chatbox = document.getElementById("chatbox");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const imageUpload = document.getElementById("imageUpload");
    const uploadButton = document.getElementById("uploadButton");
    const uploadStatus = document.getElementById("uploadStatus");

    const WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a"; // Deine Webhook-URL

    // Funktion, um eine Nachricht in die Chatbox zu schreiben
    function appendMessage(sender, message, color = "black") {
        const messageElement = document.createElement("p");
        messageElement.innerHTML = `<strong style="color: ${color}">${sender}:</strong> ${message}`;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Chat senden
    sendButton.addEventListener("click", function () {
        const message = userInput.value.trim();
        if (message === "") return;

        appendMessage("Du", message, "black");
        userInput.value = "";

        fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Serverfehler: ${response.status}`);
                }
                return response.text(); 
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    throw new Error("Antwort ist kein gültiges JSON");
                }
            })
            .then(data => {
                appendMessage("Chatbot", data.output || "Keine Antwort erhalten.", "blue");
            })
            .catch(error => {
                console.error("Fehler beim Abrufen der Antwort:", error);
                appendMessage("Chatbot", "Fehler bei der Verbindung.", "red");
            });
    });

    // Datei-Upload
    uploadButton.addEventListener("click", function () {
        const file = imageUpload.files[0];
        if (!file) {
            uploadStatus.innerText = "Bitte eine Datei auswählen.";
            uploadStatus.style.color = "red";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch(WEBHOOK_URL, {
            method: "POST",
            body: formData,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Serverfehler: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch {
                    throw new Error("Antwort ist kein gültiges JSON");
                }
            })
            .then(data => {
                appendMessage("System", "Datei erfolgreich hochgeladen!", "green");
                uploadStatus.innerText = "Upload erfolgreich!";
                uploadStatus.style.color = "blue";
            })
            .catch(error => {
                console.error("Fehler beim Hochladen:", error);
                appendMessage("System", "Fehler beim Hochladen der Datei.", "red");
                uploadStatus.innerText = "Fehler beim Upload.";
                uploadStatus.style.color = "red";
            });
    });
});
