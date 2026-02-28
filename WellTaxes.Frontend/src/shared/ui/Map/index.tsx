import 'leaflet/dist/leaflet.css';

import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { LatLngBounds, type LeafletMouseEvent } from 'leaflet';
import { type FC, useMemo } from 'react';
import { GeoJSON, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

import type { LatLng } from '@/entities/jurisdiction';

interface Props {
    picked: LatLng | null;
    onPick: (p: LatLng) => void;
    nyGeoJson: GeoJSON.GeoJsonObject | null;
}

const BASE_BOUNDS = new LatLngBounds(
    [39.5, -81.0],  // Southwest corner
    [46.0, -70.5],  // Northeast corner
);

function ClickToPick({
    onPick,
    nyGeoJson,
}: {
    onPick: (p: LatLng) => void;
    nyGeoJson: GeoJSON.GeoJsonObject | null;
}): null {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            const pt = point([e.latlng.lng, e.latlng.lat]);
            if (nyGeoJson && !booleanPointInPolygon(pt, nyGeoJson as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>)) {
                return;
            }
            onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

const Map: FC<Props> = ({ picked, onPick, nyGeoJson }) => {
    const center = useMemo<LatLng>(() => ({ lat: 42.5, lng: -74.5 }), []);

    return (
        <MapContainer
            center={center}
            zoom={7}
            maxBounds={BASE_BOUNDS}
            maxBoundsViscosity={1}
            minZoom={7}
            style={{ height: '100%', width: '100%', borderRadius: 6 }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <ClickToPick onPick={onPick} nyGeoJson={nyGeoJson} />
            {nyGeoJson && (
                <GeoJSON
                    data={nyGeoJson}
                    style={{
                        color: '#3b82f6',
                        weight: 2,
                        fillColor: '#bfdbfe',
                        fillOpacity: 0.15,
                    }}
                />
            )}
            {picked && <Marker position={picked}/>}
        </MapContainer>
    );
};

export default Map;
