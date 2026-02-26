import { InteractionRequiredAuthError } from '@azure/msal-browser';

import { msalInstance, msalScopes } from '@/shared/config/msal.ts';

export async function getApiToken(): Promise<string | null> {
    await msalInstance.initialize();
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length === 0) {
        try {
            // await msalInstance.loginRedirect({ scopes: msalScopes });
            return null;
        } catch (err) {
            console.error('Login failed:', err);
            return null;
        }
    }

    const request = {
        scopes: msalScopes,
        account: accounts[0],
    };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
            try {
                const response = await msalInstance.acquireTokenPopup(request);
                return response.accessToken;
            } catch (popupErr) {
                console.error('Popup token acquisition failed:', popupErr);
                return null;
            }
        } else {
            console.error('Token acquisition failed:', err);
            return null;
        }
    }
}
