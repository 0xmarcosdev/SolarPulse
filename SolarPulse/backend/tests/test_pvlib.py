from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.pvlib_service import (
    LOCATION_LAT,
    LOCATION_LON,
    LOCATION_TZ,
    PANEL_AZIMUTH,
    PANEL_CAPACITY_W,
    PANEL_TILT,
    GenerationResult,
    calculate_dc_power,
    calculate_poa_irradiance,
    calculate_solar_position,
    generate_forecast,
    generate_forecast_series,
    get_location,
)


def test_get_location():
    loc = get_location()
    assert loc.latitude == LOCATION_LAT
    assert loc.longitude == LOCATION_LON
    assert str(loc.tz) == LOCATION_TZ


def test_calculate_solar_position():
    time = datetime(2026, 6, 21, 12, 0, tzinfo=ZoneInfo(LOCATION_TZ))
    pos = calculate_solar_position(time)
    assert isinstance(pos.zenith, float)
    assert isinstance(pos.azimuth, float)
    assert 0 <= pos.zenith <= 180
    assert 0 <= pos.azimuth <= 360


def test_calculate_poa_irradiance():
    poa = calculate_poa_irradiance(
        ghi=800.0,
        dni=600.0,
        dhi=200.0,
        solar_zenith=30.0,
        solar_azimuth=180.0,
    )
    assert isinstance(poa.poa_global, float)
    assert poa.poa_global > 0
    assert poa.poa_direct >= 0
    assert poa.poa_diffuse >= 0


def test_calculate_dc_power():
    power = calculate_dc_power(poa_global=1000.0, temp_air=25.0)
    assert isinstance(power, float)
    assert power >= 0
    assert power <= PANEL_CAPACITY_W * 1.2


def test_calculate_dc_power_zero_irradiance():
    power = calculate_dc_power(poa_global=0.0, temp_air=25.0)
    assert power == 0.0


def test_generate_forecast():
    time = datetime(2026, 6, 21, 12, 0, tzinfo=ZoneInfo(LOCATION_TZ))
    result = generate_forecast(time, ghi=800.0, dni=600.0, dhi=200.0, temp_air=28.0)

    assert isinstance(result, GenerationResult)
    assert result.forecast_time == time
    assert result.poa_global > 0
    assert result.raw_dc_power >= 0
    assert result.clipped_power <= 500.0
    assert result.final_ac_power == result.clipped_power * 0.85
    assert result.final_ac_power <= 500.0 * 0.85


def test_generate_forecast_clipping():
    time = datetime(2026, 6, 21, 12, 0, tzinfo=ZoneInfo(LOCATION_TZ))
    # Use extreme values to guarantee clipping triggers
    result = generate_forecast(time, ghi=1500.0, dni=1400.0, dhi=100.0, temp_air=20.0)
    assert result.raw_dc_power > 500.0
    assert result.clipped_power == 500.0
    assert result.final_ac_power == 425.0


def test_generate_forecast_night():
    time = datetime(2026, 6, 21, 0, 0, tzinfo=ZoneInfo(LOCATION_TZ))
    result = generate_forecast(time, ghi=0.0, dni=0.0, dhi=0.0, temp_air=22.0)
    assert result.poa_global == 0.0
    assert result.raw_dc_power == 0.0
    assert result.clipped_power == 0.0
    assert result.final_ac_power == 0.0


def test_generate_forecast_series():
    times = [
        datetime(2026, 6, 21, 10, 0, tzinfo=ZoneInfo(LOCATION_TZ)),
        datetime(2026, 6, 21, 12, 0, tzinfo=ZoneInfo(LOCATION_TZ)),
        datetime(2026, 6, 21, 14, 0, tzinfo=ZoneInfo(LOCATION_TZ)),
    ]
    results = generate_forecast_series(
        times=times,
        ghi_series=[600.0, 800.0, 500.0],
        dni_series=[400.0, 600.0, 300.0],
        dhi_series=[200.0, 200.0, 200.0],
        temp_series=[26.0, 28.0, 27.0],
    )
    assert len(results) == 3
    assert all(isinstance(r, GenerationResult) for r in results)
    assert results[1].poa_global > results[0].poa_global
    assert results[1].poa_global > results[2].poa_global


def test_constants():
    assert LOCATION_LAT == 22.407676
    assert LOCATION_LON == -79.977352
    assert LOCATION_TZ == "America/Havana"
    assert PANEL_TILT == 45
    assert PANEL_AZIMUTH == 180
    assert PANEL_CAPACITY_W == 550