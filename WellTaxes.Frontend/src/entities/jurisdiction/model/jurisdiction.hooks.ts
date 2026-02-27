import { useQuery } from '@tanstack/react-query';

import { jurisdictionApi } from '@/entities/jurisdiction/api/jurisdiction.api.ts';

export const useJurisdiction = () =>
    useQuery({
        queryKey: ['jurisdiction'] as const,
        queryFn:  () => jurisdictionApi.getJurisdiction(),
    });

