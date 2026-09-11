from typing import Protocol
from app.models import SolarReading


class StationAdapter(Protocol):
    async def start(self) -> None:
        ...

    async def stop(self) -> None:
        ...

    async def latest(self) -> SolarReading | None:
        ...
