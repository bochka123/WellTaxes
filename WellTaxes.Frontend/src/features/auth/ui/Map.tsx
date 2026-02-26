import 'leaflet/dist/leaflet.css';

import { type LeafletMouseEvent } from 'leaflet';
import { type FC, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

export type LatLng = { lat: number; lng: number };

type Props = {
  picked: LatLng | null;
  onPick: (p: LatLng) => void;
  height?: number;
};

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }): null {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const Map: FC<Props> = ({ picked, onPick, height = 450 }) => {
  const center = useMemo<LatLng>(() => ({ lat: 42.147285, lng: -76.750888 }), []);

  return (
    <MapContainer center={center} zoom={9} style={{ height, width: '100%', borderRadius: 6 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickToPick onPick={onPick} />
      {picked && <Marker position={picked} />}
    </MapContainer>
  );
};

export default Map;
