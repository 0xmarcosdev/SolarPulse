from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    open_meteo_base_url: str = Field(default="https://api.open-meteo.com/v1/forecast")

    ecoflow_mqtt_host: str | None = None
    ecoflow_mqtt_port: int = 1883
    ecoflow_mqtt_username: str | None = None
    ecoflow_mqtt_password: str | None = None
    ecoflow_device_sn: str | None = None
    ecoflow_simulation_mode: bool = Field(default=True)

    database_url: str = "sqlite:///./solarpulse.db"

    host: str = "0.0.0.0"
    port: int = 8000

    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()