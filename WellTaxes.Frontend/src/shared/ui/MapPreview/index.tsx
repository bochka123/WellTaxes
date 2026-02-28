import 'leaflet/dist/leaflet.css';

import { type FC, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

import type { LatLng } from '@/entities/jurisdiction';

const FlyTo: FC<{ position: LatLng }> = ({ position }) => {
    const map = useMap();
    useMemo(() => { map.setView(position, 13, { animate: false }); }, []);
    return null;
};

interface Props {
    position: LatLng;
    height?:  number;
}

const MapPreview: FC<Props> = ({ position, height = 180 }) => (
    <MapContainer
        center={position}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        style={{ height, width: '100%', borderRadius: 8 }}
    >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyTo position={position} />
        <Marker position={position} />
    </MapContainer>
);

export default MapPreview;
