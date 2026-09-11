import math
from models import SystemConfig


def calculate_cell_temperature(temp_air: float, poa_irradiance: float, noct: float) -> float:
    """T_cell = T_amb + (NOCT - 20) * (Irradiance / 800)"""
    irradiance = max(poa_irradiance, 0.0)
    return temp_air + (noct - 20.0) * (irradiance / 800.0)


def apply_clipping(raw_dc_power: float, inverter_limit: float) -> float:
    """EcoFlow Delta 3 Classic limit (adjustable)."""
    if raw_dc_power is None or (isinstance(raw_dc_power, float) and math.isnan(raw_dc_power)):
        return 0.0
    return min(max(raw_dc_power, 0.0), inverter_limit)


def apply_losses(clipped_power: float, system_losses: float) -> float:
    """Apply system losses (15% default)."""
    if clipped_power is None or (isinstance(clipped_power, float) and math.isnan(clipped_power)):
        return 0.0
    # system_losses (e.g., 0.15) factor applied as 1.0 - losses
    return max(clipped_power, 0.0) * (1.0 - system_losses)


def calculate_bifacial_gain(poa_irradiance: float, bifaciality: float, area_panel: float = 2.0, albedo: float = 0.20) -> float:
    """Calculated as poa_irradiance * bifaciality * albedo_suelo * area_panel."""
    return max(poa_irradiance, 0.0) * bifaciality * albedo * area_panel


def calculate_final_ac_power(raw_dc_power: float, config: SystemConfig) -> float:
    """Full pipeline: clip → losses."""
    clipped = apply_clipping(raw_dc_power, float(config.inverter_limit))
    final_power = apply_losses(clipped, float(config.system_losses))
    return final_power
