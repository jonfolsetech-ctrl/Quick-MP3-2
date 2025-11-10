
import uuid
from typing import Dict, Any

class JobStore:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}

    def create(self, kind: str) -> str:
        jid = str(uuid.uuid4())
        self._jobs[jid] = {"id": jid, "kind": kind, "status": "running", "progress": 0}
        return jid

    def complete(self, job_id: str, result: Any):
        if job_id in self._jobs:
            self._jobs[job_id]["status"] = "completed"
            self._jobs[job_id]["progress"] = 100
            self._jobs[job_id]["result"] = result

    def get(self, job_id: str):
        return self._jobs.get(job_id, {"id": job_id, "status": "unknown"})
