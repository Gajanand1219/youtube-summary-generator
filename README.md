# 🎬 YouTube Summary Generator



https://github.com/user-attachments/assets/8e4a2135-459e-4378-a96d-1982c2aa1b3a


A full-stack project that summarizes YouTube videos using AI (OpenAI or other LLMs).  
It includes:

- ⚙️ Python backend (API for summarization)
- 🌐 React frontend (UI to input YouTube links and view summaries)
- 🧩 Chrome extension (adds a "Summarize" button directly on YouTube)

---



## 🧠 How It Works

1. User pastes a YouTube video link in the **React app** or clicks the **Chrome extension**
2. Video ID or transcript is extracted
3. Sent to the **Python backend**
4. The backend uses an LLM (like OpenAI) to summarize it
5. The **summary** is returned and displayed

---

## ⚙️ Backend Setup (Python API)

### ✅ Requirements

- Python 3.8+
- `pip`
- OpenAI API key (or your own LLM model endpoint)

### 📦 Installation

```bash
cd backend
pip install -r requirements.txt


## 📁 Project Structure


---


youtube-summary-generator/
├── backend/ # Python backend API
│ ├── main.py
│ ├── .env
│ └── requirements.txt
│
├── my-app/ # React frontend
│ ├── src/
│ ├── public/
│ ├── .env (optional)
│ └── package.json
│
├── youtube-summary-extension/ # Chrome Extension
│ ├── manifest.json
│ ├── content.js
│ ├── popup.html
│ ├── popup.js
│ └── styles.css
│
└── README.md # Main documentation
