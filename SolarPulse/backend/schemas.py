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