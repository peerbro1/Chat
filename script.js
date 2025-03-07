document.addEventListener("DOMContentLoaded", function() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    // Begrüßungsnachricht beim Laden der Seite
    addMessage("bot", "Moin! Ich bin dein Chatbot für Fragen zu Peer Meyer-Puttlitz. Frag mich alles, was du wissen möchtest!");

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== "") {
            addMessage("user", message);
            fetchChatbotResponse(message);
            userInput.value = "";
        }
    }

    function fetchChatbotResponse(message) {
        fetch("https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => addMessage("bot", data.output))
        .catch(() => addMessage("bot", "Fehler bei der Verbindung."));
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        messageElement.innerHTML = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

