const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";

// Chat senden
document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput}</p>`;
    document.getElementById("userInput").value = "";

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "message", message: userInput })
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> ${data.output || "Keine Antwort erhalten."}</p>`;
    } catch (error) {
        console.error("Fehler:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});

// Datei-Upload
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageUpload").files[0];

    if (!fileInput) {
        document.getElementById("uploadStatus").innerText = "Bitte eine Datei auswählen!";
        return;
    }

    const formData = new FormData();
    formData.append("type", "file");
    formData.append("file", fileInput);

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        document.getElementById("uploadStatus").innerText = "Upload erfolgreich!";
        document.getElementById("chatbox").innerHTML += `<p style="color:green;"><b>System:</b> Datei erfolgreich hochgeladen!</p>`;
    } catch (error) {
        console.error("Fehler beim Hochladen:", error);
        document.getElementById("uploadStatus").innerText = "Fehler beim Hochladen.";
        document.getElementById("chatbox").innerHTML += `<p style="color:red;"><b>System:</b> Fehler beim Hochladen der Datei.</p>`;
    }
});
