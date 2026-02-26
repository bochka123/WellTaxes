import { useMsal } from '@azure/msal-react';
import { type FC, useEffect } from 'react';

import { msalScopes } from '@/shared/config/msal.ts';
import { getApiToken } from '@/shared/lib/msal/getApiToken.ts';

export const LoginButton: FC = () => {
    const { instance } = useMsal();

    useEffect(() => {
        const fetchToken = async () => {
            const token = await getApiToken();
            console.log('Access token:', token);
        };

        void fetchToken();
    }, []);
    const login = () => {
        void instance.loginPopup({
            scopes: msalScopes,
            prompt: 'select_account'
        });
    };

    return (
        <button onClick={login} className="
            flex items-center justify-center gap-3 w-full
            px-4 py-3 rounded-xl
            border border-zinc-200 bg-white
            text-zinc-700 text-sm font-medium
            shadow-sm
            hover:bg-zinc-50 hover:border-zinc-300
            active:scale-[0.98]
            transition-all duration-150
            hover:cursor-pointer"
        >
            Login with Google / Microsoft
        </button>
    );
};
