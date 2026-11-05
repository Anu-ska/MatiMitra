import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.services.nasa_power import get_climate_data

app = FastAPI(
    title="MatiMitra API",
    description="NASA-powered agricultural decision support system",
    version="1.0.0"
)

# Allow the React frontend to access our backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to MatiMitra!",
        "project": "MatiMitra",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "MatiMitra",
        "backend": "FastAPI",
        "message": "Backend is working successfully!"
    }


@app.get("/api/nasa/climate")
def nasa_climate(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    start_date: str = Query(..., pattern=r"^\d{8}$"),
    end_date: str = Query(..., pattern=r"^\d{8}$")
):
    try:
        df = get_climate_data(
            latitude,
            longitude,
            start_date,
            end_date
        )

        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "total_days": len(df),
            "data": df.where(df.notna(), None).to_dict(
                orient="records"
            )
        }

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve data from NASA POWER."
        )

    except ValueError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error)
        )
