[README.md](https://github.com/user-attachments/files/23464850/README.md)

# AI Music Studio – Starter Template (Next.js + FastAPI)

This template gives you a **ready-to-hack** project that:
- Generates lyrics (stubbed)
- Composes instrumental tracks (stubbed)
- Strips vocals (stubbed)
- Reintegrates vocals (stubbed)
- Exports audio and supports a simple feedback loop

**Stack**
- Frontend: Next.js (App Router) + Tailwind, simple multitab UI
- Backend: FastAPI with endpoints and in-memory "job" queue
- Storage: S3-compatible stub (local temp) – swap for MinIO/S3 later

## Quick Start

### 1) Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend
```bash
cd ../frontend
npm i
cp ../.env.example .env.local
npm run dev
```

Open http://localhost:3000

## Endpoints
- POST `/v1/lyrics.generate`
- POST `/v1/compose.generate`
- POST `/v1/separate.vocals`
- POST `/v1/mix.reintegrate`
- GET  `/v1/jobs/{id}/status`
- GET  `/v1/projects/{id}`
- POST `/v1/feedback`

All endpoints are **stubbed** for fast iteration; wire actual ML/DSP later.

## Notes
- Replace the stubs in `backend/app/services/` with real model calls.
- Use proper object storage (MinIO/S3) in production.
- The UI is intentionally minimal. Extend `app/(studio)/page.tsx` and components.


---

## GitHub Deployment

### Frontend → GitHub Pages
This repo includes a workflow: **.github/workflows/frontend-pages.yml**.
1. In your GitHub repo settings, set **Pages** to "GitHub Actions".
2. Add **Repository Variables**:
   - `NEXT_PUBLIC_API_BASE` – URL of your backend (e.g., `https://your-backend.onrender.com`)
   - `NEXT_PUBLIC_BASE_PATH` – optional (e.g., `/your-repo-name` if deploying to a project page)
3. Commit to `main`. The workflow builds a static export (`next export`) and deploys to Pages.

### Backend → GHCR (Container Image)
The workflow **.github/workflows/backend-docker.yml** builds a Docker image and pushes to GHCR:
- Image name: `ghcr.io/<owner>/<repo>-backend:latest`
- Run it anywhere Docker runs: `docker run -p 8000:8000 ghcr.io/<owner>/<repo>-backend:latest`

#### One-click hosting ideas
- **Render.com / Railway.app / Fly.io**: Use the Docker image or `Procfile` (`web: uvicorn app.main:app ...`).
- Ensure CORS allows your Pages origin (already permissive for development).

### Local testing (without Actions)
- Frontend: `npm run export` → static site in `frontend/out`
- Serve `frontend/out` with any static server (e.g., `npx serve frontend/out`)

### Notes
- The frontend uses `NEXT_PUBLIC_API_BASE` to reach the backend (no server-side rendering).
- For project pages (`https://<user>.github.io/<repo>`), set `NEXT_PUBLIC_BASE_PATH=/REPO_NAME` so routes and assets resolve.


---

## AWS Amplify Hosting (Monorepo)

This repo includes **amplify.yml** configured to deploy the **frontend** from `frontend/` via static export.

**Steps**
1. Push this repo to GitHub.
2. In **AWS Amplify Console** → **New app** → **Host web app** → Connect to your GitHub repo.
3. When prompted for the app root, choose **Monorepo** and set `frontend` as the app root (Amplify will detect `amplify.yml`).
4. Set **Environment variables** (Amplify Console → Build settings):
   - `NEXT_PUBLIC_API_BASE` → your backend URL (e.g., `https://<apprunner-or-render-backend>/`)
   - `NEXT_PUBLIC_BASE_PATH` → leave empty for root domains; set to `/your-subpath` if you deploy under a subpath.
5. Save and deploy. Amplify will run `npm run export` and publish `frontend/out`.

**Rewrites/Redirects**
- This is a static export with pre-rendered routes and `trailingSlash: true`. No custom rewrites are required for basic usage.
- If you add client-side routes later, configure rewrites in the Amplify Console accordingly.

**Backend Options**
- Use the provided GHCR Docker workflow to build `ghcr.io/<owner>/<repo>-backend:latest` and run it on **AWS App Runner** or **ECS Fargate**.
- Keep CORS open to your Amplify domain or set specific origins.


---

## Schema Endpoints (for Amplify UI)
- `GET /v1/system.prompt` → returns the master system prompt.
- `POST /v1/ai/lyrics` → returns `{ meta, lyrics_result }`.
- `POST /v1/ai/compose` → returns `{ meta, composition_result }`.
- `POST /v1/ai/separate` → returns `{ meta, separation_plan }`.
- `POST /v1/ai/reintegrate` → returns `{ meta, reintegration_plan }`.

Toggle "Schema JSON Mode" in the UI header to visualize these payloads.
