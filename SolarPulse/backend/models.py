from sqlalchemy import Column, DateTime, Float, Index, Integer, String

from database import Base


class WeatherForecast(Base):
    __tablename__ = "weather_forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference_time = Column(DateTime(timezone=True), nullable=False, index=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False, index=True)
    ghi = Column(Float, nullable=False)
    dni = Column(Float, nullable=False)
    dhi = Column(Float, nullable=False)
    temp_air = Column(Float, nullable=False)

    __table_args__ = (
        Index("ix_weather_forecast_time", "forecast_time"),
    )


class GenerationForecast(Base):
    __tablename__ = "generation_forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    forecast_time = Column(DateTime(timezone=True), nullable=False, index=True)
    poa_global = Column(Float, nullable=False)
    raw_dc_power = Column(Float, nullable=False)
    clipped_power = Column(Float, nullable=False)
    final_ac_power = Column(Float, nullable=False)

    __table_args__ = (
        Index("ix_generation_forecast_time", "forecast_time"),
    )


class EcoFlowReading(Base):
    __tablename__ = "ecoflow_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    battery_soc = Column(Integer, nullable=False)
    input_watts = Column(Float, nullable=False)
    output_watts = Column(Float, nullable=False)
    source = Column(String, nullable=False)

    __table_args__ = (
        Index("ix_ecoflow_reading_timestamp", "timestamp"),
    )