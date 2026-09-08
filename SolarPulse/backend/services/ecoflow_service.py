from datetime import datetime
from zoneinfo import ZoneInfo
import random

from config import get_settings
from services.pvlib_service import LOCATION_TZ


def generate_simulated_reading(current_generation_watts: float = 0.0) -> dict:
    """Generate realistic simulated EcoFlow reading for testing & offline mode."""
    now = datetime.now(ZoneInfo(LOCATION_TZ))
    hour = now.hour

    # Simulate solar input based on generation forecast or time of day
    if 6 <= hour <= 19:
        # Daytime: input proportional to generation or solar curve
        input_w = max(0.0, current_generation_watts * random.uniform(0.9, 1.0))
        input_w = min(input_w, 500.0)  # Clipped at 500W
    else:
        input_w = 0.0

    # Simulate output watts (constant household load between 150W and 350W)
    output_w = random.uniform(150.0, 350.0)

    # Simulate battery SoC (charging if input > output, discharging otherwise)
    # Base SoC around 75%
    soc_base = 75.0
    net_power = input_w - output_w
    soc_adjustment = int(net_power / 50)  # rough heuristic
    soc = max(10, min(100, int(soc_base + soc_adjustment)))

    return {
        "timestamp": now,
        "battery_soc": soc,
        "input_watts": round(input_w, 1),
        "output_watts": round(output_w, 1),
        "source": "api",  # or simulated
    }


class EcoFlowMQTTClient:
    """Skeleton for EcoFlow MQTT / Cloud Polling integration."""
    def __init__(self):
        self.settings = get_settings()
        self.connected = False

    def connect(self):
        if not self.settings.ecoflow_mqtt_host:
            return False
        # MQTT connection logic goes here when credentials arrive
        return True

    def poll_status(self) -> dict | None:
        if self.settings.ecoflow_simulation_mode or not self.connected:
            return None
        # Real MQTT / API poll implementation
        return None
