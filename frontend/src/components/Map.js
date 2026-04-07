import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker ikon javítása (React-Leaflet + Webpack bug workaround)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMap = () => {
  const position = [47.02594, 18.013]; // ⬅️ Állítsd be ide a BSSE székhelyének koordinátáit

  return (
    <MapContainer
      center={position}
      zoom={15}
      className="h-[400px] w-full z-0" 
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={position}>
        <Popup>Balatonalmádi Strand Sport Egyesület</Popup>
      </Marker>
      <div className="pointer-events-none absolute inset-0 z-20 w-full h-[400px]
                  bg-black/80 backdrop-blur-[1px] " />
    </MapContainer>
  );
};

export default LocationMap;