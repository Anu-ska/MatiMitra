
from app.analysis.climate_analysis import analyze_climate

sample_data = [
    {
        "date": "20250101",
        "temperature_c": 17.43,
        "precipitation_mm": 0.0
    },
    {
        "date": "20250102",
        "temperature_c": 17.02,
        "precipitation_mm": 0.0
    },
    {
        "date": "20250103",
        "temperature_c": 16.11,
        "precipitation_mm": 0.0
    }
]

result = analyze_climate(sample_data)

print("MATIMITRA CLIMATE ANALYSIS")
print("==========================")

print("Average temperature:",
      result["temperature"]["average_c"], "°C")

print("Maximum temperature:",
      result["temperature"]["maximum_c"], "°C")

print("Minimum temperature:",
      result["temperature"]["minimum_c"], "°C")

print("Total rainfall:",
      result["rainfall"]["total_mm"], "mm")

print("Rainy days:",
      result["rainfall"]["rainy_days"])
