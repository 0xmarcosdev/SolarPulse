from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class WeatherForecastBase(BaseModel):
    reference_time: datetime
    forecast_time: datetime
    ghi: float = Field(ge=0)
    dni: float = Field(ge=0)
    dhi: float = Field(ge=0)
    temp_air: float


class WeatherForecastCreate(WeatherForecastBase):
    pass


class WeatherForecastResponse(WeatherForecastBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class GenerationForecastBase(BaseModel):
    forecast_time: datetime
    poa_global: float = Field(ge=0)
    raw_dc_power: float = Field(ge=0)
    clipped_power: float = Field(ge=0, le=500)
    final_ac_power: float = Field(ge=0)


class GenerationForecastCreate(GenerationForecastBase):
    pass


class GenerationForecastResponse(GenerationForecastBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class EcoFlowReadingBase(BaseModel):
    timestamp: datetime
    battery_soc: int = Field(ge=0, le=100)
    input_watts: float = Field(ge=0)
    output_watts: float = Field(ge=0)
    source: Literal["mqtt", "manual", "api"]


class EcoFlowReadingCreate(EcoFlowReadingBase):
    pass


class EcoFlowReadingResponse(EcoFlowReadingBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str


class StatusResponse(BaseModel):
    status: str
    message: str


class SystemConfigBase(BaseModel):
    panel_model: str
    pmax_stc: float = Field(ge=0)
    temp_coeff_pmax: float
    noct: float = Field(ge=0)
    bifaciality: float = Field(ge=0, le=1)
    system_losses: float = Field(ge=0, le=1)
    inverter_limit: float = Field(ge=0)


class SystemConfigUpdate(BaseModel):
    panel_model: str | None = None
    pmax_stc: float | None = Field(None, ge=0)
    temp_coeff_pmax: float | None = None
    noct: float | None = Field(None, ge=0)
    bifaciality: float | None = Field(None, ge=0, le=1)
    system_losses: float | None = Field(None, ge=0, le=1)
    inverter_limit: float | None = Field(None, ge=0)


class SystemConfigResponse(SystemConfigBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DailyEnergyResponse(BaseModel):
    date: str
    predicted_kwh: float = Field(ge=0)
    actual_kwh: float = Field(ge=0)
    sample_count: int = Field(ge=0)
    sample_count_forecast: int = Field(ge=0)
    sample_count_actual: int = Field(ge=0)
    peak_predicted_watts: float = Field(ge=0, default=0.0)
    peak_actual_watts: float = Field(ge=0, default=0.0)
    coverage_ratio: float = Field(ge=0, default=0.0)


class CockpitNowResponse(BaseModel):
    latest_weather: WeatherForecastResponse | None = None
    latest_forecast: GenerationForecastResponse | None = None
    latest_ecoflow: EcoFlowReadingResponse | None = None
    system_config: SystemConfigResponse
    active_model: str = "pvlib_v1"
    last_openmeteo_fetch_at: datetime | None = None
    recommended_refresh_minutes: int = 15


class TodaySeriesItem(BaseModel):
    time: datetime
    prediction_ac: float
    real_input: float | None = None
    poa_global: float | None = None


class WeekForecastDayItem(BaseModel):
    date: str                  # "YYYY-MM-DD"
    weekday: str               # "Lun", "Mar", etc.
    predicted_kwh: float       # Energía diaria predicha en kWh
    peak_watts: float          # Pico de potencia predicho en W
    solar_score: int           # 0 a 100 calidad de sol
    sample_count: int          # Cantidad de muestras horarias


class DayForecastSlotItem(BaseModel):
    time: datetime             # Timestamp local
    hour_label: str            # "08:00"
    predicted_watts: float     # Potencia AC en W
    predicted_wh: float        # Energía estimada del intervalo en Wh
    actual_watts: float | None = None # Potencia real en W si existe
    actual_wh: float | None = None    # Energía real del intervalo en Wh si existe
    poa_global: float | None = None   # Irradiancia W/m²

