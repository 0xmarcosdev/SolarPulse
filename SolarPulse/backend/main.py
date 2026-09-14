from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import EcoFlowReading, GenerationForecast, WeatherForecast, SystemConfig
from services.openmeteo_service import process_and_get_forecasts
from schemas import (
    EcoFlowReadingCreate,
    EcoFlowReadingResponse,
    GenerationForecastCreate,
    GenerationForecastResponse,
    HealthResponse,
    StatusResponse,
    WeatherForecastCreate,
    WeatherForecastResponse,
    SystemConfigResponse,
    SystemConfigUpdate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = Session(bind=engine)
    try:
        if not db.query(SystemConfig).first():
            db.add(SystemConfig())
            db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title="SolarPulse API",
    description="Local-first solar generation forecasting and EcoFlow monitoring",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=StatusResponse)
def root() -> StatusResponse:
    return StatusResponse(status="ok", message="SolarPulse API is running")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="healthy")


@app.post("/api/weather", response_model=WeatherForecastResponse, status_code=201)
def create_weather_forecast(payload: WeatherForecastCreate, db: Session = Depends(get_db)) -> WeatherForecast:
    obj = WeatherForecast(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/weather", response_model=list[WeatherForecastResponse])
def list_weather_forecasts(db: Session = Depends(get_db)) -> list[WeatherForecast]:
    return db.query(WeatherForecast).order_by(WeatherForecast.forecast_time).all()


@app.post("/api/generation", response_model=GenerationForecastResponse, status_code=201)
def create_generation_forecast(payload: GenerationForecastCreate, db: Session = Depends(get_db)) -> GenerationForecast:
    obj = GenerationForecast(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/generation", response_model=list[GenerationForecastResponse])
def list_generation_forecasts(db: Session = Depends(get_db)) -> list[GenerationForecast]:
    return db.query(GenerationForecast).order_by(GenerationForecast.forecast_time).all()


@app.post("/api/ecoflow", response_model=EcoFlowReadingResponse, status_code=201)
def create_ecoflow_reading(payload: EcoFlowReadingCreate, db: Session = Depends(get_db)) -> EcoFlowReading:
    obj = EcoFlowReading(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/ecoflow", response_model=list[EcoFlowReadingResponse])
def list_ecoflow_readings(limit: int = 100, db: Session = Depends(get_db)) -> list[EcoFlowReading]:
    return db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.desc()).limit(limit).all()


from datetime import datetime

@app.get("/api/current-status")
def get_current_status(db: Session = Depends(get_db)) -> dict:
    latest_reading = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.desc()).first()
    latest_generation = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.desc()).first()
    
    def to_dict(obj):
        if obj is None:
            return None
        d = {}
        for c in obj.__table__.columns:
            val = getattr(obj, c.name)
            if isinstance(val, datetime):
                val = val.isoformat()
            d[c.name] = val
        return d
    
    return {
        "ecoflow": to_dict(latest_reading),
        "generation_forecast": to_dict(latest_generation),
    }


@app.get("/api/v1/system-config", response_model=SystemConfigResponse)
def get_system_config(db: Session = Depends(get_db)) -> SystemConfig:
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@app.put("/api/v1/system-config", response_model=SystemConfigResponse)
def update_system_config(payload: SystemConfigUpdate, db: Session = Depends(get_db)) -> SystemConfig:
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig()
        db.add(config)
        db.commit()
        db.refresh(config)

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(config, key, value)

    db.commit()
    db.refresh(config)
    return config


@app.post("/api/forecast/fetch", status_code=201)
def fetch_and_store_forecast(db: Session = Depends(get_db)) -> dict:
    try:
        weather_payloads, generation_payloads = process_and_get_forecasts()
        
        # Clear or upsert forecasts
        db.query(WeatherForecast).delete()
        db.query(GenerationForecast).delete()

        for w in weather_payloads:
            db.add(WeatherForecast(**w))
        for g in generation_payloads:
            db.add(GenerationForecast(**g))
        
        db.commit()
        return {"status": "success", "count": len(generation_payloads)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
