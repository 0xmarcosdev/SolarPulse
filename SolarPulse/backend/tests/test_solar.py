import math

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.solar import (
    ECOFLOW_MAX_INPUT_WATTS,
    SYSTEM_LOSS_FACTOR,
    apply_clipping,
    apply_losses,
    calculate_final_ac_power,
)


def test_apply_clipping_below_limit():
    assert apply_clipping(300.0) == 300.0
    assert apply_clipping(0.0) == 0.0
    assert apply_clipping(499.9) == 499.9


def test_apply_clipping_at_limit():
    assert apply_clipping(ECOFLOW_MAX_INPUT_WATTS) == ECOFLOW_MAX_INPUT_WATTS


def test_apply_clipping_above_limit():
    assert apply_clipping(600.0) == ECOFLOW_MAX_INPUT_WATTS
    assert apply_clipping(1000.0) == ECOFLOW_MAX_INPUT_WATTS
    assert apply_clipping(5000.0) == ECOFLOW_MAX_INPUT_WATTS


def test_apply_clipping_negative_clamps_to_zero():
    assert apply_clipping(-100.0) == 0.0
    assert apply_clipping(-0.1) == 0.0


def test_apply_clipping_none_returns_zero():
    assert apply_clipping(None) == 0.0


def test_apply_clipping_nan_returns_zero():
    assert apply_clipping(float("nan")) == 0.0


def test_apply_losses_basic():
    assert apply_losses(500.0) == 500.0 * SYSTEM_LOSS_FACTOR
    assert apply_losses(400.0) == 400.0 * SYSTEM_LOSS_FACTOR
    assert apply_losses(0.0) == 0.0


def test_apply_losses_negative_clamps_to_zero():
    assert apply_losses(-50.0) == 0.0


def test_apply_losses_none_returns_zero():
    assert apply_losses(None) == 0.0


def test_apply_losses_nan_returns_zero():
    assert apply_losses(float("nan")) == 0.0


def test_calculate_final_ac_power_full_pipeline():
    assert calculate_final_ac_power(600.0) == ECOFLOW_MAX_INPUT_WATTS * SYSTEM_LOSS_FACTOR
    assert calculate_final_ac_power(400.0) == 400.0 * SYSTEM_LOSS_FACTOR
    assert calculate_final_ac_power(0.0) == 0.0


def test_calculate_final_ac_power_edge_cases():
    assert calculate_final_ac_power(-100.0) == 0.0
    assert calculate_final_ac_power(None) == 0.0
    assert calculate_final_ac_power(float("nan")) == 0.0


def test_constants_values():
    assert ECOFLOW_MAX_INPUT_WATTS == 500.0
    assert SYSTEM_LOSS_FACTOR == 0.85