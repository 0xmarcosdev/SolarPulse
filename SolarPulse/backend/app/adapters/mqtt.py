import logging

from app.adapters.base import StationAdapter
from app.models import SolarReading

logger = logging.getLogger(__name__)


class MqttAdapter(StationAdapter):
    """
    Placeholder adapter for MQTT EcoFlow connection.
    Prints warnings when invoked as it is not yet configured, returning None
    to prevent breaking application flow.
    """

    async def start(self) -> None:
        logger.warning("MqttAdapter warning: MQTT no configurado.")

    async def stop(self) -> None:
        logger.warning("MqttAdapter warning: MQTT no configurado.")

    async def latest(self) -> SolarReading | None:
        logger.warning("MqttAdapter warning: MQTT no configurado.")
        return None
