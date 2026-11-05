
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getClimateData,
  type ClimateResponse,
} from "./services/nasaService";

interface HealthResponse {
  status: string;
  project: string;
  backend: string;
  message: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [climate, setClimate] = useState<ClimateResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [latitude, setLatitude] = useState("20.2961");
  const [longitude, setLongitude] = useState("85.8245");

  async function loadClimate() {
    setLoading(true);
    setError("");

    try {
      const result = await getClimateData(
        Number(latitude),
        Number(longitude),
        "20250101",
        "20250131"
      );

      setClimate(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load climate data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }
        return response.json();
      })
      .then((result: HealthResponse) => setHealth(result))
      .catch(() => setHealth(null));

    loadClimate();
  }, []);

  const validRecords = climate?.data.filter(
    (item) =>
      item.temperature_c !== null ||
      item.precipitation_mm !== null
  ) ?? [];

  const temperatures = validRecords
    .map((item) => item.temperature_c)
    .filter((value): value is number => value !== null);

  const rainfall = validRecords
    .map((item) => item.precipitation_mm)
    .filter((value): value is number => value !== null);

  const averageTemperature =
    temperatures.length > 0
      ? temperatures.reduce((sum, value) => sum + value, 0) /
        temperatures.length
      : null;

  const totalRainfall =
    rainfall.length > 0
      ? rainfall.reduce((sum, value) => sum + value, 0)
      : null;

  return (
    <main className="min-h-screen bg-green-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-green-900">
            MatiMitra 🌱
          </h1>
          <p className="mt-2 text-gray-600">
            From Space to Soil — Agricultural Intelligence
          </p>
        </header>

        {/* Backend status */}
        <section className="mb-8 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-gray-800">
            Backend Connection
          </h2>

          {health ? (
            <p className="mt-2 text-green-700">
              ✓ {health.message}
            </p>
          ) : (
            <p className="mt-2 text-red-600">
              Backend connection unavailable
            </p>
          )}
        </section>

        {/* Location input */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-green-900">
            Farm Location
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the latitude and longitude of your farm.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="rounded-lg border p-3"
            />

            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="rounded-lg border p-3"
            />

            <button
              onClick={loadClimate}
              disabled={loading}
              className="rounded-lg bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Fetch Climate Data"}
            </button>
          </div>

          {climate && (
            <p className="mt-4 text-sm text-gray-600">
              Showing data for {climate.location.latitude},
              {" "}{climate.location.longitude}
            </p>
          )}

          {error && (
            <p className="mt-3 text-red-600">{error}</p>
          )}
        </section>

        {/* Climate summary */}
        <h2 className="mb-4 text-2xl font-bold text-green-900">
          Earth Intelligence
        </h2>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">Average Temperature</p>
            <h3 className="mt-2 text-3xl font-bold text-green-900">
              {averageTemperature === null
                ? "--"
                : `${averageTemperature.toFixed(2)} °C`}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">Total Precipitation</p>
            <h3 className="mt-2 text-3xl font-bold text-green-900">
              {totalRainfall === null
                ? "--"
                : `${totalRainfall.toFixed(2)} mm`}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-gray-500">Days Retrieved</p>
            <h3 className="mt-2 text-3xl font-bold text-green-900">
              {climate?.total_days ?? "--"}
            </h3>
          </div>
        </div>

        {/* Temperature chart */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-green-900">
            Daily Temperature
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validRecords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={false} />
                <YAxis unit="°C" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature_c"
                  stroke="#15803d"
                  strokeWidth={2}
                  name="Temperature"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Rainfall chart */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-green-900">
            Daily Precipitation
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={validRecords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={false} />
                <YAxis unit=" mm" />
                <Tooltip />
                <Bar
                  dataKey="precipitation_mm"
                  fill="#0d9488"
                  name="Precipitation"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <footer className="mt-8 text-center text-sm text-gray-500">
          Climate data source: NASA POWER · Historical data, January 2025
        </footer>

      </div>
    </main>
  );
}

export default App;
