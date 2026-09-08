import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.ecoflow_service import generate_simulated_reading, EcoFlowMQTTClient


def test_generate_simulated_reading():
    reading = generate_simulated_reading(current_generation_watts=300.0)
    assert "timestamp" in reading
    assert 0 <= reading["battery_soc"] <= 100
    assert reading["input_watts"] >= 0.0
    assert reading["output_watts"] >= 0.0
    assert reading["source"] == "api"


def test_ecoflow_mqtt_client_fallback():
    client = EcoFlowMQTTClient()
    # Without host configured, connect returns False
    assert client.connect() is False
    assert client.poll_status() is None
