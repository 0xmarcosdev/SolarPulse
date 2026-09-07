"""Initialize the SQLite database and create all tables."""

import models  # noqa: F401
from database import Base, engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully at ./solarpulse.db")


if __name__ == "__main__":
    init_db()
