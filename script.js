const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";

document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    // Nutzer-Eingabe anzeigen
    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput}</p>`;
    document.getElementById("userInput").value = "";

    try {
        // Anfrage an n8n senden
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "message", message: userInput })
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Antwort vom Server:", data);

        // Antwort anzeigen
        if (data.output) {
            document.getElementById("chatbox").innerHTML += `<p style="color:blue;"><b>Chatbot:</b> ${data.output}</p>`;
        } else {
            document.getElementById("chatbox").innerHTML += `<p style="color:blue;"><b>Chatbot:</b> (Keine Antwort erhalten)</p>`;
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});

// Datei-Upload
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Bitte wähle eine Datei aus.");
        return;
    }

    const formData = new FormData();
    formData.append("type", "file");
    formData.append("file", file);

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Upload-Antwort:", data);

        // Erfolgsmeldung im Chat anzeigen
        document.getElementById("chatbox").innerHTML += `<p style="color:green;"><b>System:</b> Datei erfolgreich hochgeladen!</p>`;
    } catch (error) {
        console.error("Fehler beim Hochladen:", error);
        document.getElementById("chatbox").innerHTML += `<p style="color:red;"><b>System:</b> Fehler beim Hochladen der Datei.</p>`;
    }
});
