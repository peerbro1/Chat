document.addEventListener("DOMContentLoaded", function() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");

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

    // Datei hochladen – NEUER WEBHOOK!
    uploadButton.addEventListener("click", function() {
        const file = fileInput.files[0];
        if (!file) {
            addMessage("bot", "Bitte wähle eine Datei aus.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        fetch("https://peerbro1.app.n8n.cloud/webhook/000e7a64-4208-455c-a68f-50deeb0230d8", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            addMessage("bot", "📄 Datei erfolgreich hochgeladen!");
            updateLists(data.matching, data.open);
        })
        .catch(() => {
            addMessage("bot", "❌ Fehler beim Hochladen der Datei.");
        });
    });

    function updateLists(matching, open) {
        matchList.innerHTML = "";
        openList.innerHTML = "";

        matching.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            matchList.appendChild(li);
        });

        open.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            openList.appendChild(li);
        });
    }
});
