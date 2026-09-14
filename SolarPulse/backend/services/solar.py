import math
from typing import Any, Optional


ECOFLOW_MAX_INPUT_WATTS: float = 500.0
SYSTEM_LOSS_FACTOR: float = 0.85


def calculate_cell_temperature(temp_air: float, poa_irradiance: float, noct: float = 45.0) -> float:
    """T_cell = T_amb + (NOCT - 20) * (Irradiance / 800)"""
    irradiance = max(poa_irradiance, 0.0)
    return temp_air + (noct - 20.0) * (irradiance / 800.0)


def apply_clipping(raw_dc_power: Optional[float], inverter_limit: float = ECOFLOW_MAX_INPUT_WATTS) -> float:
    """EcoFlow Delta 3 Classic limit (default 500W, adjustable)."""
    if raw_dc_power is None or (isinstance(raw_dc_power, float) and math.isnan(raw_dc_power)):
        return 0.0
    return min(max(raw_dc_power, 0.0), inverter_limit)


def apply_losses(clipped_power: Optional[float], system_losses: float = 0.15) -> float:
    """Apply system losses (default 15% loss, factor 0.85)."""
    if clipped_power is None or (isinstance(clipped_power, float) and math.isnan(clipped_power)):
        return 0.0
    return max(clipped_power, 0.0) * (1.0 - system_losses)


def calculate_bifacial_gain(
    poa_irradiance: float,
    bifaciality: float = 0.80,
    area_panel: float = 2.0,
    albedo: float = 0.20,
) -> float:
    """Calculated as poa_irradiance * bifaciality * albedo_suelo * area_panel."""
    return max(poa_irradiance, 0.0) * bifaciality * albedo * area_panel


def calculate_final_ac_power(raw_dc_power: Optional[float], config: Any = None) -> float:
    """Full pipeline: clip → losses."""
    inverter_limit = float(getattr(config, "inverter_limit", ECOFLOW_MAX_INPUT_WATTS)) if config else ECOFLOW_MAX_INPUT_WATTS
    system_losses = float(getattr(config, "system_losses", 0.15)) if config else 0.15
    clipped = apply_clipping(raw_dc_power, inverter_limit)
    return apply_losses(clipped, system_losses)
