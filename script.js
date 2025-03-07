const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a"; // Chatbot Webhook
const uploadWebhookUrl = "https://peerbro1.app.n8n.cloud/webhook/dein-upload-webhook"; // Bild-Upload Webhook

// Begrüßung des Chatbots
document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById("chatbox");

    const botMessage = document.createElement("div");
    botMessage.className = "chat-message bot-message";
    botMessage.textContent = "Moin! Wie kann ich dir weiterhelfen?";
    chatbox.appendChild(botMessage);
});

// Chat senden
document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    const chatbox = document.getElementById("chatbox");

    // Nutzer-Eingabe anzeigen
    const userMessage = document.createElement("div");
    userMessage.className = "chat-message user-message";
    userMessage.textContent = userInput;
    chatbox.appendChild(userMessage);
    chatbox.scrollTop = chatbox.scrollHeight;

    document.getElementById("userInput").value = "";

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const botMessage = document.createElement("div");
        botMessage.className = "chat-message bot-message";
        botMessage.textContent = data.output || "Keine Antwort erhalten";
        chatbox.appendChild(botMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        console.error("Fehler:", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "chat-message bot-message";
        errorMessage.textContent = "Fehler bei der Verbindung.";
        chatbox.appendChild(errorMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
});

// Bild-Upload
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("uploadStatus").textContent = "Bitte wähle eine Datei aus.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("uploadStatus").textContent = "Lade hoch...";

    try {
        await fetch(uploadWebhookUrl, {
            method: "POST",
            body: formData
        });

        document.getElementById("uploadStatus").textContent = "Upload erfolgreich! Das Bild wird analysiert.";
    } catch (error) {
        document.getElementById("uploadStatus").textContent = "Fehler beim Hochladen.";
    }
});
