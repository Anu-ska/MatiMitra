
import pandas as pd
import numpy as np


def analyze_climate(climate_data):
    """
    Analyse historical daily climate records
    returned by the NASA POWER API.
    """

    if not climate_data:
        raise ValueError("No climate data available")

    df = pd.DataFrame(climate_data)

    required_columns = [
        "date",
        "temperature_c",
        "precipitation_mm"
    ]

    for column in required_columns:
        if column not in df.columns:
            raise ValueError(f"Missing required column: {column}")

    # Convert values to numeric.
    df["temperature_c"] = pd.to_numeric(
        df["temperature_c"], errors="coerce"
    )

    df["precipitation_mm"] = pd.to_numeric(
        df["precipitation_mm"], errors="coerce"
    )

    # Remove invalid or missing observations.
    valid_temperature = df["temperature_c"].dropna()
    valid_rainfall = df["precipitation_mm"].dropna()

    if valid_temperature.empty or valid_rainfall.empty:
        raise ValueError("Insufficient valid climate observations")

    # Calculate climate statistics.
    average_temperature = float(valid_temperature.mean())
    maximum_temperature = float(valid_temperature.max())
    minimum_temperature = float(valid_temperature.min())

    total_rainfall = float(valid_rainfall.sum())
    average_daily_rainfall = float(valid_rainfall.mean())

    # Calculate the number of days with recorded rainfall.
    rainy_days = int((valid_rainfall > 0).sum())

    return {
        "total_observations": len(df),
        "temperature": {
            "average_c": round(average_temperature, 2),
            "maximum_c": round(maximum_temperature, 2),
            "minimum_c": round(minimum_temperature, 2)
        },
        "rainfall": {
            "total_mm": round(total_rainfall, 2),
            "average_daily_mm": round(average_daily_rainfall, 2),
            "rainy_days": rainy_days
        },
        "data_quality": {
            "valid_temperature_days": len(valid_temperature),
            "valid_rainfall_days": len(valid_rainfall),
            "missing_temperature_days": int(
                df["temperature_c"].isna().sum()
            ),
            "missing_rainfall_days": int(
                df["precipitation_mm"].isna().sum()
            )
        }
    }
