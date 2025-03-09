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

  // n8n Webhook URLs (ggf. anpassen)
  const CHAT_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/b881a9b8-1221-4aa8-b4ed-8b483bb08b3a";
  const FILE_WEBHOOK_URL = "https://peerbro1.app.n8n.cloud/webhook/18a718fb-87cb-4a36-9d73-1a0b1fb8c23f";

  // Chat-Funktionalität
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage("user", message);
    userInput.value = "";
    userInput.disabled = true;
    sendButton.disabled = true;

    fetch(CHAT_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    })
      .then(response => response.json())
      .then(data => {
        addMessage("bot", data.output || "Keine Antwort erhalten.");
      })
      .catch(() => {
        addMessage("bot", "Fehler beim Abrufen der Antwort.");
      })
      .finally(() => {
        userInput.disabled = false;
        sendButton.disabled = false;
      });
  }

  function addMessage(sender, text) {
    const msgElement = document.createElement("div");
    msgElement.className = `message ${sender}`;
    msgElement.textContent = text;
    chatBox.appendChild(msgElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Datei-Upload
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      fileLabel.textContent = fileInput.files[0].name;
      uploadButton.disabled = false;
    }
  });

  uploadButton.addEventListener("click", uploadFile);

  function uploadFile() {
    const file = fileInput.files[0];
    if (!file || file.type !== "application/pdf") {
      uploadStatus.innerHTML = "Bitte eine PDF-Datei hochladen.";
      return;
    }

    uploadStatus.innerHTML = "⏳ Datei wird hochgeladen...";
    uploadButton.disabled = true;

    const formData = new FormData();
    formData.append("file", file);

    fetch(FILE_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        uploadStatus.innerHTML = "✅ Datei erfolgreich hochgeladen!";
        displayBubbleChart(data);
      })
      .catch(() => {
        uploadStatus.innerHTML = "❌ Fehler beim Hochladen.";
      });
  }

  // Funktion zur Darstellung der Bubble-Grafik
  function displayBubbleChart(parsedObj) {
    analysisResults.innerHTML = '<canvas id="bubbleChart"></canvas>';
    const canvas = document.getElementById("bubbleChart");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    const categories = [
      { key: "passende_qualifikationen", color: "green", label: "Qualifikationen" },
      { key: "zu_klaerende_punkte", color: "yellow", label: "Zu klären" },
      { key: "red_flags", color: "red", label: "Red Flags" }
    ];

    let bubbles = [];
    let xOffset = 50;
    let yOffset = canvas.height / 2;

    categories.forEach((category, index) => {
      let items = Array.isArray(parsedObj[category.key]) ? parsedObj[category.key] : [];
      items.forEach((text, i) => {
        let size = Math.max(50, 20 + text.length * 2);
        let x = xOffset + Math.random() * 100;
        let y = yOffset + (i * 50 - (items.length * 25));
        bubbles.push({ x, y, size, text, color: category.color });
      });
      xOffset += 200;
    });

    function drawBubbles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bubble.text, bubble.x, bubble.y);
      });
    }

    setInterval(drawBubbles, 50);
  }
});
