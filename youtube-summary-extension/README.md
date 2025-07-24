# 🧩 YouTube Summary Generator – Chrome Extension

This Chrome extension adds a **"Summarize" button** to YouTube videos.  
When clicked, it fetches the transcript or video ID, sends it to your AI-powered backend, and displays a summary in a popup.

---

## 🚀 How to Use the Extension
https://youtu.be/gtF2nHVjqFk?si=qMS_hs7wJJ1ShJMb

### Step 1: Load Locally in Chrome

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked**
5. Select the `youtube-summary-extension/` folder

---

## 🧪 How It Works

- `content.js` injects a "Summarize" button into YouTube pages
- On click, it:
  - Extracts video ID or transcript
  - Sends data to your backend API (e.g., Flask or FastAPI)
  - Receives the AI-generated summary
  - Displays it in a simple popup (`popup.html`)

---

## 🔧 Backend API Requirement

This extension expects an API endpoint that accepts a video ID or transcript and returns a summary.

Example expected API:




---

### 📌 Option 2: Add to Main `README.md` as a Section

https://youtu.be/gtF2nHVjqFk?si=qMS_hs7wJJ1ShJMb

If you want to include this in your **main `README.md`**, you can simply add this under a section like:

<img width="1919" height="829" alt="image" src="https://github.com/user-attachments/assets/7361f19c-c7fd-4308-a506-37e958edad9f" />
<img width="1892" height="964" alt="Screenshot 2025-07-24 161710" src="https://github.com/user-attachments/assets/8f68c674-590c-4353-8438-02f6824bd84b" />
<img width="1919" height="882" alt="Screenshot 2025-07-24 161553" src="https://github.com/user-attachments/assets/9e6d34d7-360a-426e-b487-6e1b7f61eb66" />

```markdown
---
## 📁 Folder Structure
youtube-summary-extension/
├── content.js # Injected script on YouTube pages
├── icon.png # Extension icon
├── manifest.json # Chrome extension config
├── popup.html # UI shown when extension icon is clicked
├── popup.js # Logic for summary popup
├── styles.css # Popup styling
└── README.md # This file

## 🧩 Chrome Extension

> The `youtube-summary-extension/` folder contains a Chrome extension that integrates directly with YouTube to display AI-generated summaries.

### 🔧 How to Install & Use

1. Go to `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the `youtube-summary-extension` folder

The extension will:
- Add a **Summarize** button on YouTube
- Send video data to your backend
- Show the AI-generated summary in a popup
Make sure the backend is running locally on `http://localhost:5000` or update the URL in `popup.js`.


