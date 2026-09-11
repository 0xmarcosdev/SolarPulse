from datetime import datetime
from pydantic import BaseModel, Field


class SolarReading(BaseModel):
    timestamp: datetime
    serial_number: str
    soc_percent: float | None = Field(default=None, ge=0, le=100)
    solar_input_w: float | None = Field(default=None, ge=0)
    ac_output_w: float | None = Field(default=None, ge=0)
    dc_output_w: float | None = Field(default=None, ge=0)
    source: str
    raw: dict | None = None
