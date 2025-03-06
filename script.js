const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook-test/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";

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
            body: JSON.stringify({ message: userInput })
        });

        // Prüfen, ob die Antwort erfolgreich ist
        if (!response.ok) {
            throw new Error(`Serverantwort: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Antwort vom Server:", data);  // Debugging

        // Die Antwort ist in einem Array, also müssen wir die erste Antwort extrahieren
        if (Array.isArray(data) && data.length > 0 && data[0].output) {
            document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> ${data[0].output}</p>`;
        } else {
            document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> (Keine Antwort erhalten)</p>`;
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        document.getElementById("chatbox").innerHTML += `<p><b>Chatbot:</b> Fehler bei der Verbindung.</p>`;
    }
});
