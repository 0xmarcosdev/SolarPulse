import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from database import Base, SessionLocal, engine
from models import SystemConfig


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Reset SystemConfig table for a clean test
    db.query(SystemConfig).delete()
    default_cfg = SystemConfig(
        panel_model="RUNERGY HY-DH144N8-585",
        pmax_stc=585.0,
        temp_coeff_pmax=-0.0029,
        noct=45.0,
        bifaciality=0.80,
        system_losses=0.15,
        inverter_limit=500.0,
    )
    db.add(default_cfg)
    db.commit()
    db.close()
    yield


def test_get_system_config_success():
    client = TestClient(app)
    response = client.get("/api/v1/system-config")
    assert response.status_code == 200
    data = response.json()
    assert data["panel_model"] == "RUNERGY HY-DH144N8-585"
    assert data["pmax_stc"] == 585.0
    assert data["temp_coeff_pmax"] == -0.0029
    assert data["noct"] == 45.0
    assert data["bifaciality"] == 0.80
    assert data["system_losses"] == 0.15
    assert data["inverter_limit"] == 500.0


def test_get_system_config_auto_initializes_when_empty():
    db = SessionLocal()
    db.query(SystemConfig).delete()
    db.commit()
    db.close()

    client = TestClient(app)
    response = client.get("/api/v1/system-config")
    assert response.status_code == 200
    data = response.json()
    assert data["panel_model"] == "RUNERGY HY-DH144N8-585"
    assert data["pmax_stc"] == 585.0


def test_update_system_config_success():
    client = TestClient(app)
    update_payload = {
        "bifaciality": 0.65,
        "inverter_limit": 480.0,
    }
    response = client.put("/api/v1/system-config", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["bifaciality"] == 0.65
    assert data["inverter_limit"] == 480.0
    # Other fields remain unchanged
    assert data["panel_model"] == "RUNERGY HY-DH144N8-585"
    assert data["pmax_stc"] == 585.0


def test_update_system_config_validation_error():
    client = TestClient(app)
    # Bifaciality must be between 0 and 1
    invalid_payload = {
        "bifaciality": 1.5,
    }
    response = client.put("/api/v1/system-config", json=invalid_payload)
    assert response.status_code == 422
