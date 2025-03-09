document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const statusContainer = document.getElementById("status-container");

    const CHAT_WEBHOOK_URL = "DEIN_CHAT_WEBHOOK";
    const FILE_WEBHOOK_URL = "DEIN_UPLOAD_WEBHOOK";

    sendButton.addEventListener("click", sendMessage);
    uploadButton.addEventListener("click", uploadFile);

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;
        
        chatBox.innerHTML += `<div class="user-message">${message}</div>`;
        userInput.value = "";

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            chatBox.innerHTML += `<div class="bot-message">${data.response}</div>`;
        });
    }

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) return;

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: file
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("match-list").innerHTML = data.match;
        });
    }
});
