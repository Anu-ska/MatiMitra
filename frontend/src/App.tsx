
import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  project: string;
  backend: string;
  message: string;
}

function App() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend request failed");
        }
        return response.json();
      })
      .then((result: HealthResponse) => {
        setData(result);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <main className="min-h-screen bg-green-50 p-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold text-green-900">
          MatiMitra 🌱
        </h1>

        <p className="mt-3 text-gray-600">
          From Space to Soil
        </p>

        <div className="mt-8 rounded-xl bg-green-50 p-6">
          <h2 className="text-xl font-semibold">
            Backend Connection Status
          </h2>

          {data ? (
            <div className="mt-4 text-green-800">
              <p>✅ Connected successfully!</p>
              <p>Project: {data.project}</p>
              <p>Backend: {data.backend}</p>
              <p>Status: {data.status}</p>
              <p>{data.message}</p>
            </div>
          ) : error ? (
            <p className="mt-4 text-red-600">
              ❌ Connection failed: {error}
            </p>
          ) : (
            <p className="mt-4 text-gray-500">
              Connecting to MatiMitra backend...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
