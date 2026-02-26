import { MsalProvider } from '@azure/msal-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, ReactNode } from 'react';

import { msalInstance } from '@/shared/config/msal.ts';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, staleTime: 1000 * 60 * 5 },
    },
});

type ProvidersProps = {
    children: ReactNode;
};

export const Providers: FC<ProvidersProps> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    </QueryClientProvider>
);
