import type { FC } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';

import { type Jurisdiction, type LatLng, useJurisdiction } from '@/entities/jurisdiction';

interface Props {
    picked:   LatLng | null;
    // onPick:   (p: LatLng) => void;
    // height?:  number;
}

const ZipZones: FC<Props> = ({ picked }) => {
    const { data: zones = []} = useJurisdiction();

    return (
        <>
            {zones.map((zone: Jurisdiction) => {
                let geo;
                try { geo = JSON.parse(zone.geometryJson); } catch { return null; }

                const feature = {
                    type:       'Feature' as const,
                    properties: { zipCode: zone.zipCode, name: zone.name },
                    geometry:   geo,
                };

                const coords = geo.coordinates.flat(3) as number[];
                const lngs   = coords.filter((_: number, i: number) => i % 2 === 0);
                const lats   = coords.filter((_: number, i: number) => i % 2 === 1);
                const isInside = picked
                    ? picked.lng >= Math.min(...lngs) && picked.lng <= Math.max(...lngs) &&
                    picked.lat >= Math.min(...lats) && picked.lat <= Math.max(...lats)
                    : false;

                return (
                    <GeoJSON
                        key={zone.zipCode}
                        data={feature}
                        style={{
                            fillColor:   isInside ? '#63aeff' : '#cbd5e1',
                            fillOpacity: isInside ? 0.4 : 0.2,
                            color:       isInside ? '#1d4ed8' : '#94a3b8',
                            weight:      isInside ? 2 : 1,
                        }}
                    >
                        <Tooltip sticky>
                            <span className="text-xs font-medium">{zone.name}</span>
                            <span className="text-xs text-zinc-400 ml-1">ZIP {zone.zipCode}</span>
                        </Tooltip>
                    </GeoJSON>
                );
            })}
        </>
    );
};

export default ZipZones;
