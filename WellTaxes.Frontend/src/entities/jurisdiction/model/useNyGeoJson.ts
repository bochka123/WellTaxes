import type { GeoJsonObject } from 'geojson';
import { useEffect, useState } from 'react';

const NY_GEOJSON_URL =
    'https://raw.githubusercontent.com/glynnbird/usstatesgeojson/master/new%20york.geojson';

export function useNyGeoJson(): GeoJsonObject | null {
    const [nyGeoJson, setNyGeoJson] = useState<GeoJsonObject | null>(null);

    useEffect(() => {
        fetch(NY_GEOJSON_URL)
            .then((res) => res.json())
            .then((data) => setNyGeoJson(data))
            .catch(console.error);
    }, []);

    return nyGeoJson;
}
