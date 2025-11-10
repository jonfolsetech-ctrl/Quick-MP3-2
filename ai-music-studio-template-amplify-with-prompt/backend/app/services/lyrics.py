
from typing import Dict, Any

def generate_lyrics_stub(params: Dict[str, Any]) -> Dict[str, Any]:
    genre = params.get("genre", "pop")
    mood = params.get("mood", "joyful")
    length = params.get("length", {"verses": 2, "choruses": 1})
    prompt = params.get("prompt", "summer love, joy and nostalgia")

    verses = length.get("verses", 2)
    choruses = length.get("choruses", 1)

    sections = []
    for v in range(verses):
        sections.append({"type": "verse", "lines": [
            f"In this {mood} {genre} groove we found our way,",
            "Sunset colors write our names across the bay,",
            "Hand in hand we chased the echoes of July,",
            "Every laugh a spark that lit the sky."
        ]})
    for c in range(choruses):
        sections.append({"type": "chorus", "lines":[
            "Back to July where the daylight never ended,",
            "Hearts on the tide, every heartbeat blended,",
            "Sing it out loud, let the boardwalk carry us,",
            "Summer love forever, sweet and thunderous."
        ]})

    return {
        "title": "Back to July (Stub)",
        "metadata": {"genre": genre, "mood": mood, "prompt": prompt},
        "sections": sections
    }
