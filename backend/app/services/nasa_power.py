
import requests
import pandas as pd


NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"


def get_climate_data(latitude, longitude, start_date, end_date):
    """
    Fetch daily temperature and precipitation data
    from NASA POWER for a given location.
    """

    params = {
        "parameters": "T2M,PRECTOTCORR",
        "community": "AG",
        "longitude": longitude,
        "latitude": latitude,
        "start": start_date,
        "end": end_date,
        "format": "JSON",
        "time-standard": "UTC"
    }

    response = requests.get(
        NASA_POWER_URL,
        params=params,
        timeout=30
    )

    response.raise_for_status()

    data = response.json()

    climate_parameters = (
        data.get("properties", {})
        .get("parameter", {})
    )

    temperature = climate_parameters.get("T2M", {})
    precipitation = climate_parameters.get("PRECTOTCORR", {})

    if not temperature:
        raise ValueError("NASA POWER returned no temperature data.")

    # Convert the NASA response into a Pandas DataFrame.
    dates = sorted(temperature.keys())

    df = pd.DataFrame({
        "date": dates,
        "temperature_c": [
            temperature.get(date, -999) for date in dates
        ],
        "precipitation_mm": [
            precipitation.get(date, -999) for date in dates
        ]
    })

    # NASA POWER uses -999 as a missing-data value.
    df = df.replace(-999, float("nan"))

    return df
