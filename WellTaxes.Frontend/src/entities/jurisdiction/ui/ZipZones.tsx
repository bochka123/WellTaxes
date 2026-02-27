import type { Feature } from 'geojson';
import L from 'leaflet';
import { type FC, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

import { type LatLng, useJurisdictionStream } from '@/entities/jurisdiction';

interface Props {
    picked: LatLng | null;
}


const ZipZones: FC<Props> = ({ picked }) => {
    const map = useMap();
    const canvasRef = useRef<L.Canvas>(L.canvas());
    const { zones, done } = useJurisdictionStream();
    const layerRef = useRef<L.GeoJSON | null>(null);
    const totalRef = useRef(0);
    
    useEffect(() => {
        const newZones = zones.slice(totalRef.current);
        if (!newZones.length) return;
        
        if (!layerRef.current) {
            layerRef.current = L.geoJSON(undefined, {
                ...(({ renderer: canvasRef.current }) as object),
                style: {
                    fillColor:   '#cbd5e1',
                    fillOpacity: 0.2,
                    color:       '#94a3b8',
                    weight:      1,
                },
                onEachFeature(feature, fl) {
                    fl.bindTooltip(
                        `
                            <span style="font-size:12px;font-weight:600">${feature.properties.name}</span> 
                            <span style="font-size:11px;color:#94a3b8;margin-left:4px">ZIP ${feature.properties.zipCode}</span>
                        `,
                        { sticky: true }
                    );
                },
            }).addTo(map);
        }
        
        for (const zone of newZones) {
            try {
                layerRef.current.addData({
                    type:       'Feature',
                    properties: { zipCode: zone.zipCode, name: zone.name },
                    geometry:   JSON.parse(zone.geometryJson),
                } as Feature);
            } catch { 
                /* Broken */
            }
        }

        totalRef.current = zones.length;
    }, [zones, map]);
    
    useEffect(() => {
        if (!layerRef.current) return;

        layerRef.current.setStyle({
            fillColor: '#cbd5e1', fillOpacity: 0.2, color: '#94a3b8', weight: 1,
        });

        if (!picked) return;

        layerRef.current.eachLayer((fl) => {
            const path = fl as L.Path & { getBounds?: () => L.LatLngBounds };
            if (path.getBounds?.().contains([picked.lat, picked.lng])) {
                (path as L.Path).setStyle({
                    fillColor: '#63aeff', fillOpacity: 0.4, color: '#1d4ed8', weight: 2,
                });
            }
        });
    }, [picked]);

    useEffect(() => {
        return () => { layerRef.current?.removeFrom(map); };
    }, [map]);

    if (!done) {
        return (
            <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1000, pointerEvents: 'none' }}>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-xs text-zinc-600 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 border-t-[#63aeff] animate-spin shrink-0" />
                    <span>Завантаження зон... {zones.length}</span>
                </div>
            </div>
        );
    }

    return null;
};

export default ZipZones;
