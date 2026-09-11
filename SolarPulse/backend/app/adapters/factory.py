import logging
import os

from app.adapters.base import StationAdapter
from app.adapters.mqtt import MqttAdapter
from app.adapters.simulator import SimulatorAdapter

logger = logging.getLogger(__name__)


def get_adapter(data_source: str | None = None) -> StationAdapter:
    """
    Factory function returning the appropriate StationAdapter instance.
    Reads DATA_SOURCE from environment if not specified.
    """
    if data_source is None:
        data_source = os.getenv("DATA_SOURCE", "simulator")

    normalized_source = data_source.strip().lower()

    if normalized_source == "simulator":
        logger.info("Factory: Creando SimulatorAdapter (DATA_SOURCE=%s)", data_source)
        return SimulatorAdapter()
    elif normalized_source == "mqtt":
        logger.info("Factory: Creando MqttAdapter (DATA_SOURCE=%s)", data_source)
        return MqttAdapter()
    else:
        logger.warning(
            "Factory: DATA_SOURCE '%s' no reconocido. Fallback a SimulatorAdapter.",
            data_source,
        )
        return SimulatorAdapter()
