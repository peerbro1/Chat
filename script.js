const webhookUrl = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";

document.addEventListener("DOMContentLoaded", () => {
    const chatbox = document.getElementById("chatbox");

    // Begrüßung automatisch anzeigen
    const botMessage = document.createElement("div");
    botMessage.className = "chat-message bot-message";
    botMessage.textContent = "Hallo! 👋 Ich bin dein Bewerbungs-Chatbot. Wie kann ich dir helfen?";
    chatbox.appendChild(botMessage);
});

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
        console.log("Antwort vom Server:", data);

        // Antwort anzeigen
        const botMessage = document.createElement("div");
        botMessage.className = "chat-message bot-message";
        botMessage.textContent = data.output || "Keine Antwort erhalten";
        chatbox.appendChild(botMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        console.error("Fehler beim Abrufen der Antwort:", error);
        const errorMessage = document.createElement("div");
        errorMessage.className = "chat-message bot-message";
        errorMessage.textContent = "Fehler bei der Verbindung.";
        chatbox.appendChild(errorMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
});
