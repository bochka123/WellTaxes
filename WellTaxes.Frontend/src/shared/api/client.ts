import { msalInstance } from '@/shared/config/msal.ts';
import { getApiToken } from '@/shared/lib/msal/getApiToken.ts';

const BASE_URL = import.meta.env.VITE_API_URL;

const isFormData = (v: unknown): v is FormData =>
    typeof FormData !== 'undefined' && v instanceof FormData;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await getApiToken();

    const headers = new Headers(options.headers);

    if (token) headers.set('Authorization', `Bearer ${token}`);

    const body = options.body;

    if (isFormData(body)) {
        headers.delete('Content-Type');
    } else {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (response.status === 401) void msalInstance.logoutPopup();
    

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `HTTP error: ${response.status}`);
    }

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
}

export const apiClient = {
    get: <T>(url: string) => request<T>(url),
     post: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: 'POST',
            body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
        }),
    put: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: 'PUT',
            body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
        }),
    delete: <T>(url: string, body?: unknown) =>
        request<T>(url, {
            method: 'DELETE',
            body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
        }),
};
