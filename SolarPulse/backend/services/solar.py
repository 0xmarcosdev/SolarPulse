import math
from collections import defaultdict
from collections.abc import Sequence
from datetime import datetime
from typing import Any, Optional
from zoneinfo import ZoneInfo


ECOFLOW_MAX_INPUT_WATTS: float = 500.0
SYSTEM_LOSS_FACTOR: float = 0.85
DEFAULT_TIMEZONE = "America/Havana"


def calculate_cell_temperature(temp_air: float, poa_irradiance: float, noct: float = 45.0) -> float:
    """T_cell = T_amb + (NOCT - 20) * (Irradiance / 800)"""
    irradiance = max(poa_irradiance, 0.0)
    return temp_air + (noct - 20.0) * (irradiance / 800.0)


def apply_clipping(raw_dc_power: Optional[float], inverter_limit: float = ECOFLOW_MAX_INPUT_WATTS) -> float:
    """EcoFlow Delta 3 Classic limit (default 500W, adjustable)."""
    if raw_dc_power is None or (isinstance(raw_dc_power, float) and math.isnan(raw_dc_power)):
        return 0.0
    return min(max(raw_dc_power, 0.0), inverter_limit)


def apply_losses(clipped_power: Optional[float], system_losses: float = 0.15) -> float:
    """Apply system losses (default 15% loss, factor 0.85)."""
    if clipped_power is None or (isinstance(clipped_power, float) and math.isnan(clipped_power)):
        return 0.0
    return max(clipped_power, 0.0) * (1.0 - system_losses)


def calculate_bifacial_gain(
    poa_irradiance: float,
    bifaciality: float = 0.80,
    area_panel: float = 2.0,
    albedo: float = 0.20,
) -> float:
    """Calculated as poa_irradiance * bifaciality * albedo_suelo * area_panel."""
    return max(poa_irradiance, 0.0) * bifaciality * albedo * area_panel


def calculate_final_ac_power(raw_dc_power: Optional[float], config: Any = None) -> float:
    """Full pipeline: clip → losses."""
    inverter_limit = float(getattr(config, "inverter_limit", ECOFLOW_MAX_INPUT_WATTS)) if config else ECOFLOW_MAX_INPUT_WATTS
    system_losses = float(getattr(config, "system_losses", 0.15)) if config else 0.15
    clipped = apply_clipping(raw_dc_power, inverter_limit)
    return apply_losses(clipped, system_losses)


def integrate_power_trapezoidal(
    points: Sequence[tuple[datetime, Optional[float]]],
    max_gap_hours: float = 3.0,
    single_point_hours: float = 1.0,
) -> float:
    """
    Calculates accumulated energy in kWh from a time series of (timestamp, power_in_watts)
    using the trapezoidal rule of numerical integration.

    Formula:
        Energy (Wh) = sum_i ( (P_i + P_{i+1}) / 2 * dt_i_hours )
        Energy (kWh) = Energy (Wh) / 1000.0

    Assumptions & Edge Cases:
        - None, NaN or negative power values are sanitized to 0.0 W.
        - Empty list returns 0.0 kWh.
        - Single point: returns estimated energy assuming single_point_hours duration.
        - Gaps larger than max_gap_hours (e.g. overnight or missing records) are not
          linearly interpolated across to avoid overestimating generation.
        - Points are sorted chronologically before integration.
    """
    if not points:
        return 0.0

    sanitized: list[tuple[datetime, float]] = []
    for dt, p in points:
        if dt is None:
            continue
        val = 0.0
        if p is not None and not (isinstance(p, float) and math.isnan(p)):
            val = max(float(p), 0.0)
        sanitized.append((dt, val))

    if not sanitized:
        return 0.0

    sanitized.sort(key=lambda x: x[0])

    if len(sanitized) == 1:
        return round((sanitized[0][1] * single_point_hours) / 1000.0, 4)

    total_wh = 0.0
    for i in range(len(sanitized) - 1):
        t1, p1 = sanitized[i]
        t2, p2 = sanitized[i + 1]
        dt_seconds = (t2 - t1).total_seconds()
        if dt_seconds <= 0:
            continue
        dt_hours = dt_seconds / 3600.0
        if dt_hours <= max_gap_hours:
            interval_wh = 0.5 * (p1 + p2) * dt_hours
            total_wh += interval_wh

    return round(total_wh / 1000.0, 4)


def aggregate_daily_energy(
    forecast_points: Sequence[tuple[datetime, Optional[float]]],
    actual_points: Sequence[tuple[datetime, Optional[float]]],
    tz_name: str = DEFAULT_TIMEZONE,
) -> list[dict[str, Any]]:
    """
    Aggregates generation forecasts and actual readings into daily kWh summary records,
    correctly partitioned by solar calendar days in the specified timezone.
    """
    tz = ZoneInfo(tz_name)

    def to_local_date_and_dt(dt: datetime) -> tuple[str, datetime]:
        if dt.tzinfo is None:
            local_dt = dt.replace(tzinfo=tz)
        else:
            local_dt = dt.astimezone(tz)
        return local_dt.strftime("%Y-%m-%d"), local_dt

    forecast_by_day: dict[str, list[tuple[datetime, Optional[float]]]] = defaultdict(list)
    actual_by_day: dict[str, list[tuple[datetime, Optional[float]]]] = defaultdict(list)

    for dt, val in forecast_points:
        if dt is not None:
            day_str, local_dt = to_local_date_and_dt(dt)
            forecast_by_day[day_str].append((local_dt, val))

    for dt, val in actual_points:
        if dt is not None:
            day_str, local_dt = to_local_date_and_dt(dt)
            actual_by_day[day_str].append((local_dt, val))

    all_days = sorted(set(list(forecast_by_day.keys()) + list(actual_by_day.keys())))

    results: list[dict[str, Any]] = []
    for day in all_days:
        f_pts = forecast_by_day.get(day, [])
        a_pts = actual_by_day.get(day, [])

        pred_kwh = integrate_power_trapezoidal(f_pts)
        act_kwh = integrate_power_trapezoidal(a_pts)

        peak_pred = max([float(p[1]) for p in f_pts if p[1] is not None] + [0.0])
        peak_act = max([float(p[1]) for p in a_pts if p[1] is not None] + [0.0])

        coverage = round(act_kwh / pred_kwh, 4) if pred_kwh > 0 else 0.0

        results.append({
            "date": day,
            "predicted_kwh": pred_kwh,
            "actual_kwh": act_kwh,
            "sample_count": len(f_pts) + len(a_pts),
            "sample_count_forecast": len(f_pts),
            "sample_count_actual": len(a_pts),
            "peak_predicted_watts": round(peak_pred, 2),
            "peak_actual_watts": round(peak_act, 2),
            "coverage_ratio": coverage,
        })

    return results
