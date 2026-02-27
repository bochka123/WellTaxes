import { useMsal } from '@azure/msal-react';
import { type FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { msalScopes } from '@/shared/config/msal.ts';
import { getApiToken } from '@/shared/lib/msal/getApiToken.ts';

export const LoginButton: FC = () => {
    const { instance } = useMsal();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchToken = async (): Promise<void> => {
            await getApiToken();
        };

        void fetchToken();
    }, []);
    const login = (): void => {
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
            {t('auth.loginButton')}
        </button>
    );
};
