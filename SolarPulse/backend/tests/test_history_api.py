from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import math
import pytest
from fastapi.testclient import TestClient

from main import app
from database import Base, SessionLocal, engine
from models import EcoFlowReading, GenerationForecast, WeatherForecast, SystemConfig
from services.solar import (
    DEFAULT_TIMEZONE,
    integrate_power_trapezoidal,
    aggregate_daily_energy,
)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(GenerationForecast).delete()
    db.query(EcoFlowReading).delete()
    db.query(WeatherForecast).delete()
    db.commit()
    db.close()
    yield


# --- Unit Tests: Integration & Energy Calculations ---

def test_integrate_power_empty():
    assert integrate_power_trapezoidal([]) == 0.0


def test_integrate_power_single_point():
    now = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))
    # 500W for 1 hour default = 0.5 kWh
    assert integrate_power_trapezoidal([(now, 500.0)]) == 0.5


def test_integrate_power_trapezoidal_constant():
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    t0 = datetime(2026, 9, 15, 10, 0, tzinfo=tz)
    t1 = datetime(2026, 9, 15, 11, 0, tzinfo=tz)
    t2 = datetime(2026, 9, 15, 12, 0, tzinfo=tz)

    # Constant 500 W over 2 hours = 1.0 kWh
    pts = [(t0, 500.0), (t1, 500.0), (t2, 500.0)]
    assert integrate_power_trapezoidal(pts) == 1.0


def test_integrate_power_trapezoidal_triangle():
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    # Hourly points from 06:00 to 18:00 forming a triangle peaking at 12:00 with 425W
    pts = [
        (datetime(2026, 9, 15, 6 + i, 0, tzinfo=tz), 425.0 * (1 - abs(i - 6) / 6))
        for i in range(13)
    ]

    # Triangle area: 0.5 * base (12h) * height (425W) = 2550 Wh = 2.55 kWh
    assert integrate_power_trapezoidal(pts) == 2.55


def test_integrate_power_sanitization_and_gaps():
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    t0 = datetime(2026, 9, 15, 8, 0, tzinfo=tz)
    t1 = datetime(2026, 9, 15, 9, 0, tzinfo=tz)
    t_gap = datetime(2026, 9, 15, 15, 0, tzinfo=tz) # 6h gap > max_gap (3h)

    pts = [(t0, 1000.0), (t1, None), (t_gap, 500.0)]
    # t0 to t1: (1000 + 0)/2 * 1h = 500 Wh = 0.5 kWh
    # t1 to t_gap: gap = 6h > 3h, skipped.
    assert integrate_power_trapezoidal(pts) == 0.5


def test_aggregate_daily_energy():
    tz = ZoneInfo(DEFAULT_TIMEZONE)
    t0 = datetime(2026, 9, 15, 10, 0, tzinfo=tz)
    t1 = datetime(2026, 9, 15, 11, 0, tzinfo=tz)

    forecast_pts = [(t0, 425.0), (t1, 425.0)]
    actual_pts = [(t0, 450.0), (t1, 450.0)]

    res = aggregate_daily_energy(forecast_pts, actual_pts)
    assert len(res) == 1
    day = res[0]
    assert day["date"] == "2026-09-15"
    assert day["predicted_kwh"] == 0.425
    assert day["actual_kwh"] == 0.45
    assert day["sample_count"] == 4
    assert day["peak_predicted_watts"] == 425.0
    assert day["peak_actual_watts"] == 450.0


# --- API Endpoint Integration Tests ---

def test_get_history_endpoints_empty():
    client = TestClient(app)

    res_gen = client.get("/api/history/generation?days=7")
    assert res_gen.status_code == 200
    assert res_gen.json() == []

    res_eco = client.get("/api/history/ecoflow?days=7")
    assert res_eco.status_code == 200
    assert res_eco.json() == []

    res_wx = client.get("/api/history/weather?days=7")
    assert res_wx.status_code == 200
    assert res_wx.json() == []

    res_nrg = client.get("/api/energy/daily?days=7")
    assert res_nrg.status_code == 200
    assert res_nrg.json() == []


