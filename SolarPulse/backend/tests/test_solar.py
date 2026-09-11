import math

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models import SystemConfig
from services.solar import (
    apply_clipping,
    apply_losses,
    calculate_final_ac_power,
)

# Constants for testing
TEST_INVERTER_LIMIT = 500.0
TEST_SYSTEM_LOSSES = 0.15
TEST_CONFIG = SystemConfig(inverter_limit=TEST_INVERTER_LIMIT, system_losses=TEST_SYSTEM_LOSSES)


def test_apply_clipping_below_limit():
    assert apply_clipping(300.0, TEST_INVERTER_LIMIT) == 300.0
    assert apply_clipping(0.0, TEST_INVERTER_LIMIT) == 0.0
    assert apply_clipping(499.9, TEST_INVERTER_LIMIT) == 499.9


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


def test_apply_losses_negative_clamps_to_zero():
    assert apply_losses(-50.0, TEST_SYSTEM_LOSSES) == 0.0


def test_apply_losses_none_returns_zero():
    assert apply_losses(None, TEST_SYSTEM_LOSSES) == 0.0


def test_apply_losses_nan_returns_zero():
    assert apply_losses(float("nan"), TEST_SYSTEM_LOSSES) == 0.0


def test_calculate_final_ac_power_full_pipeline():
    assert calculate_final_ac_power(600.0, TEST_CONFIG) == TEST_INVERTER_LIMIT * (1.0 - TEST_SYSTEM_LOSSES)
    assert calculate_final_ac_power(400.0, TEST_CONFIG) == 400.0 * (1.0 - TEST_SYSTEM_LOSSES)
    assert calculate_final_ac_power(0.0, TEST_CONFIG) == 0.0


def test_calculate_final_ac_power_edge_cases():
    assert calculate_final_ac_power(-100.0, TEST_CONFIG) == 0.0
    assert calculate_final_ac_power(None, TEST_CONFIG) == 0.0
    assert calculate_final_ac_power(float("nan"), TEST_CONFIG) == 0.0
