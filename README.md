# ☀️ SolarPulse MVP

Dashboard local de predicción y monitoreo solar para microgeneración con EcoFlow.

## 🚀 Quick Start

### Backend (Python + uv)
```bash
cd backend
# Crear entorno e instalar dependencias (ultra rápido con uv)
uv venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
# Inicializar base de datos
python init_db.py
# Correr servidor
uvicorn main:app --reload

### Frontend (Next.js + npm)
```bash
cd frontend
npm install
npm run dev
```
## 📋 Requisitos
- Python 3.11+
- Node.js 18+
- uv (para Python)
- npm (para Next.js)

### 🏗️Estructura de Carpetas
- docs/: Especificaciones SDD y Constitución.
- backend/: API FastAPI, motor PVLib, base de datos SQLite.
- frontend/: Dashboard Next.js + Recharts.

### ⚠️ Reglas para IA (Agents)
Cualquier agente que modifique este código DEBE leer AGENTS.md y actualizar ROADMAP.md y DEVLOG.md tras cada tarea.
