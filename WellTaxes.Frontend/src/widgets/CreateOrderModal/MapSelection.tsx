import { type FC, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { GeoJSON } from 'react-leaflet';

import { type LatLng } from '@/entities/jurisdiction';
import Spinner from '@/shared/ui/Spinner';

import { type FormErrors } from './validation';

const Map = lazy(() => import('@/shared/ui/Map'));

interface Props {
    picked:    LatLng | null;
    nyGeoJson: GeoJSON.GeoJsonObject | null;
    touched:   Partial<Record<keyof FormErrors, boolean>>;
    error?:    string;
    onPick:    (p: LatLng) => void;
}

const MapSection: FC<Props> = ({ picked, nyGeoJson, touched, error, onPick }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full sm:w-[55%] sm:min-w-0">
            <div className="h-60 sm:h-full min-h-60 rounded-xl overflow-hidden border border-zinc-100">
                <Suspense fallback={<Spinner />}>
                    <Map
                        picked={picked}
                        onPick={onPick}
                        nyGeoJson={nyGeoJson}
                    />
                </Suspense>
            </div>
            {touched.picked && error && (
                <p className="text-[11px] text-red-400 mt-1">{t(error)}</p>
            )}
        </div>
    );
};

export default MapSection;
