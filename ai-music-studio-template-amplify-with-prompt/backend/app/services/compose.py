
from typing import Dict, Any
import uuid

def compose_stub(params: Dict[str, Any]) -> Dict[str, Any]:
    # This is a placeholder that returns pretend asset URLs and metadata.
    project_id = f"prj_{uuid.uuid4().hex[:8]}"
    key = params.get("key", "C major")
    tempo = params.get("tempo_bpm", 120)
    style = params.get("style", "electronic-pop")

    return {
        "project_id": project_id,
        "audio": {"mix_url": f"s3://mock/{project_id}/mix.wav"},
        "stems": {
            "drums": f"s3://mock/{project_id}/stems/drums.wav",
            "bass": f"s3://mock/{project_id}/stems/bass.wav",
            "chords": f"s3://mock/{project_id}/stems/chords.wav",
            "lead": f"s3://mock/{project_id}/stems/lead.wav"
        },
        "metadata": {"key": key, "tempo_bpm": tempo, "style": style}
    }
