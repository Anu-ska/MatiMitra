
import { useState } from "react";
import axios from "axios";

interface FarmProfileProps {
  latitude: number;
  longitude: number;
}

function FarmProfile({ latitude, longitude }: FarmProfileProps) {
  const [form, setForm] = useState({
    farm_name: "",
    soil_type: "",
    previous_crops: "",
    irrigation_method: "",
    drainage: "",
    soil_ph: "",
    soil_test_available: false,
    farm_area_hectares: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm({
        ...form,
        [target.name]: target.checked,
      });
    } else {
      setForm({
        ...form,
        [target.name]: target.value,
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        farm_name: form.farm_name,
        latitude,
        longitude,
        soil_type: form.soil_type,
        previous_crops: form.previous_crops
          .split(",")
          .map((crop) => crop.trim())
          .filter(Boolean),
        irrigation_method: form.irrigation_method,
        drainage: form.drainage,
        soil_ph: form.soil_ph === "" ? null : Number(form.soil_ph),
        soil_test_available: form.soil_test_available,
        farm_area_hectares:
          form.farm_area_hectares === ""
            ? null
            : Number(form.farm_area_hectares),
      };

      const response = await axios.post(
        "http://localhost:8000/api/farms",
        payload
      );

      setMessage(
        `Farm profile saved successfully! Farm ID: ${response.data.farm.farm_id}`
      );

      setForm({
        farm_name: "",
        soil_type: "",
        previous_crops: "",
        irrigation_method: "",
        drainage: "",
        soil_ph: "",
        soil_test_available: false,
        farm_area_hectares: "",
      });
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : "Unable to save farm profile."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-700";

  return (
    <section className="mb-8 rounded-2xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold text-green-900">
        Farm Profile 🌾
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Tell us about your farm, soil and agricultural practices.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Farm Name
          </label>
          <input
            name="farm_name"
            value={form.farm_name}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter farm name"
            minLength={2}
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Soil Type
            </label>
            <select
              name="soil_type"
              value={form.soil_type}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select soil type</option>
              <option value="Alluvial">Alluvial</option>
              <option value="Black">Black soil</option>
              <option value="Red">Red soil</option>
              <option value="Laterite">Laterite</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Loamy">Loamy</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Farm Area (hectares)
            </label>
            <input
              type="number"
              name="farm_area_hectares"
              value={form.farm_area_hectares}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. 2.5"
              min="0.01"
              step="any"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Previous Crops
          </label>
          <input
            name="previous_crops"
            value={form.previous_crops}
            onChange={handleChange}
            className={inputClass}
            placeholder="Rice, Wheat, Maize"
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate multiple crops with commas.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Irrigation Method
            </label>
            <select
              name="irrigation_method"
              value={form.irrigation_method}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select irrigation method</option>
              <option value="Rainfed">Rainfed</option>
              <option value="Canal">Canal</option>
              <option value="Drip">Drip</option>
              <option value="Sprinkler">Sprinkler</option>
              <option value="Borewell">Borewell</option>
              <option value="Mixed">Mixed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Drainage Condition
            </label>
            <select
              name="drainage"
              value={form.drainage}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select drainage</option>
              <option value="Good">Good</option>
              <option value="Moderate">Moderate</option>
              <option value="Poor">Poor</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Soil pH (optional)
            </label>
            <input
              type="number"
              name="soil_ph"
              value={form.soil_ph}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. 6.5"
              min="0"
              max="14"
              step="0.1"
            />
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              type="checkbox"
              name="soil_test_available"
              checked={form.soil_test_available}
              onChange={handleChange}
              className="h-5 w-5 accent-green-800"
            />
            <label className="text-sm text-gray-700">
              I have a soil test report / Soil Health Card
            </label>
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="font-medium text-green-900">
            Selected Farm Coordinates
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Latitude: {latitude}
          </p>
          <p className="text-sm text-gray-700">
            Longitude: {longitude}
          </p>
        </div>

        {message && (
          <p className="break-words rounded-lg bg-green-100 p-3 text-sm text-green-800">
            {message}
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900 disabled:opacity-50"
        >
          {loading ? "Saving Farm Profile..." : "Save Farm Profile"}
        </button>
      </form>
    </section>
  );
}

export default FarmProfile;
