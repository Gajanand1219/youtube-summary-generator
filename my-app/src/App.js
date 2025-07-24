import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [videoId, setVideoId] = useState('');
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

const speakSummary = async (text, lang) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    try {
      const res = await fetch('http://localhost:8000/api/speak-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: line, language: lang })
      });

      if (!res.ok) {
        console.error("TTS failed for line:", line);
        continue;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      await new Promise((resolve) => {
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play();
      });

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error playing line:", line, err);
    }
  }
};



  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vid = extractVideoId(url);
    if (!vid) {
      setError('❌ Please enter a valid YouTube URL.');
      return;
    }

    setLoading(true);
    setError('');
    setThumbnail(`https://img.youtube.com/vi/${vid}/0.jpg`);
    setVideoId(vid);
    setSummary('');
    setLanguage('');

    try {
      const response = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong.');
      }

      const data = await response.json();
      setSummary(data.summary);
      setLanguage(data.language);  // ✅ Save backend language
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="glass-container">
        <h1>🎬 YouTube AI Summarizer</h1>
        <p>Paste a YouTube link and get a smart summary in seconds 🚀</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="📎 Paste YouTube video URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Summarizing...' : '✨ Generate Summary'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {thumbnail && (
          <div className="video-box">
            <img src={thumbnail} alt="Thumbnail" className="thumbnail" />
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="yt-link"
            >
              ▶️ Watch on YouTube
            </a>
          </div>
        )}

        {summary && (
          <div className="summary-box">
            <h2>📝 Summary ({language.toUpperCase()})</h2>
            {summary.split('\n').map((line, i) => (
              <p key={i}>• {line}</p>
            ))}

            {!speaking ? (
              <button onClick={() => speakSummary(summary, language)}>
  🔊 Start Speaking
</button>

            ) : (
              <button
                className="submit-button"
                style={{ marginTop: "10px" }}
                onClick={stopSpeaking}
              >
                🛑 Stop Speaking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;



