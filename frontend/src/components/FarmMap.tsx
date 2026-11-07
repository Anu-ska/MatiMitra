
import { useMapEvents, MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface FarmMapProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  latitude: number;
  longitude: number;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationSelect(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

function FarmMap({
  onLocationSelect,
  latitude,
  longitude,
}: FarmMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-green-200 shadow">
      <MapContainer
        center={[20.2961, 85.8245]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "420px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onLocationSelect={onLocationSelect}
        />

        <CircleMarker
          center={[latitude, longitude]}
          radius={9}
          pathOptions={{
            color: "#14532d",
            fillColor: "#22c55e",
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <strong>Selected Farm Location</strong>
            <br />
            Latitude: {latitude.toFixed(4)}
            <br />
            Longitude: {longitude.toFixed(4)}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}

export default FarmMap;
