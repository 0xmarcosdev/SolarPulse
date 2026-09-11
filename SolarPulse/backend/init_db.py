"""Initialize the SQLite database and create all tables."""

import models
from database import Base, engine, SessionLocal
from models import SystemConfig


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    
    # Initialize SystemConfig if empty
    db = SessionLocal()
    if not db.query(SystemConfig).first():
        config = SystemConfig()
        db.add(config)
        db.commit()
        print("SystemConfig initialized with default values.")
    db.close()
    
    print("Database initialized successfully at ./solarpulse.db")


if __name__ == "__main__":
    init_db()
