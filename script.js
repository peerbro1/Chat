const WEBHOOK_URL_CHAT = "https://peerbro1.app.n8n.cloud/webhook/DEIN_CHAT_WEBHOOK";
const WEBHOOK_URL_UPLOAD = "https://peerbro1.app.n8n.cloud/webhook/DEIN_UPLOAD_WEBHOOK";

document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("uploadButton").addEventListener("click", uploadFile);

function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    addMessage("Du", userInput);
    document.getElementById("user-input").value = "";

    fetch(WEBHOOK_URL_CHAT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput }),
        mode: "cors"
    })
    .then(response => response.json())
    .then(data => addMessage("Chatbot", data.output || "Keine Antwort erhalten."))
    .catch(error => addMessage("Chatbot", "Fehler bei der Verbindung."));
}

function uploadFile() {
    const fileInput = document.getElementById("imageUpload").files[0];
    if (!fileInput) {
        document.getElementById("uploadStatus").innerText = "Bitte eine Datei auswählen.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput);

    fetch(WEBHOOK_URL_UPLOAD, {
        method: "POST",
        body: formData,
        mode: "cors"
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("uploadStatus").innerText = "Upload erfolgreich!";
        addMessage("System", "Datei erfolgreich hochgeladen!", "green");
    })
    .catch(error => {
        document.getElementById("uploadStatus").innerText = "Fehler beim Hochladen.";
        addMessage("System", "Fehler beim Hochladen der Datei.", "red");
    });
}

function addMessage(sender, text, color = "black") {
    const chatBox = document.getElementById("chat-box");
    const message = document.createElement("p");
    message.innerHTML = `<strong style="color:${color}">${sender}:</strong> ${text}`;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}
