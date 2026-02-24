import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { GoogleOAuthProvider } from '@react-oauth/google';
import type { FC, ReactNode } from 'react';

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
        {/*<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>*/}
            {children}
        {/*</GoogleOAuthProvider>*/}
    </QueryClientProvider>
);
