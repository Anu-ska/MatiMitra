
import sqlite3
import json
from pathlib import Path

# Locate the backend folder and create a data directory
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# SQLite database file
DB_PATH = DATA_DIR / "matimitra.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the farms table if it doesn't already exist."""
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS farms (
                farm_id TEXT PRIMARY KEY,
                farm_name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                soil_type TEXT NOT NULL,
                previous_crops TEXT,
                irrigation_method TEXT NOT NULL,
                drainage TEXT NOT NULL,
                soil_ph REAL,
                soil_test_available INTEGER NOT NULL,
                farm_area_hectares REAL
            )
        """)


def save_farm(farm_data):
    """Save a new farm profile."""
    with get_connection() as connection:
        connection.execute("""
            INSERT INTO farms (
                farm_id, farm_name, latitude, longitude,
                soil_type, previous_crops, irrigation_method,
                drainage, soil_ph, soil_test_available,
                farm_area_hectares
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            farm_data["farm_id"],
            farm_data["farm_name"],
            farm_data["latitude"],
            farm_data["longitude"],
            farm_data["soil_type"],
            json.dumps(farm_data["previous_crops"]),
            farm_data["irrigation_method"],
            farm_data["drainage"],
            farm_data["soil_ph"],
            int(farm_data["soil_test_available"]),
            farm_data["farm_area_hectares"]
        ))


def convert_row(row):
    """Convert a database row into a normal Python dictionary."""
    farm = dict(row)
    farm["previous_crops"] = json.loads(farm["previous_crops"] or "[]")
    farm["soil_test_available"] = bool(farm["soil_test_available"])
    return farm


def get_all_farms():
    """Retrieve all saved farm profiles."""
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM farms ORDER BY rowid DESC"
        ).fetchall()

    return [convert_row(row) for row in rows]


def get_farm_by_id(farm_id):
    """Retrieve one farm profile using its ID."""
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM farms WHERE farm_id = ?",
            (farm_id,)
        ).fetchone()

    return convert_row(row) if row else None
