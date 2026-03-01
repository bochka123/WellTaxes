import { type Configuration, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig: Configuration = {
    auth: {
        clientId: 'c8ea19e7-1732-457b-9f81-524a7ed404ed',
        authority: 'https://login.microsoftonline.com/c66d3a69-d073-4c26-8aa2-29ffb701d00f',
        redirectUri: window.location.origin,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: 'localStorage',
    },
    system: {
        allowPlatformBroker: false,
    }
};

export const msalScopes = [
    'offline_access',
    'api://c8ea19e7-1732-457b-9f81-524a7ed404ed/access'
];
export const msalInstance = new PublicClientApplication(msalConfig);
