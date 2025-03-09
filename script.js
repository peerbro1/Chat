document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const statusContainer = document.getElementById("status-container");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redflagsList = document.getElementById("redflags-list");

    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    uploadButton.addEventListener("click", uploadFile);

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            statusContainer.innerHTML = "❌ Bitte wähle eine PDF-Datei aus!";
            return;
        }

        statusContainer.innerHTML = "📤 Datei wird hochgeladen...";

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            statusContainer.innerHTML = "📊 Die Analyse beginnt...";
            setTimeout(() => {
                displayAnalysisResults(data);
                statusContainer.innerHTML = "✅ Analyse abgeschlossen!";
            }, 2000);
        })
        .catch(() => {
            statusContainer.innerHTML = "❌ Fehler beim Hochladen.";
        });
    }
});
