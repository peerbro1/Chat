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
  uploadStatus.innerHTML = '<span style="color: var(--primary-color);">⏳ Datei wird hochgeladen und analysiert...</span>';
  analysisResults.innerHTML = '<p>⏳ Analyse wird durchgeführt...</p>';

  const formData = new FormData();
  formData.append("file", file);

  fetch(FILE_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
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
          uploadStatus.innerHTML = '<span style="color: var(--success-color);">✅ Datei erfolgreich hochgeladen und analysiert!</span>';
          console.log("Upload-Response von n8n:", data);

          // Verarbeite die Antwort von n8n
          if (data && typeof data === 'object') {
              // Variante 1: Der Output ist direkt im Hauptobjekt
              if (data.output) {
                  try {
                      const parsedObj = typeof data.output === 'string' ? JSON.parse(data.output) : data.output;
                      displayAnalysisResults(parsedObj);
                      return;
                  } catch (err) {
                      console.error("Fehler beim JSON-Parse (Variante 1):", err, data.output);
                  }
              }

              // Variante 2: Es ist ein Array mit dem Output im ersten Element
              if (Array.isArray(data) && data.length > 0 && data[0].output) {
                  try {
                      const parsedObj = typeof data[0].output === 'string' ? JSON.parse(data[0].output) : data[0].output;
                      displayAnalysisResults(parsedObj);
                      return;
                  } catch (err) {
                      console.error("Fehler beim JSON-Parse (Variante 2):", err, data[0].output);
                  }
              }

              // Variante 3: Die Daten sind direkt als Objekt mit den erwarteten Feldern vorhanden
              if (data.passende_qualifikationen || data.zu_klaerende_punkte || data.red_flags) {
                  displayAnalysisResults(data);
                  return;
              }

              // Variante 4: Der Output ist direkt das Array
              if (Array.isArray(data)) {
                  const outputData = data[0];
                  if (outputData) {
                      if (typeof outputData === 'string') {
                          try {
                              const parsedObj = JSON.parse(outputData);
                              displayAnalysisResults(parsedObj);
                              return;
                          } catch (err) {
                              console.error("Fehler beim JSON-Parse (Variante 4):", err, outputData);
                          }
                      } else if (typeof outputData === 'object') {
                          displayAnalysisResults(outputData);
                          return;
                      }
                  }
              }
          }

          // Fallback, wenn keine der Varianten funktioniert hat
          analysisResults.innerHTML = `
              <p>⚠️ Erhaltene Daten konnten nicht korrekt verarbeitet werden. Debugging-Info:</p>
              <pre style="text-align: left; overflow: auto; max-height: 200px; padding: 10px; background: #f5f5f5; border: 1px solid #ddd; margin-top: 10px; font-size: 12px;">
                  ${JSON.stringify(data, null, 2)}
              </pre>
          `;

          // Zurücksetzen
          fileInput.value = "";
          fileLabel.textContent = "Datei auswählen";
          uploadButton.disabled = true;
      })
      .catch(error => {
          console.error("Upload-Fehler:", error);
          isUploading = false;
          uploadStatus.innerHTML = '<span style="color: var(--error-color);">❌ Fehler beim Hochladen. Bitte versuche es erneut.</span>';
          analysisResults.innerHTML = '<p>⚠️ Keine Analyse-Ergebnisse verfügbar aufgrund eines Fehlers.</p>';
          uploadButton.disabled = false;
      });
}

function displayAnalysisResults(parsedObj) {
  console.log("Verarbeite Analyseergebnisse:", parsedObj);

  // Stelle sicher, dass die Arrays existieren oder verwende leere Arrays
  const arrPassend = Array.isArray(parsedObj.passende_qualifikationen) ? parsedObj.passende_qualifikationen : [];
  const arrKlaeren = Array.isArray(parsedObj.zu_klaerende_punkte) ? parsedObj.zu_klaerende_punkte : [];
  const arrFlags = Array.isArray(parsedObj.red_flags) ? parsedObj.red_flags : [];

  if (arrPassend.length === 0 && arrKlaeren.length === 0 && arrFlags.length === 0) {
      analysisResults.innerHTML = '<p>Keine detaillierten Analyseergebnisse verfügbar.</p>';
      return;
  }

  let tableHTML = `
      <h3>Ergebnisse des Profilabgleichs</h3>
      <table class="analysis-table">
          <thead>
              <tr>
                  <th>Passende Qualifikationen</th>
                  <th>Zu klärende Punkte</th>
                  <th>Red Flags</th>
              </tr>
          </thead>
          <tbody>
  `;

  const maxRows = Math.max(arrPassend.length, arrKlaeren.length, arrFlags.length);
  for (let i = 0; i < maxRows; i++) {
      const col1 = arrPassend[i] || "";
      const col2 = arrKlaeren[i] || "";
      const col3 = arrFlags[i] || "";
      tableHTML += `
          <tr>
              <td>${col1}</td>
              <td>${col2}</td>
              <td>${col3}</td>
          </tr>
      `;
  }

  tableHTML += `
          </tbody>
      </table>
  `;

  analysisResults.innerHTML = tableHTML;

  // Styles für Tabelle nur einmal anhängen
  if (!document.getElementById('analysis-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'analysis-styles';
      styleElement.textContent = `
          .analysis-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          .analysis-table th,
          .analysis-table td {
              border: 1px solid #ccc;
              padding: 10px;
              vertical-align: top;
          }
          .analysis-table th {
              background-color: var(--primary-color);
              color: #fff;
          }
      `;
      document.head.appendChild(styleElement);
  }
}