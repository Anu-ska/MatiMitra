import uuid

import requests
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.database import init_db, save_farm, get_all_farms, get_farm_by_id
from app.services.nasa_power import get_climate_data
from app.analysis.climate_analysis import analyze_climate   


app = FastAPI(
    title="MatiMitra API",
    description="NASA-powered agricultural decision support system",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    init_db()
@app.on_event("startup")
def startup_event():
    init_db()
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

# Farm Profile data model
class FarmProfile(BaseModel):
    farm_name: str = Field(min_length=2, max_length=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    soil_type: str
    previous_crops: list[str] = Field(default_factory=list)
    irrigation_method: str
    drainage: str

    soil_ph: float | None = Field(default=None, ge=0, le=14)
    soil_test_available: bool = False

    farm_area_hectares: float | None = Field(
        default=None,
        gt=0
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


# NASA POWER climate endpoint
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
    
@app.get("/api/climate/analysis")
def climate_analysis(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str
):
    try:
        climate_data = get_climate_data(
            latitude,
            longitude,
            start_date,
            end_date
        )

        analysis = analyze_climate(climate_data)

        return {
            "success": True,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "analysis": analysis
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve climate data from NASA POWER"
        )


@app.post("/api/farms")
def create_farm(profile: FarmProfile):
    farm_id = str(uuid.uuid4())

    farm_data = profile.model_dump()
    farm_data["farm_id"] = farm_id

    save_farm(farm_data)

    return {
        "success": True,
        "message": "Farm profile saved successfully",
        "farm": farm_data
    }


@app.get("/api/farms")
def list_farms():
    saved_farms = get_all_farms()

    return {
        "count": len(saved_farms),
        "farms": saved_farms
    }


@app.get("/api/farms/{farm_id}")
def retrieve_farm(farm_id: str):
    farm = get_farm_by_id(farm_id)

    if farm is None:
        raise HTTPException(
            status_code=404,
            detail="Farm not found"
        )

    return farm
