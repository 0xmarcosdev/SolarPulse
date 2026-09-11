import logging
import random
from datetime import datetime, timezone

from app.adapters.base import StationAdapter
from app.models import SolarReading

logger = logging.getLogger(__name__)


class SimulatorAdapter(StationAdapter):
    """
    Deterministic simulator adapter for EcoFlow station data.
    Simulates solar profile input (0 to 500W Delta 3 limit) and AC output (50 to 300W),
    updating SoC coherently based on net power balance.
    """

    def __init__(
        self,
        seed: int = 42,
        serial_number: str = "SIM-DELTA3-001",
        initial_soc: float = 70.0,
        battery_capacity_wh: float = 1024.0,
    ) -> None:
        self.seed = seed
        self.serial_number = serial_number
        self.rng = random.Random(seed)
        self.soc_percent: float = initial_soc
        self.battery_capacity_wh: float = battery_capacity_wh
        self._last_timestamp: datetime | None = None
        self._is_running: bool = False

    async def start(self) -> None:
        try:
            self._is_running = True
            logger.info("SimulatorAdapter iniciado con seed=%d", self.seed)
        except Exception as e:
            logger.error("Error iniciando SimulatorAdapter: %s", e)

    async def stop(self) -> None:
        try:
            self._is_running = False
            logger.info("SimulatorAdapter detenido")
        except Exception as e:
            logger.error("Error deteniendo SimulatorAdapter: %s", e)

    async def latest(self) -> SolarReading | None:
        """
        Generates latest simulated reading asynchronously.
        Handles exceptions internally so it never blocks or crashes the caller.
        """
        try:
            now = datetime.now(timezone.utc)

            # Generate solar input (0 to 500 W limit) and AC output (50 to 300 W)
            solar_input_w = round(self.rng.uniform(0.0, 500.0), 1)
            ac_output_w = round(self.rng.uniform(50.0, 300.0), 1)
            dc_output_w = 0.0

            # Determine time interval in hours for coherent SoC update
            if self._last_timestamp is not None:
                dt_seconds = (now - self._last_timestamp).total_seconds()
                dt_hours = dt_seconds / 3600.0 if dt_seconds > 0 else (1.0 / 60.0)
            else:
                dt_hours = 1.0 / 60.0

            self._last_timestamp = now

            # Net power in Watts (positive = charging, negative = discharging)
            net_power_w = solar_input_w - ac_output_w

            # Energy change in Watt-hours
            energy_delta_wh = net_power_w * dt_hours

            # Percentage SoC change relative to total capacity
            soc_delta_percent = (energy_delta_wh / self.battery_capacity_wh) * 100.0

            # Coherently update SoC bounded between 0.0% and 100.0%
            self.soc_percent = max(0.0, min(100.0, self.soc_percent + soc_delta_percent))
            self.soc_percent = round(self.soc_percent, 2)

            return SolarReading(
                timestamp=now,
                serial_number=self.serial_number,
                soc_percent=self.soc_percent,
                solar_input_w=solar_input_w,
                ac_output_w=ac_output_w,
                dc_output_w=dc_output_w,
                source="simulator",
                raw={
                    "seed": self.seed,
                    "net_power_w": net_power_w,
                    "battery_capacity_wh": self.battery_capacity_wh,
                },
            )
        except Exception as e:
            logger.error("Error en SimulatorAdapter.latest(): %s", e)
            return None
