const chatWebhookUrl = "https://peerbro1.app.n8n.cloud/webhook/3eab9c4f-c20b-4432-adcd-095e94f0d84a";
const uploadWebhookUrl = "https://peerbro1.app.n8n.cloud/webhook/3eab9c4f-c20b-4432-adcd-095e94f0d84a";

// Chat-Funktion
document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput}</p>`;
    document.getElementById("userInput").value = "";

    try {
        const response = await fetch(chatWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> ${data.output || "Fehler bei der Antwort."}</p>`;
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});

// Upload-Funktion
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("uploadStatus").innerText = "Bitte eine Datei auswählen.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(uploadWebhookUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP Fehler! Status: ${response.status}`);

        document.getElementById("uploadStatus").innerText = "Upload erfolgreich!";
    } catch (error) {
        console.error("Fehler beim Hochladen:", error);
        document.getElementById("uploadStatus").innerText = "Fehler beim Hochladen.";
    }
});
