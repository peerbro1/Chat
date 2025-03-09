document.addEventListener("DOMContentLoaded", function () {
    // DOM-Elemente
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const fileInput = document.getElementById("file-input");
    const fileLabel = document.getElementById("file-label");
    const uploadButton = document.getElementById("upload-button");
    const analysisResults = document.getElementById("analysis-results");
    const uploadStatus = document.getElementById("upload-status");
    const modal = document.getElementById("notification-modal");
    const modalMessage = document.getElementById("notification-message");
    const closeButton = document.querySelector(".close-button");

    // Webhook URLs
    const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
    const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

    // Statusvariablen
    let fileName = "";
    let isUploading = false;

    // Chat-Funktionalität
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === "" || isUploading) return;

        addMessage("user", message);
        showTypingIndicator();
        userInput.value = "";
        userInput.disabled = true;
        sendButton.disabled = true;

        fetch(CHAT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Netzwerkfehler");
            }
            return response.json();
        })
        .then(data => {
            removeTypingIndicator();
            if (data && data.output) {
                addMessage("bot", data.output);
            } else {
                addMessage("bot", "Es tut mir leid, ich konnte keine Antwort generieren. Bitte versuche es noch einmal.");
            }
        })
        .catch(error => {
            console.error("Fehler:", error);
            removeTypingIndicator();
            addMessage("bot", "Es ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.");
        })
        .finally(() => {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        });
    }

    function addMessage(sender, text) {
        const msgElement = document.createElement("div");
        msgElement.className = `message ${sender}`;
        msgElement.textContent = text;
        chatBox.appendChild(msgElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
        removeTypingIndicator();
        const typingIndicator = document.createElement("div");
        typingIndicator.id = "typing-indicator";
        typingIndicator.className = "message bot typing";
        typingIndicator.textContent = "Der Chatbot schreibt...";
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) typingIndicator.remove();
    }

    // Datei-Upload-Funktionalität
    fileInput.addEventListener("change", function() {
        const file = fileInput.files[0];
        if (file) {
            fileName = file.name;
            fileLabel.textContent = fileName;
            uploadButton.disabled = false;
        } else {
            fileLabel.textContent = "Datei auswählen";
            uploadButton.disabled = true;
        }
    });

    uploadButton.addEventListener("click", uploadFile);

    function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            showNotification("Bitte wähle zuerst eine PDF-Datei aus.");
            return;
        }

        if (file.type !== "application/pdf") {
            showNotification("Bitte lade nur PDF-Dateien hoch.");
            return;
        }

        isUploading = true;
        uploadButton.disabled = true;
        uploadStatus.innerHTML = '<span style="color: #5a67d8;">⏳ Datei wird hochgeladen und analysiert...</span>';
        analysisResults.innerHTML = '<p>⏳ Analyse wird durchgeführt...</p>';

        const formData = new FormData();
        formData.append("file", file);

        fetch(FILE_WEBHOOK_URL, {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Netzwerkfehler beim Hochladen");
            }
            return response.json();
        })
        .then(data => {
            isUploading = false;
            uploadStatus.innerHTML = '<span style="color: #28a745;">✅ Datei erfolgreich hochgeladen und analysiert!</span>';
            
            // Anzeige der Analyseergebnisse
            if (data && data.analysis) {
                displayAnalysisResults(data.analysis);
            } else {
                analysisResults.innerHTML = '<p>⚠️ Keine detaillierten Analyseergebnisse verfügbar.</p>';
            }
            
            // Zurücksetzen des Dateiauswahl-Feldes
            fileInput.value = "";
            fileLabel.textContent = "Datei auswählen";
            uploadButton.disabled = true;
            
            // Chatbot-Nachricht über den erfolgreichen Upload
            addMessage("bot", `Ich habe die Stellenanzeige "${fileName}" analysiert! Du kannst mir jetzt Fragen dazu stellen.`);
        })
        .catch(error => {
            console.error("Upload-Fehler:", error);
            isUploading = false;
            uploadStatus.innerHTML = '<span style="color: #dc3545;">❌ Fehler beim Hochladen. Bitte versuche es erneut.</span>';
            analysisResults.innerHTML = '<p>⚠️ Keine Analyse-Ergebnisse verfügbar aufgrund eines Fehlers.</p>';
            uploadButton.disabled = false;
        });
    }

    function displayAnalysisResults(analysis) {
        // Hier kannst du die Analyseergebnisse formatieren und anzeigen
        // Diese Funktion nimmt die von der API zurückgegebenen Analysedaten an
        
        let resultsHTML = '<h3>Ergebnisse des Profilabgleichs</h3>';
        
        // Beispiel für die Anzeige eines Übereinstimmungswerts
        if (analysis.matchScore !== undefined) {
            const score = analysis.matchScore;
            const scoreColor = score > 80 ? '#28a745' : (score > 60 ? '#ffc107' : '#dc3545');
            
            resultsHTML += `
                <div class="match-score">
                    <h4>Übereinstimmung</h4>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${score}%; background-color: ${scoreColor};"></div>
                    </div>
                    <p style="color: ${scoreColor};">${score}%</p>
                </div>
            `;
        }
        
        // Fähigkeiten-Abgleich anzeigen (wenn vorhanden)
        if (analysis.skills && analysis.skills.length > 0) {
            resultsHTML += '<div class="skills-match"><h4>Fähigkeiten-Abgleich</h4><ul>';
            analysis.skills.forEach(skill => {
                resultsHTML += `<li>${skill.name}: ${skill.match}%</li>`;
            });
            resultsHTML += '</ul></div>';
        }
        
        // Empfehlungen oder Hinweise anzeigen
        if (analysis.recommendation) {
            resultsHTML += `<div class="recommendation"><h4>Empfehlung</h4><p>${analysis.recommendation}</p></div>`;
        }
        
        // Wenn keine detaillierten Daten verfügbar sind, Standardnachricht anzeigen
        if (!analysis.matchScore && (!analysis.skills || analysis.skills.length === 0)) {
            resultsHTML = '<p>✅ Stellenanzeige wurde analysiert. Stelle dem Chatbot Fragen zu den Ergebnissen!</p>';
        }
        
        analysisResults.innerHTML = resultsHTML;
        
        // Styles für die Ergebnisanzeige
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .match-score {
                text-align: center;
                margin-bottom: 20px;
            }
            .progress-bar {
                width: 100%;
                height: 20px;
                background-color: #e9ecef;
                border-radius: 10px;
                margin: 10px 0;
                overflow: hidden;
            }
            .progress {
                height: 100%;
                border-radius: 10px;
                transition: width 1s ease;
            }
            .skills-match {
                margin: 20px 0;
                text-align: left;
            }
            .skills-match ul {
                list-style-type: none;
                padding: 0;
            }
            .skills-match li {
                margin: 5px 0;
                padding: 5px;
                background-color: #f8f9fa;
                border-radius: 5px;
            }
            .recommendation {
                margin-top: 20px;
                padding: 10px;
                background-color: #e7f5ff;
                border-radius: 5px;
            }
        `;
        document.head.appendChild(styleElement);
    }

    // Modal-Funktionalität
    function showNotification(message) {
        modalMessage.textContent = message;
        modal.style.display = "block";
    }

    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    // Willkommensnachricht
    addMessage("bot", "Hallo! Ich bin der Bewerbungsbot und kann dir Fragen zu meinem Profil beantworten. Was möchtest du wissen?");
});