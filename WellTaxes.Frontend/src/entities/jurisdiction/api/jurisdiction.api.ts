import type { Jurisdiction } from '@/entities/jurisdiction';
import { apiClient } from '@/shared/api/client.ts';

export const jurisdictionApi = {
    getJurisdiction: (): Promise<any> =>
        apiClient.get<any>('/Jurisdiction/Get'),
    stream: (onChunk: (zones: Jurisdiction[]) => void, onDone: () => void, signal?: AbortSignal) =>
        apiClient.stream<Jurisdiction>('/Jurisdictions/Stream', onChunk, onDone, signal),
};
