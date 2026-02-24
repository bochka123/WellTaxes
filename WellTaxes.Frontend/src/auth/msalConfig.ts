import { PublicClientApplication } from "@azure/msal-browser";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: "c8ea19e7-1732-457b-9f81-524a7ed404ed",
        authority: "https://login.microsoftonline.com/c66d3a69-d073-4c26-8aa2-29ffb701d00f",
        redirectUri: window.location.origin,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    }
};

export const msalScopes = ["api://c8ea19e7-1732-457b-9f81-524a7ed404ed/access"];
export const msalInstance = new PublicClientApplication(msalConfig);



export async function getApiToken(): Promise<string | null> {
    await msalInstance.initialize();
    const accounts = msalInstance.getAllAccounts();
    
    if (accounts.length === 0) {
        try {
            await msalInstance.loginRedirect({ scopes: msalScopes });
        return null;
        } catch (err) {
            console.error("Login failed:", err);
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
                console.error("Popup token acquisition failed:", popupErr);
                return null;
            }
        } else {
            console.error("Token acquisition failed:", err);
            return null;
        }
    }
}
