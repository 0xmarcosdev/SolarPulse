import math


ECOFLOW_MAX_INPUT_WATTS = 500.0
SYSTEM_LOSS_FACTOR = 0.85


def apply_clipping(raw_dc_power: float) -> float:
    """EcoFlow Delta 3 Classic hard limit: 500W input max."""
    if raw_dc_power is None or (isinstance(raw_dc_power, float) and math.isnan(raw_dc_power)):
        return 0.0
    return min(max(raw_dc_power, 0.0), ECOFLOW_MAX_INPUT_WATTS)


def apply_losses(clipped_power: float) -> float:
    """15% system losses (inverter, wiring, temperature)."""
    if clipped_power is None or (isinstance(clipped_power, float) and math.isnan(clipped_power)):
        return 0.0
    return max(clipped_power, 0.0) * SYSTEM_LOSS_FACTOR


def calculate_final_ac_power(raw_dc_power: float) -> float:
    """Full pipeline: clip → losses."""
    return apply_losses(apply_clipping(raw_dc_power))