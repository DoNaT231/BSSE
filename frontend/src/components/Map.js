import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker ikon javítása (React-Leaflet + Webpack bug workaround)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const LocationMap = () => {
  const position = [47.02594, 18.013]; // ⬅️ Állítsd be ide a BSSE székhelyének koordinátáit

  return (
    <div className="group relative z-0 h-[400px] w-full overflow-hidden">
      <MapContainer
        center={position}
        zoom={15}
        className="h-full w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Balatonalmádi Strand Sport Egyesület</Popup>
        </Marker>
      </MapContainer>
      {/* Alapból erősen sötétítve; kurzorral a térképre húzva eltűnik (teljes fény + interakció) */}
      <div
        className="
          pointer-events-none absolute inset-0 z-[1000] bg-black/72
          transition-[opacity,background-color] duration-500 ease-out
          group-hover:opacity-0
        "
        aria-hidden
      />
    </div>
  );
};

export default LocationMap;
