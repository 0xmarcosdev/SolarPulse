# AGENTS.md - SolarPulse Quick Reference

## 🚨 Golden Rules (Non-Negotiable)

1. **Read first:** `ROADMAP.md`, `DEVLOG.md`, this file before any task
2. **Use Skills:** Match task → load relevant skill (see table below)
3. **Context7 first:** Never guess library APIs (FastAPI, Next.js, pvlib, etc.)
4. **After task:** Update `DEVLOG.md`, tick `[x]` in `ROADMAP.md`, brief user

## ⚙️ Stack (Verified)

| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, SQLAlchemy, `pvlib`, `pandas`, `openmeteo-requests`, `paho-mqtt` |
| Frontend | Next.js 16 (App Router), React 19, TypeScript `strict: true`, Tailwind v4, Recharts |
| DB | SQLite (`backend/solarpulse.db`) |
| Pkg mgr | **`uv` only for Python** (no `pip`/`venv`), `npm` for Node |

## 🌞 Critical Solar Business Logic

- **Location:** Lat `22.407676`, Lon `-79.977352`, TZ `America/Havana` (not UTC)
- **Panel:** 550W, tilt 45°, azimuth 180° (South)
- **Clipping (MANDATORY):** EcoFlow Delta 3 Classic limits input to **500W**  
  `clipped_power = min(raw_dc_power, 500.0)`
- **Losses:** Apply **0.85 factor** (15% loss) after clipping
- **Constants in code:** `ECOFLOW_MAX_INPUT_WATTS = 500.0`, `SYSTEM_LOSS_FACTOR = 0.85`

## 🛠️ Skills → When to Load

| Task | Skill |
|------|-------|
| React/Next.js components, perf | `vercel-react-best-practices` |
| UI design, Tailwind, non-generic look | `web-design-guidelines` |
| Unit/component tests | `test-patterns` |
| E2E browser tests | `webapp-testing` + Playwright MCP |
| Release/version/changelog | `git-release` + `changelog-generate` |
| Dependency audit | `dependency-audit` |
| CI/CD config | `ci-pipeline` |
| Any library API question | **Context7** (mandatory) |

## 💻 Dev Commands

### Backend (from `backend/`)
```bash
# First time only
uv venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
python init_db.py

# Dev server (port 8000)
uvicorn main:app --reload

# Tests
pytest tests/ -v
```

### Frontend (from `frontend/`)
```bash
npm install
npm run dev       # Port 3000
npm run build
npm run lint
```

## 📁 Key Structure

```
backend/
  main.py           # FastAPI + CORS for localhost:3000
  database.py       # SQLAlchemy engine (check_same_thread=False)
  models.py         # WeatherForecast, GenerationForecast, EcoFlowReading
  schemas.py        # Pydantic request/response models
  config.py         # Settings via pydantic-settings (.env in backend/)
  init_db.py        # Creates tables
  services/
    solar.py        # apply_clipping, apply_losses, calculate_final_ac_power
    pvlib_service.py # POA, solar position, DC power, forecast series
  tests/
    test_solar.py   # 12 tests for clipping/losses pipeline
    test_pvlib.py   # 11 tests for pvlib service

frontend/
  src/app/
    page.tsx        # Dashboard entry
    layout.tsx      # Root layout
    globals.css     # Tailwind v4 imports
  src/components/
    StatusCard.tsx  # Reusable status card
  .env.local        # NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ⚠️ Gotchas (Easy to Miss)

- CORS locked to `http://localhost:3000` only
- SQLite needs `check_same_thread=False` in engine
- Timezone **must** be `America/Havana` for Open-Meteo (not UTC)
- Python: **only `uv`**, never raw `pip`
- 500W clipping + 0.85 loss factor = required in ALL power calcs
- Never invent `pvlib`/Open-Meteo/EcoFlow params → Context7 or real docs
- `venv/` in backend is created by `uv venv` — do not commit
- Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`
- Backend env: `.env` in `backend/` (copied from `.env.example`)

## 📝 Workflow

1. Read `ROADMAP.md` → current task
2. Load Skill + MCP if applicable
3. Implement (small, verifiable changes)
4. UI changes → verify with Playwright
5. Update `DEVLOG.md` (date, task, files, errors, fix)
6. Mark `[x]` in `ROADMAP.md`
7. Brief user