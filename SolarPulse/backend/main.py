from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import EcoFlowReading, GenerationForecast, WeatherForecast, SystemConfig
from services.openmeteo_service import process_and_get_forecasts
from services.solar import aggregate_daily_energy, DEFAULT_TIMEZONE
from schemas import (
    CockpitNowResponse,
    DailyEnergyResponse,
    DayForecastSlotItem,
    EcoFlowReadingCreate,
    EcoFlowReadingResponse,
    GenerationForecastCreate,
    GenerationForecastResponse,
    HealthResponse,
    StatusResponse,
    TodaySeriesItem,
    WeatherForecastCreate,
    WeatherForecastResponse,
    SystemConfigResponse,
    SystemConfigUpdate,
    WeekForecastDayItem,
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


from typing import cast

@app.get("/api/history/generation", response_model=list[GenerationForecastResponse])
def get_generation_history(days: int = 7, db: Session = Depends(get_db)) -> list[GenerationForecast]:
    cutoff = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)) - timedelta(days=days)
    records = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.asc()).all()
    filtered: list[GenerationForecast] = []
    for r in records:
        dt: datetime = r.forecast_time  # type: ignore[assignment]
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=ZoneInfo(DEFAULT_TIMEZONE))
        if dt >= cutoff:
            filtered.append(r)
    return filtered


@app.get("/api/history/ecoflow", response_model=list[EcoFlowReadingResponse])
def get_ecoflow_history(days: int = 7, db: Session = Depends(get_db)) -> list[EcoFlowReading]:
    cutoff = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)) - timedelta(days=days)
    records = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.asc()).all()
    filtered: list[EcoFlowReading] = []
    for r in records:
        dt: datetime = r.timestamp  # type: ignore[assignment]
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=ZoneInfo(DEFAULT_TIMEZONE))
        if dt >= cutoff:
            filtered.append(r)
    return filtered


@app.get("/api/history/weather", response_model=list[WeatherForecastResponse])
def get_weather_history(days: int = 7, db: Session = Depends(get_db)) -> list[WeatherForecast]:
    cutoff = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)) - timedelta(days=days)
    records = db.query(WeatherForecast).order_by(WeatherForecast.forecast_time.asc()).all()
    filtered: list[WeatherForecast] = []
    for r in records:
        dt: datetime = r.forecast_time  # type: ignore[assignment]
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=ZoneInfo(DEFAULT_TIMEZONE))
        if dt >= cutoff:
            filtered.append(r)
    return filtered


@app.get("/api/energy/daily", response_model=list[DailyEnergyResponse])
def get_daily_energy(days: int = 7, db: Session = Depends(get_db)) -> list[DailyEnergyResponse]:
    cutoff = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)) - timedelta(days=days)

    gen_records = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.asc()).all()
    eco_records = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.asc()).all()

    forecast_pts: list[tuple[datetime, float | None]] = []
    for r in gen_records:
        dt: datetime = r.forecast_time  # type: ignore[assignment]
        val: float | None = r.final_ac_power  # type: ignore[assignment]
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=ZoneInfo(DEFAULT_TIMEZONE))
        if dt >= cutoff:
            forecast_pts.append((dt, val))

    actual_pts: list[tuple[datetime, float | None]] = []
    for r in eco_records:
        dt: datetime = r.timestamp  # type: ignore[assignment]
        val: float | None = r.input_watts  # type: ignore[assignment]
        if getattr(dt, "tzinfo", None) is None:
            dt = dt.replace(tzinfo=ZoneInfo(DEFAULT_TIMEZONE))
        if dt >= cutoff:
            actual_pts.append((dt, val))

    daily_summaries = aggregate_daily_energy(forecast_pts, actual_pts, tz_name=DEFAULT_TIMEZONE)
    return [DailyEnergyResponse(**item) for item in daily_summaries]


@app.get("/api/cockpit/now", response_model=CockpitNowResponse)
def get_cockpit_now(db: Session = Depends(get_db)) -> CockpitNowResponse:
    latest_weather = db.query(WeatherForecast).order_by(WeatherForecast.forecast_time.desc()).first()
    latest_forecast = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.desc()).first()
    latest_ecoflow = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.desc()).first()
    system_config = db.query(SystemConfig).first()
    
    if not system_config:
        system_config = SystemConfig()
        db.add(system_config)
        db.commit()
        db.refresh(system_config)

    # Proxy for last fetch: the max reference_time in weather forecasts
    latest_fetch_weather = db.query(WeatherForecast).order_by(WeatherForecast.reference_time.desc()).first()
    last_fetch: datetime | None = getattr(latest_fetch_weather, "reference_time", None)

    return CockpitNowResponse(
        latest_weather=WeatherForecastResponse.model_validate(latest_weather) if latest_weather else None,
        latest_forecast=GenerationForecastResponse.model_validate(latest_forecast) if latest_forecast else None,
        latest_ecoflow=EcoFlowReadingResponse.model_validate(latest_ecoflow) if latest_ecoflow else None,
        system_config=SystemConfigResponse.model_validate(system_config),
        last_openmeteo_fetch_at=last_fetch,
    )


