document.addEventListener("DOMContentLoaded", function() {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const uploadButton = document.getElementById("upload-button");
    const matchList = document.getElementById("match-list");
    const openList = document.getElementById("open-list");
    const redFlagsList = document.getElementById("redflags-list");
    const statusContainer = document.getElementById("status-container");

    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    uploadButton.addEventListener("click", uploadFile);
    
    fileInput.addEventListener("change", function() {
        statusContainer.textContent = fileInput.files.length > 0 ? `Ausgewählte Datei: ${fileInput.files[0].name}` : "";
    });

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            statusContainer.textContent = "Bitte wähle zuerst eine Datei aus.";
            statusContainer.className = "error";
            return;
        }

        statusContainer.textContent = "Datei wird hochgeladen...";
        statusContainer.className = "loading";

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Antwort (Rohdaten):", data);

            let parsedData;
            try {
                parsedData = JSON.parse(data.output);
                console.log("Geparste API Antwort:", parsedData);
            } catch (error) {
                console.error("Fehler beim Parsen der API-Antwort:", error);
                throw new Error("Fehlerhafte JSON-Struktur in der API-Antwort");
            }

            if (!parsedData.passende_qualifikationen || !parsedData.zu_klaerende_punkte || !parsedData.red_flags) {
                throw new Error("Fehlende Daten in der API-Antwort");
            }

            updateLists(parsedData.passende_qualifikationen, parsedData.zu_klaerende_punkte, parsedData.red_flags);
        })
        .catch(error => {
            console.error("Fehler beim Abrufen der API-Daten:", error);
            statusContainer.textContent = `Fehler: ${error.message}`;
            statusContainer.className = "error";
        });
    }

    function updateLists(matching, open, redFlags) {
        matchList.innerHTML = "";
        openList.innerHTML = "";
        redFlagsList.innerHTML = "";

        matching.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("green-text");
            matchList.appendChild(li);
        });

        open.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("orange-text");
            openList.appendChild(li);
        });

        redFlags.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<b>${item}</b>`;
            li.classList.add("red-text");
            redFlagsList.appendChild(li);
        });
    }
});
