
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid

from .services.jobs import JobStore
from .services.lyrics import generate_lyrics_stub
from .services.compose import compose_stub
from .services.separate import separate_stub
from .services.reintegrate import reintegrate_stub
from .services.prompt import MASTER_PROMPT
from datetime import datetime, timezone

app = FastAPI(title="AI Music Studio API", version="0.1.0")

# CORS (dev-friendly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

jobs = JobStore()

class LyricsIn(BaseModel):
    genre: str = "pop"
    mood: str = "joyful"
    length: Dict[str, int] = {"verses": 2, "choruses": 1}
    prompt: Optional[str] = None

@app.post("/v1/lyrics.generate")
async def lyrics_generate(payload: LyricsIn):
    job_id = jobs.create("lyrics.generate")
    result = generate_lyrics_stub(payload.model_dump())
    jobs.complete(job_id, result)
    return {"job_id": job_id, "result": result}

class ComposeIn(BaseModel):
    key: str = "C major"
    tempo_bpm: int = 120
    style: str = "electronic-pop"
    duration_sec: int = 150
    instrumentation: list[str] = ["drums","bass","pads","lead"]

@app.post("/v1/compose.generate")
async def compose_generate(payload: ComposeIn):
    job_id = jobs.create("compose.generate")
    result = compose_stub(payload.model_dump())
    jobs.complete(job_id, result)
    return {"job_id": job_id, "result": result}

@app.post("/v1/separate.vocals")
async def separate_vocals(file: UploadFile = File(...)):
    job_id = jobs.create("separate.vocals")
    result = await separate_stub(file)
    jobs.complete(job_id, result)
    return {"job_id": job_id, "result": result}

@app.post("/v1/mix.reintegrate")
async def mix_reintegrate(
    instrumental: UploadFile = File(...),
    vocals: UploadFile = File(...),
    key: str = Form("C major"),
    tempo_bpm: int = Form(120),
    preset: str = Form("pop-clear"),
):
    job_id = jobs.create("mix.reintegrate")
    result = await reintegrate_stub(instrumental, vocals, key, tempo_bpm, preset)
    jobs.complete(job_id, result)
    return {"job_id": job_id, "result": result}

@app.get("/v1/jobs/{job_id}/status")
async def job_status(job_id: str):
    return jobs.get(job_id)

@app.get("/v1/projects/{project_id}")
async def get_project(project_id: str):
    # Minimal stub
    return {"id": project_id, "assets": [], "status": "ok"}

class FeedbackIn(BaseModel):
    project_id: Optional[str] = None
    target: str
    rating: int
    reason: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

@app.post("/v1/feedback")
async def feedback(payload: FeedbackIn):
    # Store or log feedback - stubbed
    return {"ok": True, "stored": payload.model_dump()}


@app.get("/v1/system.prompt")
async def system_prompt():
    return {"prompt": MASTER_PROMPT}

def _meta():
    return {
        "version": "1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "assumptions": [],
        "warnings": []
    }

@app.post("/v1/ai/lyrics")
async def ai_lyrics(payload: LyricsIn):
    base = generate_lyrics_stub(payload.model_dump())
    return {
        "meta": _meta(),
        "lyrics_result": {
            "title": base.get("title","Untitled"),
            "style": {"genre": payload.genre, "mood": payload.mood},
            "constraints": {
                "rhyme_scheme": "AABB",
                "syllables_per_line": [8,8,8,8],
                "keywords": (payload.prompt or "").split(", ")[:2] if payload.prompt else [],
                "tone": "direct"
            },
            "sections": base.get("sections", []),
            "notes": "stubbed output for development"
        }
    }

@app.post("/v1/ai/compose")
async def ai_compose(payload: ComposeIn):
    base = compose_stub(payload.model_dump())
    return {
        "meta": _meta(),
        "composition_result": {
            "music_spec": {
                "key": payload.key,
                "tempo_bpm": payload.tempo_bpm,
                "time_signature": "4/4",
                "style": payload.style,
                "duration_sec": payload.duration_sec
            },
            "arrangement": [
                {"section_id":"V1","bars":8,"chords":["C","G","Am","F"],"motifs":["plucky-synth"],"hook_density":"low"},
                {"section_id":"C1","bars":8,"chords":["F","G","Em","Am"],"motifs":["bright-lead"],"hook_density":"high"}
            ],
            "instruments":[
                {"name":"drums","role":"rhythm","preset":"pop-tight"},
                {"name":"bass","role":"low-end","preset":"sine-punch"},
                {"name":"pads","role":"harmony","preset":"warm-pad"},
                {"name":"lead","role":"melody","preset":"saw-bright"}
            ],
            "stems_plan":["drums","bass","chords","lead"],
            "midi_plan":{"export": True, "tracks":["lead","chords","bass","drums"]},
            "render_hints":{"swing_percent":0,"humanize_ms":12,"lufs_target":-14,"ceiling_db":-1}
        }
    }

@app.post("/v1/ai/separate")
async def ai_separate(file: UploadFile = File(...)):
    result = await separate_stub(file)
    return {
        "meta": _meta(),
        "separation_plan": {
            "input_asset": file.filename,
            "method": "mdxnet",
            "quality": "best",
            "preprocess": {"resample_hz": 44100, "normalize": True},
            "outputs": {
                "instrumental": "instrumental.wav",
                "vocals": "vocals.wav"
            },
            "postprocess": {"stereo_preserve": True, "deverb_light": True, "residual_gate": 0.1}
        }
    }

@app.post("/v1/ai/reintegrate")
async def ai_reintegrate(
    instrumental: UploadFile = File(...),
    vocals: UploadFile = File(...),
    key: str = Form("C major"),
    tempo_bpm: int = Form(120),
    preset: str = Form("pop-clear"),
):
    _ = await reintegrate_stub(instrumental, vocals, key, tempo_bpm, preset)
    return {
        "meta": _meta(),
        "reintegration_plan": {
            "instrumental": instrumental.filename,
            "vocals": vocals.filename,
            "target": {"key": key, "tempo_bpm": tempo_bpm},
            "alignment": {"method":"dtw","time_stretch":"elastique","pitch_shift_semitones":0,"formant_preserve": True},
            "vocal_bus": {
                "preset": preset,
                "chain":[
                    {"fx":"de-esser","params":{"freq_hz":5500,"amount_db":4}},
                    {"fx":"eq","params":{"hpf_hz":100}},
                    {"fx":"compressor","params":{"ratio":2.5,"gr_db":3}}
                ]
            },
            "master_bus":{"limiter_ceiling_db":-1.0,"lufs_target":-14},
            "stems_export":["vocal_bus.wav","mix.wav"]
        }
    }
