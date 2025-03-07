const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook/3eab9c4f-c20b-4432-adcd-095e94f0d84a";

// **Chat-Eingabe mit Text oder Datei**
document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value;
    const fileInput = document.getElementById("imageUpload").files[0];
    document.getElementById("userInput").value = "";

    if (!userInput && !fileInput) return;

    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput || "[Datei gesendet]"}</p>`;

    try {
        let formData = new FormData();

        if (fileInput) {
            formData.append("file", fileInput);
        } else {
            formData.append("message", userInput);
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> ${data.reply || "Upload erfolgreich!"}</p>`;

    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});
