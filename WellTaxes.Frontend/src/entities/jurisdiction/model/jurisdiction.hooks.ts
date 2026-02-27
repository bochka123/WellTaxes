import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import type { Jurisdiction } from '@/entities/jurisdiction';
import { jurisdictionApi } from '@/entities/jurisdiction/api/jurisdiction.api.ts';

export const useJurisdiction = () =>
    useQuery({
        queryKey: ['jurisdiction'] as const,
        queryFn:  () => jurisdictionApi.getJurisdiction(),
    });

interface StreamState {
    zones:    Jurisdiction[];
    done:     boolean;
    error:    Error | null;
}

export const useJurisdictionStream = (): StreamState => {
    const [state, setState] = useState<StreamState>({ zones: [], done: false, error: null });
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        abortRef.current = new AbortController();

        jurisdictionApi.stream(
            // onChunk
            (batch) => {
                setState((prev) => ({ ...prev, zones: [...prev.zones, ...batch]}));
            },
            // onDone
            () => {
                setState((prev) => ({ ...prev, done: true }));
            },
            abortRef.current.signal
        ).catch((err) => {
            if (err.name === 'AbortError') return; // нормальне скасування
            setState((prev) => ({ ...prev, error: err, done: true }));
        });

        return () => { abortRef.current?.abort(); };
    }, []);

    return state;
};
