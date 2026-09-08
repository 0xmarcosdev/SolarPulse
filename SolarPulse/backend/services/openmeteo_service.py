from datetime import datetime
from zoneinfo import ZoneInfo
import requests

from config import get_settings
from services.pvlib_service import (
    LOCATION_LAT,
    LOCATION_LON,
    LOCATION_TZ,
    generate_forecast_series,
)


def fetch_openmeteo_forecast() -> dict:
    settings = get_settings()
    params = {
        "latitude": LOCATION_LAT,
        "longitude": LOCATION_LON,
        "hourly": "shortwave_radiation,direct_normal_irradiance,diffuse_radiation,temperature_2m",
        "timezone": LOCATION_TZ,
    }
    response = requests.get(settings.open_meteo_base_url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def process_and_get_forecasts() -> tuple[list[dict], list[dict]]:
    data = fetch_openmeteo_forecast()
    hourly = data.get("hourly", {})
    time_strs = hourly.get("time", [])
    ghi_list = hourly.get("shortwave_radiation", [])
    dni_list = hourly.get("direct_normal_irradiance", [])
    dhi_list = hourly.get("diffuse_radiation", [])
    temp_list = hourly.get("temperature_2m", [])

    if not time_strs:
        return [], []

    reference_time = datetime.now(ZoneInfo(LOCATION_TZ))
    times = [datetime.fromisoformat(t).replace(tzinfo=ZoneInfo(LOCATION_TZ)) for t in time_strs]
    
    # Fill None with 0.0 or defaults
    ghi_list = [g if g is not None else 0.0 for g in ghi_list]
    dni_list = [d if d is not None else 0.0 for d in dni_list]
    dhi_list = [dh if dh is not None else 0.0 for dh in dhi_list]
    temp_list = [tp if tp is not None else 25.0 for tp in temp_list]

    gen_results = generate_forecast_series(times, ghi_list, dni_list, dhi_list, temp_list)

    weather_payloads = []
    generation_payloads = []

    for t, ghi, dni, dhi, temp, gen in zip(times, ghi_list, dni_list, dhi_list, temp_list, gen_results, strict=True):
        weather_payloads.append({
            "reference_time": reference_time,
            "forecast_time": t,
            "ghi": ghi,
            "dni": dni,
            "dhi": dhi,
            "temp_air": temp,
        })
        generation_payloads.append({
            "forecast_time": t,
            "poa_global": gen.poa_global,
            "raw_dc_power": gen.raw_dc_power,
            "clipped_power": gen.clipped_power,
            "final_ac_power": gen.final_ac_power,
        })

    return weather_payloads, generation_payloads