def test_get_history_and_daily_energy_with_data():
    db = SessionLocal()
    now = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))

    # Add 2 forecast entries
    f1 = GenerationForecast(
        forecast_time=now - timedelta(hours=2),
        poa_global=800.0,
        raw_dc_power=600.0,
        clipped_power=500.0,
        final_ac_power=425.0,
    )
    f2 = GenerationForecast(
        forecast_time=now - timedelta(hours=1),
        poa_global=850.0,
        raw_dc_power=620.0,
        clipped_power=500.0,
        final_ac_power=425.0,
    )
    db.add_all([f1, f2])

    # Add 2 EcoFlow readings
    e1 = EcoFlowReading(
        timestamp=now - timedelta(hours=2),
        battery_soc=80,
        input_watts=450.0,
        output_watts=120.0,
        source="manual",
    )
    e2 = EcoFlowReading(
        timestamp=now - timedelta(hours=1),
        battery_soc=82,
        input_watts=460.0,
        output_watts=120.0,
        source="manual",
    )
    db.add_all([e1, e2])

    # Add 1 Weather entry
    w1 = WeatherForecast(
        reference_time=now - timedelta(hours=2),
        forecast_time=now - timedelta(hours=2),
        ghi=700.0,
        dni=800.0,
        dhi=100.0,
        temp_air=28.0,
    )
    db.add(w1)

    db.commit()
    db.close()

    client = TestClient(app)

    # Check /api/history/generation
    res_gen = client.get("/api/history/generation?days=1")
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assert len(gen_data) == 2
    assert gen_data[0]["final_ac_power"] == 425.0

    # Check /api/history/ecoflow
    res_eco = client.get("/api/history/ecoflow?days=1")
    assert res_eco.status_code == 200
    eco_data = res_eco.json()
    assert len(eco_data) == 2
    assert eco_data[0]["input_watts"] == 450.0

    # Check /api/history/weather
    res_wx = client.get("/api/history/weather?days=1")
    assert res_wx.status_code == 200
    wx_data = res_wx.json()
    assert len(wx_data) == 1
    assert wx_data[0]["ghi"] == 700.0

    # Check /api/energy/daily
    res_nrg = client.get("/api/energy/daily?days=1")
    assert res_nrg.status_code == 200
    nrg_data = res_nrg.json()
    assert len(nrg_data) == 1
    assert nrg_data[0]["predicted_kwh"] == 0.425
    assert nrg_data[0]["actual_kwh"] == 0.455
    assert nrg_data[0]["sample_count"] == 4


def test_cockpit_endpoints():
    db = SessionLocal()
    now = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))
    
    # Setup SystemConfig
    sys_cfg = SystemConfig(
        panel_model="RUNERGY HY-DH144N8-585",
        pmax_stc=585.0,
        temp_coeff_pmax=-0.0029,
        noct=45.0,
        bifaciality=0.80,
        system_losses=0.15,
        inverter_limit=500.0,
        panel_tilt=45.0,
        panel_azimuth=180.0,
        albedo=0.20,
        active_provider="open_meteo_best_match",
        calibration_enabled=1,
    )
    db.add(sys_cfg)
    
    # Setup data
    f1 = GenerationForecast(
        forecast_time=now,
        poa_global=800.0,
        raw_dc_power=600.0,
        clipped_power=500.0,
        final_ac_power=425.0,
    )
    db.add(f1)
    
    w1 = WeatherForecast(
        reference_time=now - timedelta(minutes=10),
        forecast_time=now,
        ghi=700.0,
        dni=800.0,
        dhi=100.0,
        temp_air=28.0,
    )
    db.add(w1)
    
    e1 = EcoFlowReading(
        timestamp=now,
        battery_soc=80,
        input_watts=450.0,
        output_watts=120.0,
        source="manual",
    )
    db.add(e1)
    db.commit()
    db.close()

    client = TestClient(app)

    # Test /api/cockpit/now
    res_now = client.get("/api/cockpit/now")
    assert res_now.status_code == 200
    data = res_now.json()
    assert data["latest_forecast"]["final_ac_power"] == 425.0
    assert data["latest_ecoflow"]["input_watts"] == 450.0
    assert data["last_openmeteo_fetch_at"] is not None

    # Test /api/cockpit/today-series
    res_today = client.get("/api/cockpit/today-series")
    assert res_today.status_code == 200
    today_data = res_today.json()
    assert len(today_data) >= 1


def test_forecast_week_and_day_endpoints():
    db = SessionLocal()
    now = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))
    date_str = now.strftime("%Y-%m-%d")

    # Setup SystemConfig
    sys_cfg = SystemConfig(
        panel_model="RUNERGY HY-DH144N8-585",
        pmax_stc=585.0,
        temp_coeff_pmax=-0.0029,
        noct=45.0,
        bifaciality=0.80,
        system_losses=0.15,
        inverter_limit=500.0,
        panel_tilt=45.0,
        panel_azimuth=180.0,
        albedo=0.20,
        active_provider="open_meteo_best_match",
        calibration_enabled=1,
    )
    db.add(sys_cfg)

    f1 = GenerationForecast(
        forecast_time=now,
        poa_global=800.0,
        raw_dc_power=600.0,
        clipped_power=500.0,
        final_ac_power=425.0,
    )
    db.add(f1)
    db.commit()
    db.close()

    client = TestClient(app)

    # Test /api/forecast/week
    res_week = client.get("/api/forecast/week")
    assert res_week.status_code == 200
    week_data = res_week.json()
    assert len(week_data) == 7
    assert week_data[0]["date"] == date_str

    # Test /api/forecast/day
    res_day = client.get(f"/api/forecast/day?date={date_str}")
    assert res_day.status_code == 200
    day_data = res_day.json()
    assert len(day_data) == 24
    assert day_data[now.hour]["predicted_watts"] == 425.0
    assert day_data[now.hour]["predicted_wh"] == 425.0

