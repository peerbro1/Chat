// === Chatbot-Integration ===
const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook-test/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";

document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput}</p>`;
    document.getElementById("userInput").value = "";

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        document.getElementById("chatbox").innerHTML += `<p class="bot-response"><b>Chatbot:</b> ${data.reply}</p>`;
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p class="error"><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});

// === Datei-Upload Integration ===
const uploadWebhookUrl = "https://corsproxy.io/?https://peerbro1.app.n8n.cloud/webhook/3eab9c4f-c20b-4432-adcd-095e94f0d84a";

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
        const response = await fetch(uploadWebhookUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Fehler beim Upload");

        document.getElementById("uploadStatus").textContent = "Upload erfolgreich!";
    } catch (error) {
        document.getElementById("uploadStatus").textContent = "Fehler beim Hochladen.";
        console.error("Upload-Fehler:", error);
    }
});
