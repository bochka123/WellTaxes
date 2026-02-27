import { apiClient } from '@/shared/api/client.ts';

export const jurisdictionApi = {
    getJurisdiction: (): Promise<any> =>
        apiClient.get<any>('/Jurisdiction/Get'),
};
