from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session

from models import CalibrationState, SystemConfig, EcoFlowReading, GenerationForecast
from services.solar import aggregate_daily_energy, DEFAULT_TIMEZONE


def update_calibration_model(db: Session, provider_id: str) -> CalibrationState:
    gen_records = db.query(GenerationForecast).all()
    eco_records = db.query(EcoFlowReading).all()

    tz = ZoneInfo(DEFAULT_TIMEZONE)
    forecast_pts: list[tuple[datetime, float | None]] = [
        (r.forecast_time.replace(tzinfo=tz) if r.forecast_time.tzinfo is None else r.forecast_time, float(r.final_ac_power))  # type: ignore
        for r in gen_records
    ]
    actual_pts: list[tuple[datetime, float | None]] = [
        (r.timestamp.replace(tzinfo=tz) if r.timestamp.tzinfo is None else r.timestamp, float(r.input_watts))  # type: ignore
        for r in eco_records
    ]

    daily_data = aggregate_daily_energy(forecast_pts, actual_pts, tz_name=DEFAULT_TIMEZONE)

    valid_days = [d for d in daily_data if d["predicted_kwh"] > 0 and d["actual_kwh"] > 0]
    
    scale_factor = 1.0
    if len(valid_days) >= 3:
        total_pred = sum(d["predicted_kwh"] for d in valid_days)
        total_act = sum(d["actual_kwh"] for d in valid_days)
        if total_pred > 0:
            raw_ratio = total_act / total_pred
            scale_factor = round(min(max(raw_ratio, 0.5), 1.5), 3)

    state = db.query(CalibrationState).filter_by(provider_id=provider_id).first()
    if not state:
        state = CalibrationState(provider_id=provider_id)
        db.add(state)

    state.scale_factor = scale_factor  # type: ignore
    state.n_days = len(valid_days)  # type: ignore
    state.updated_at = datetime.now(tz)  # type: ignore
    db.commit()
    db.refresh(state)
    return state


def apply_calibration(db: Session, provider_id: str, raw_power: float) -> float:
    config = db.query(SystemConfig).first()
    if not config or getattr(config, "calibration_enabled", 1) == 0:
        return raw_power

    state = db.query(CalibrationState).filter_by(provider_id=provider_id).first()
    if not state:
        return raw_power

    factor = float(getattr(state, "scale_factor", 1.0))
    calibrated = raw_power * factor
    return min(max(calibrated, 0.0), 500.0)

