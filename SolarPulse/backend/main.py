from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import EcoFlowReading, GenerationForecast, WeatherForecast
from schemas import (
    EcoFlowReadingCreate,
    EcoFlowReadingResponse,
    GenerationForecastCreate,
    GenerationForecastResponse,
    HealthResponse,
    StatusResponse,
    WeatherForecastCreate,
    WeatherForecastResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="SolarPulse API",
    description="Local-first solar generation forecasting and EcoFlow monitoring",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


@app.get("/api/current-status")
def get_current_status(db: Session = Depends(get_db)) -> dict:
    latest_reading = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.desc()).first()
    latest_generation = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.desc()).first()
    return {
        "ecoflow": latest_reading.__dict__ if latest_reading else None,
        "generation_forecast": latest_generation.__dict__ if latest_generation else None,
    }