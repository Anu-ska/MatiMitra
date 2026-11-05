
export interface ClimateRecord {
  date: string;
  temperature_c: number | null;
  precipitation_mm: number | null;
}

export interface ClimateResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  period: {
    start_date: string;
    end_date: string;
  };
  total_days: number;
  data: ClimateRecord[];
}

export async function getClimateData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<ClimateResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(
    `http://localhost:8000/api/nasa/climate?${params}`
  );

  if (!response.ok) {
    throw new Error(`Climate API error: ${response.status}`);
  }

  return response.json();
}
