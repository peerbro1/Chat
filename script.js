const webhookUrl = "DEINE_N8N_WEBHOOK_URL_HIER"; // Webhook-URL aus n8n einfügen

document.getElementById("sendButton").addEventListener("click", async () => {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    // Nutzer-Eingabe anzeigen
    document.getElementById("chatbox").innerHTML += `<p><b>Du:</b> ${userInput}</p>`;
    document.getElementById("userInput").value = "";

    try {
        // Anfrage an n8n senden
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput })
        });

        const data = await response.json();
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> ${data.reply}</p>`;
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});
