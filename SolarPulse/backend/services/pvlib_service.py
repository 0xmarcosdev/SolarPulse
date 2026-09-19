from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import pandas as pd
import pvlib

from .solar import apply_clipping, apply_losses, calculate_final_ac_power

LOCATION_LAT = 22.407676
LOCATION_LON = -79.977352
LOCATION_TZ = "America/Havana"
PANEL_TILT = 45
PANEL_AZIMUTH = 180
PANEL_CAPACITY_W = 550


@dataclass
class SolarPosition:
    zenith: float
    azimuth: float


@dataclass
class POAIrradiance:
    poa_global: float
    poa_direct: float
    poa_diffuse: float


@dataclass
class GenerationResult:
    forecast_time: datetime
    poa_global: float
    raw_dc_power: float
    clipped_power: float
    final_ac_power: float


def get_location() -> pvlib.location.Location:
    return pvlib.location.Location(
        latitude=LOCATION_LAT,
        longitude=LOCATION_LON,
        tz=LOCATION_TZ,
    )


def calculate_solar_position(time: datetime) -> SolarPosition:
    loc = get_location()
    sp = loc.get_solarposition(time)
    return SolarPosition(zenith=float(sp["zenith"].iloc[0]), azimuth=float(sp["azimuth"].iloc[0]))


def calculate_poa_irradiance(
    ghi: float,
    dni: float,
    dhi: float,
    solar_zenith: float,
    solar_azimuth: float,
    tilt: float = PANEL_TILT,
    azimuth: float = PANEL_AZIMUTH,
    albedo: float = 0.2,
) -> POAIrradiance:
    poa = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=azimuth,
        dni=dni,
        ghi=ghi,
        dhi=dhi,
        solar_zenith=solar_zenith,
        solar_azimuth=solar_azimuth,
        albedo=albedo,
    )
    return POAIrradiance(
        poa_global=float(poa["poa_global"]),
        poa_direct=float(poa["poa_direct"]),
        poa_diffuse=float(poa["poa_diffuse"]),
    )


def calculate_dc_power(
    poa_global: float,
    temp_air: float,
    pmax_stc: float = PANEL_CAPACITY_W,
    temp_coeff: float = -0.0035,
    noct: float = 45.0,
) -> float:
    """DC power model: POA * panel_area * efficiency * temp_correction."""
    panel_area = 2.3  # m² approx for 550-585W panel
    stc_efficiency = pmax_stc / (1000 * panel_area)
    temp_cell = temp_air + (noct - 20) * (max(poa_global, 0.0) / 800)
    efficiency = stc_efficiency * (1 + temp_coeff * (temp_cell - 25))
    return max(poa_global * panel_area * efficiency, 0.0)


def generate_forecast(
    forecast_time: datetime,
    ghi: float,
    dni: float,
    dhi: float,
    temp_air: float,
    tilt: float = PANEL_TILT,
    azimuth: float = PANEL_AZIMUTH,
    albedo: float = 0.2,
    pmax_stc: float = PANEL_CAPACITY_W,
    temp_coeff: float = -0.0035,
    noct: float = 45.0,
    inverter_limit: float = 500.0,
    system_losses: float = 0.15,
) -> GenerationResult:
    solar_pos = calculate_solar_position(forecast_time)
    poa = calculate_poa_irradiance(ghi, dni, dhi, solar_pos.zenith, solar_pos.azimuth, tilt=tilt, azimuth=azimuth, albedo=albedo)
    raw_dc = calculate_dc_power(poa.poa_global, temp_air, pmax_stc=pmax_stc, temp_coeff=temp_coeff, noct=noct)
    clipped = apply_clipping(raw_dc, inverter_limit=inverter_limit)
    final_ac = apply_losses(clipped, system_losses=system_losses)
    return GenerationResult(
        forecast_time=forecast_time,
        poa_global=poa.poa_global,
        raw_dc_power=raw_dc,
        clipped_power=clipped,
        final_ac_power=final_ac,
    )


def generate_forecast_series(
    times: list[datetime],
    ghi_series: list[float],
    dni_series: list[float],
    dhi_series: list[float],
    temp_series: list[float],
    tilt: float = PANEL_TILT,
    azimuth: float = PANEL_AZIMUTH,
    albedo: float = 0.2,
    pmax_stc: float = PANEL_CAPACITY_W,
    temp_coeff: float = -0.0035,
    noct: float = 45.0,
    inverter_limit: float = 500.0,
    system_losses: float = 0.15,
) -> list[GenerationResult]:
    return [
        generate_forecast(
            t, ghi, dni, dhi, temp,
            tilt=tilt, azimuth=azimuth, albedo=albedo,
            pmax_stc=pmax_stc, temp_coeff=temp_coeff, noct=noct,
            inverter_limit=inverter_limit, system_losses=system_losses,
        )
        for t, ghi, dni, dhi, temp in zip(times, ghi_series, dni_series, dhi_series, temp_series, strict=True)
    ]