"""
FastAPI backend for ExamForge.
Endpoints:
  POST /api/generate    — Generate full exam paper + audit report
  POST /api/regenerate  — Regenerate a single rejected question
  POST /api/parse-pdf   — Extract text from uploaded PDF syllabus
"""
import os
import io

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from generator import generate_paper, regenerate_question, parse_voice_command
from schemas import GenerateRequest, GenerateResponse, RegenerateRequest, RegenerateResponse, VoiceCommandRequest

# ── App setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ExamForge API",
    description="AI-powered exam paper generator using Claude + LangChain",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "service": "ExamForge API"}


# ── Generate full paper ────────────────────────────────────────────────────────
@app.post("/api/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    if not req.syllabus.strip():
        raise HTTPException(status_code=400, detail="Syllabus cannot be empty.")
    if not req.levels:
        raise HTTPException(status_code=400, detail="At least one Bloom's level required.")
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured.")

    try:
        result = await generate_paper(req.syllabus, req.levels, req.backlog_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ── Regenerate single question ─────────────────────────────────────────────────
@app.post("/api/regenerate", response_model=RegenerateResponse)
async def regenerate(req: RegenerateRequest):
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured.")

    try:
        question = await regenerate_question(
            question_id=req.question_id,
            question_text=req.question_text,
            level=req.level,
            topic=req.topic,
            marks=req.marks,
            reason=req.reason,
            syllabus=req.syllabus,
        )
        return RegenerateResponse(question=question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")


# ── Parse Voice Command ────────────────────────────────────────────────────────
@app.post("/api/parse-voice-command")
async def parse_voice(req: VoiceCommandRequest):
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured.")

    try:
        result = await parse_voice_command(req.transcript)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice parse failed: {str(e)}")


# ── PDF text extraction ────────────────────────────────────────────────────────
@app.post("/api/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        import pdfplumber
        content = await file.read()
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = "\n".join(
                page.extract_text() or "" for page in pdf.pages
            ).strip()

        if not text:
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        return {"text": text}
    except ImportError:
        raise HTTPException(status_code=500, detail="pdfplumber not installed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parse failed: {str(e)}")
