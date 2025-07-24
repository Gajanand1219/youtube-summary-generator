document.getElementById("summarizeBtn").addEventListener("click", async () => {
  const url = document.getElementById("url").value.trim();
  const summaryBox = document.getElementById("summaryBox");
  const audioPlayer = document.getElementById("audioPlayer");
  const statusBox = document.getElementById("statusBox");

  if (!url) {
    statusBox.textContent = "❗ Please enter a YouTube URL.";
    return;
  }

  summaryBox.innerHTML = "";
  audioPlayer.src = "";
  statusBox.textContent = "🔄 Summarizing...";

  try {
    const res = await fetch("http://localhost:8000/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: url })
    });

    if (!res.ok) throw new Error("Summarization failed");

    const data = await res.json();

    // Only show the video title (no ID or duration)
    const metaHTML = `
    
    `;

    summaryBox.innerHTML = metaHTML + `<div>${data.summary}</div>`;
    statusBox.textContent = "✅ Summary generated. Playing audio...";

    // Fetch audio
    const speakRes = await fetch("http://localhost:8000/api/speak-line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: data.summary,
        language: data.language
      })
    });

    if (!speakRes.ok) throw new Error("TTS failed");

    const audioBlob = await speakRes.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayer.src = audioUrl;
    audioPlayer.play();
  } catch (error) {
    statusBox.textContent = `❌ Error: ${error.message}`;
  }
});
