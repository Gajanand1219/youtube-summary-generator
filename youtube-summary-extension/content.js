function injectButton() {
  const existing = document.getElementById("showSummaryBtn");
  if (existing) return;

  // Track last video URL to detect changes
  let lastVideoUrl = null;

  // Create summary container (initially hidden)
  const container = document.createElement("div");
  container.id = "summaryContainer";
  Object.assign(container.style, {
    position: "fixed",
    top: "100px",
    right: "20px",
    zIndex: 9998,
    width: "450px", // wider box
    maxHeight: "588px", // limit height
    overflowY: "auto", // enable vertical scroll
    padding: "16px",
    background: "#ffffff",
    border: "2px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    display: "none"
  });

  const audioPlayer = document.createElement("audio");
  audioPlayer.id = "audioPlayer";
  audioPlayer.controls = true;
  audioPlayer.style.marginTop = "15px";
  container.appendChild(audioPlayer);

  document.body.appendChild(container);

  // Create the floating summary button
  const button = document.createElement("button");
  button.id = "showSummaryBtn";
  button.textContent = "Show Summary";
  Object.assign(button.style, {
    position: "fixed",
    top: "50px",
    right: "20px",
    zIndex: 9999,
    padding: "10px",
    backgroundColor: "blue",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  });

  document.body.appendChild(button);

  let summaryLoaded = false;
  let visible = false;

  button.onclick = async () => {
    const currentUrl = window.location.href;

    if (!currentUrl.includes("youtube.com/watch")) {
      alert("❌ This is not a YouTube video page.");
      return;
    }

    // If video has changed, reset everything
    if (lastVideoUrl !== currentUrl) {
      lastVideoUrl = currentUrl;
      summaryLoaded = false;
      visible = false;
      container.style.display = "none";
      container.innerHTML = `<audio id="audioPlayer" controls style="margin-top:15px;"></audio>`;
    }

    if (summaryLoaded) {
      visible = !visible;
      container.style.display = visible ? "block" : "none";
      button.textContent = visible ? "Hide Summary" : "Show Summary";
      return;
    }

    button.textContent = "⏳ Generating summary...";

    try {
      const res = await fetch("http://localhost:8000/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: currentUrl })
      });

      if (!res.ok) throw new Error("Summary fetch failed.");
      const data = await res.json();

      // Insert summary text
      container.innerHTML = `<strong>📝 Summary:</strong><br>${data.summary}`;

      // Append audio player back
      container.appendChild(audioPlayer);
      container.style.display = "block";
      visible = true;
      summaryLoaded = true;
      button.textContent = "Hide Summary";

      // Fetch TTS audio
      const speakRes = await fetch("http://localhost:8000/api/speak-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.summary,
          language: data.language
        })
      });

      if (!speakRes.ok) throw new Error("TTS fetch failed.");
      const audioBlob = await speakRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayer.src = audioUrl;
      audioPlayer.play();

    } catch (err) {
      console.error(err);
      alert("❌ Error: " + err.message);
      button.textContent = "Show Summary";
    }
  };

  // Auto-clear summary if user navigates to a new video
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastVideoUrl && currentUrl.includes("youtube.com/watch")) {
      // Reset UI state
      summaryLoaded = false;
      visible = false;
      lastVideoUrl = currentUrl;
      container.style.display = "none";
      container.innerHTML = `<audio id="audioPlayer" controls style="margin-top:15px;"></audio>`;
      button.textContent = "Show Summary";
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

setTimeout(injectButton, 3000);