@app.get("/api/cockpit/today-series", response_model=list[TodaySeriesItem])
def get_today_series(db: Session = Depends(get_db)) -> list[TodaySeriesItem]:
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    now = datetime.now(tz)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    all_gen = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.asc()).all()
    all_eco = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.asc()).all()

    series_map: dict[datetime, dict] = {}

    for g in all_gen:
        dt: datetime = g.forecast_time  # type: ignore
        if dt.tzinfo is None: dt = dt.replace(tzinfo=tz)
        if today_start <= dt < today_end:
            series_map[dt] = {
                "time": dt,
                "prediction_ac": g.final_ac_power,
                "real_input": None,
                "poa_global": g.poa_global
            }

    for e in all_eco:
        dt: datetime = e.timestamp  # type: ignore
        if dt.tzinfo is None: dt = dt.replace(tzinfo=tz)
        if today_start <= dt < today_end:
            bucket = dt.replace(minute=0, second=0, microsecond=0)
            if bucket in series_map:
                series_map[bucket]["real_input"] = e.input_watts
            else:
                series_map[bucket] = {
                    "time": bucket,
                    "prediction_ac": 0.0,
                    "real_input": e.input_watts,
                    "poa_global": 0.0
                }

    sorted_series = [TodaySeriesItem(**val) for key, val in sorted(series_map.items())]
    return sorted_series


@app.get("/api/forecast/week", response_model=list[WeekForecastDayItem])
def get_forecast_week(db: Session = Depends(get_db)) -> list[WeekForecastDayItem]:
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    now = datetime.now(tz)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    gen_records = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.asc()).all()

    days_map: dict[str, list[tuple[datetime, float]]] = {}
    for r in gen_records:
        dt: datetime = r.forecast_time  # type: ignore
        val: float = float(r.final_ac_power)  # type: ignore
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=tz)
        else:
            dt = dt.astimezone(tz)
        
        if dt >= today_start:
            day_str = dt.strftime("%Y-%m-%d")
            if day_str not in days_map:
                days_map[day_str] = []
            days_map[day_str].append((dt, val))

    result: list[WeekForecastDayItem] = []
    weekday_names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    for i in range(7):
        target_date = today_start + timedelta(days=i)
        day_str = target_date.strftime("%Y-%m-%d")
        weekday_str = weekday_names[target_date.weekday()]

        pts = days_map.get(day_str, [])
        casted_pts = [(p[0], float(p[1])) for p in pts]
        pred_kwh = aggregate_daily_energy(casted_pts, [], tz_name=DEFAULT_TIMEZONE)[0]["predicted_kwh"] if pts else 0.0
        peak_w = max([float(p[1]) for p in pts] + [0.0])

        max_possible = 4.0
        score = min(100, max(0, int((pred_kwh / max_possible) * 100)))

        result.append(WeekForecastDayItem(
            date=day_str,
            weekday=weekday_str,
            predicted_kwh=pred_kwh,
            peak_watts=peak_w,
            solar_score=score,
            sample_count=len(pts),
        ))

    return result


@app.get("/api/forecast/day", response_model=list[DayForecastSlotItem])
def get_forecast_day(date: str, db: Session = Depends(get_db)) -> list[DayForecastSlotItem]:
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=tz)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Usar YYYY-MM-DD")

    day_start = target_date
    day_end = target_date + timedelta(days=1)

    gen_records = db.query(GenerationForecast).order_by(GenerationForecast.forecast_time.asc()).all()
    eco_records = db.query(EcoFlowReading).order_by(EcoFlowReading.timestamp.asc()).all()

    gen_map: dict[str, float] = {}
    poa_map: dict[str, float] = {}
    for g in gen_records:
        dt: datetime = g.forecast_time  # type: ignore
        f_ac: float = float(g.final_ac_power)  # type: ignore
        poa: float = float(g.poa_global)  # type: ignore
        if dt.tzinfo is None: dt = dt.replace(tzinfo=tz)
        else: dt = dt.astimezone(tz)
        if day_start <= dt < day_end:
            key_min = dt.strftime("%Y-%m-%d %H:%M")
            key_hour = dt.strftime("%Y-%m-%d %H:00")
            gen_map[key_min] = f_ac
            gen_map[key_hour] = f_ac
            poa_map[key_min] = poa
            poa_map[key_hour] = poa

    eco_map: dict[str, float] = {}
    for e in eco_records:
        dt: datetime = e.timestamp  # type: ignore
        inp: float = float(e.input_watts)  # type: ignore
        if dt.tzinfo is None: dt = dt.replace(tzinfo=tz)
        else: dt = dt.astimezone(tz)
        if day_start <= dt < day_end:
            key = dt.strftime("%Y-%m-%d %H:00")
            eco_map[key] = inp

    slots: list[DayForecastSlotItem] = []
    for hour in range(24):
        slot_time = day_start + timedelta(hours=hour)
        key_min = slot_time.strftime("%Y-%m-%d %H:%M")
        key_hour = slot_time.strftime("%Y-%m-%d %H:00")

        pred_w = gen_map.get(key_min, gen_map.get(key_hour, 0.0))
        poa = poa_map.get(key_min, poa_map.get(key_hour, 0.0))
        actual_w = eco_map.get(key_hour, None)

        pred_wh = round(pred_w * 1.0, 2)
        actual_wh = round(actual_w * 1.0, 2) if actual_w is not None else None

        slots.append(DayForecastSlotItem(
            time=slot_time,
            hour_label=f"{hour:02d}:00",
            predicted_watts=pred_w,
            predicted_wh=pred_wh,
            actual_watts=actual_w,
            actual_wh=actual_wh,
            poa_global=poa,
        ))

    return slots


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
