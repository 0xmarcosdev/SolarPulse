import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from models import SystemConfig
from services.solar import (
    ECOFLOW_MAX_INPUT_WATTS,
    SYSTEM_LOSS_FACTOR,
    apply_clipping,
    apply_losses,
    calculate_bifacial_gain,
    calculate_cell_temperature,
    calculate_final_ac_power,
)

# Constants for testing
TEST_INVERTER_LIMIT = 500.0
TEST_SYSTEM_LOSSES = 0.15
TEST_CONFIG = SystemConfig(inverter_limit=TEST_INVERTER_LIMIT, system_losses=TEST_SYSTEM_LOSSES)


def test_constants_values():
    assert ECOFLOW_MAX_INPUT_WATTS == 500.0
    assert SYSTEM_LOSS_FACTOR == 0.85


def test_apply_clipping_below_limit():
    assert apply_clipping(300.0, TEST_INVERTER_LIMIT) == 300.0
    assert apply_clipping(0.0, TEST_INVERTER_LIMIT) == 0.0
    assert apply_clipping(499.9, TEST_INVERTER_LIMIT) == 499.9


def test_apply_clipping_default_limit():
    assert apply_clipping(400.0) == 400.0
    assert apply_clipping(600.0) == 500.0


def test_apply_clipping_at_limit():
    assert apply_clipping(TEST_INVERTER_LIMIT, TEST_INVERTER_LIMIT) == TEST_INVERTER_LIMIT


def test_apply_clipping_above_limit():
    assert apply_clipping(600.0, TEST_INVERTER_LIMIT) == TEST_INVERTER_LIMIT
    assert apply_clipping(1000.0, TEST_INVERTER_LIMIT) == TEST_INVERTER_LIMIT
    assert apply_clipping(5000.0, TEST_INVERTER_LIMIT) == TEST_INVERTER_LIMIT


def test_apply_clipping_negative_clamps_to_zero():
    assert apply_clipping(-100.0, TEST_INVERTER_LIMIT) == 0.0
    assert apply_clipping(-0.1, TEST_INVERTER_LIMIT) == 0.0


def test_apply_clipping_none_returns_zero():
    assert apply_clipping(None, TEST_INVERTER_LIMIT) == 0.0


def test_apply_clipping_nan_returns_zero():
    assert apply_clipping(float("nan"), TEST_INVERTER_LIMIT) == 0.0


def test_apply_losses_basic():
    assert apply_losses(500.0, TEST_SYSTEM_LOSSES) == 500.0 * (1.0 - TEST_SYSTEM_LOSSES)
    assert apply_losses(400.0, TEST_SYSTEM_LOSSES) == 400.0 * (1.0 - TEST_SYSTEM_LOSSES)
    assert apply_losses(0.0, TEST_SYSTEM_LOSSES) == 0.0


def test_apply_losses_default_losses():
    assert apply_losses(500.0) == 500.0 * 0.85


def test_apply_losses_negative_clamps_to_zero():
    assert apply_losses(-50.0, TEST_SYSTEM_LOSSES) == 0.0


def test_apply_losses_none_returns_zero():
    assert apply_losses(None, TEST_SYSTEM_LOSSES) == 0.0


def test_apply_losses_nan_returns_zero():
    assert apply_losses(float("nan"), TEST_SYSTEM_LOSSES) == 0.0


def test_calculate_cell_temperature():
    # T_cell = T_amb + (NOCT - 20) * (Irradiance / 800)
    # T_amb=25, NOCT=45, Irradiance=800 -> 25 + (25 * 1.0) = 50.0
    assert calculate_cell_temperature(temp_air=25.0, poa_irradiance=800.0, noct=45.0) == 50.0
    # Zero irradiance -> T_cell = T_amb
    assert calculate_cell_temperature(temp_air=30.0, poa_irradiance=0.0, noct=45.0) == 30.0
    # Negative irradiance -> clamped to 0
    assert calculate_cell_temperature(temp_air=22.0, poa_irradiance=-50.0, noct=45.0) == 22.0


def test_calculate_bifacial_gain():
    # poa * bifaciality * albedo * area_panel
    # 1000 * 0.80 * 0.20 * 2.0 = 320.0 W
    gain = calculate_bifacial_gain(poa_irradiance=1000.0, bifaciality=0.80, area_panel=2.0, albedo=0.20)
    assert pytest.approx(gain, 0.01) == 320.0
    # Zero irradiance
    assert calculate_bifacial_gain(poa_irradiance=0.0) == 0.0
    # Negative irradiance clamped to 0
    assert calculate_bifacial_gain(poa_irradiance=-100.0) == 0.0


def test_calculate_final_ac_power_full_pipeline():
    assert calculate_final_ac_power(600.0, TEST_CONFIG) == TEST_INVERTER_LIMIT * (1.0 - TEST_SYSTEM_LOSSES)
    assert calculate_final_ac_power(400.0, TEST_CONFIG) == 400.0 * (1.0 - TEST_SYSTEM_LOSSES)
    assert calculate_final_ac_power(0.0, TEST_CONFIG) == 0.0


def test_calculate_final_ac_power_without_config():
    # Default without config uses ECOFLOW_MAX_INPUT_WATTS (500) and 0.15 losses
    assert calculate_final_ac_power(600.0) == 500.0 * 0.85
    assert calculate_final_ac_power(400.0) == 400.0 * 0.85
    assert calculate_final_ac_power(0.0) == 0.0


def test_calculate_final_ac_power_edge_cases():
    assert calculate_final_ac_power(-100.0, TEST_CONFIG) == 0.0
    assert calculate_final_ac_power(None, TEST_CONFIG) == 0.0
    assert calculate_final_ac_power(float("nan"), TEST_CONFIG) == 0.0
