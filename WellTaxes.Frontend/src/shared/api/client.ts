import { useAuthStore } from '@/features/auth';

const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        useAuthStore.getState().clearAuth();
    }

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}

export const apiClient = {
    get: <T>(url: string) => request<T>(url),
    post: <T>(url: string, body?: unknown) =>
        request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body?: unknown) =>
        request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
