from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import re
import traceback
from io import BytesIO

from openai import AzureOpenAI
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable
)

# Load environment variables
load_dotenv()

# OpenAI Summarization
AZURE_API_KEY = os.getenv("AZURE_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")
AZURE_API_VERSION = os.getenv("AZURE_API_VERSION")

# Azure TTS
AZURE_TTS_API_KEY = os.getenv("AZURE_TTS_API_KEY")
AZURE_TTS_API_BASE = os.getenv("AZURE_TTS_API_BASE")
AZURE_TTS_API_VERSION = os.getenv("AZURE_TTS_API_VERSION")
AZURE_TTS_DEPLOYMENT = os.getenv("AZURE_TTS_DEPLOYMENT")

# Initialize Azure OpenAI Client
client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    api_version=AZURE_API_VERSION,
    azure_endpoint=AZURE_ENDPOINT
)

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace * with your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class SummaryRequest(BaseModel):
    youtube_url: str

class SpeakRequest(BaseModel):
    text: str
    language: str

# Extract YouTube video ID
def extract_video_id(url: str):
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
    return match.group(1) if match else None

# Get transcript and language
def extract_transcript_and_language(video_url: str):
    try:
        video_id = extract_video_id(video_url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

        preferred_languages = ['mr', 'hi', 'en']
        transcript = None
        language_used = None

        for lang in preferred_languages:
            try:
                transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
                language_used = lang
                break
            except Exception:
                continue

        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found.")

        full_text = " ".join([seg["text"] for seg in transcript])
        return full_text.strip()[:12000], language_used

    except TranscriptsDisabled:
        raise HTTPException(status_code=403, detail="Transcripts are disabled for this video.")
    except VideoUnavailable:
        raise HTTPException(status_code=410, detail="Video is unavailable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcript error: {str(e)}")

# Generate summary
def generate_summary(transcript_text: str, language: str):
    try:
        prompt_map = {
            'en': "You are an expert at summarizing YouTube video transcripts in English. Use bullet points. Keep summary under 300 words.",
            'hi': "आप एक विशेषज्ञ हैं जो YouTube वीडियो के ट्रांसक्रिप्ट को हिंदी में संक्षेप में बताते हैं। बुलेट पॉइंट्स का उपयोग करें। 300 शब्दों में सीमित रखें।",
            'mr': "तुम्ही YouTube व्हिडिओ ट्रान्सक्रिप्टचे मराठीत संक्षेप करून सांगणारे तज्ज्ञ आहात. बुलेट पॉइंट्स वापरा. 300 शब्दांच्या मर्यादेत ठेवा."
        }
        system_prompt = prompt_map.get(language, prompt_map['en'])

        response = client.chat.completions.create(
            model=AZURE_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript_text}
            ],
            temperature=0.5,
            max_tokens=800,
            top_p=0.9
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI API Error: {str(e)}")

# Endpoint: summarize video
@app.post("/api/summarize")
async def summarize_video(request: SummaryRequest):
    try:
        transcript, language_used = extract_transcript_and_language(request.youtube_url)
        summary = generate_summary(transcript, language_used)
        video_id = extract_video_id(request.youtube_url)

        return {
            "video_id": video_id,
            "language": language_used,
            "transcript_excerpt": transcript[:300] + "...",
            "summary": summary
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {str(e)}\n{traceback.format_exc()}")

# Endpoint: generate and return speech MP3
@app.post("/api/speak-line")
async def speak_line(req: SpeakRequest):
    try:
        tts_client = AzureOpenAI(
            api_key=AZURE_TTS_API_KEY,
            api_version=AZURE_TTS_API_VERSION,
            azure_endpoint=AZURE_TTS_API_BASE,
            azure_deployment=AZURE_TTS_DEPLOYMENT
        )

        # Only these voices are allowed: nova, shimmer, echo, onyx, fable, alloy
        voice_map = {
            "en": "nova",
            "hi": "shimmer",  # fallback for Hindi
            "mr": "echo"      # fallback for Marathi
        }
        voice = voice_map.get(req.language, "nova")

        response = tts_client.audio.speech.create(
            model=AZURE_TTS_DEPLOYMENT,
            voice=voice,
            input=req.text
        )

        buffer = BytesIO(response.content)
        return StreamingResponse(buffer, media_type="audio/mpeg")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
