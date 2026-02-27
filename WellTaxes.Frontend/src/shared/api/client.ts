import { msalInstance } from '@/shared/config/msal.ts';
import { getApiToken } from '@/shared/lib/msal/getApiToken.ts';

const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await getApiToken();

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        void msalInstance.logoutPopup();
    }

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}

async function stream<T>(
    url: string,
    onChunk: (items: T[]) => void,
    onDone:  () => void,
    signal?: AbortSignal
): Promise<void> {
    const token = await getApiToken();

    const response = await fetch(`${BASE_URL}${url}`, {
        credentials: 'include',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        signal,
    });

    if (response.status === 401) {
        void msalInstance.logoutPopup();
        return;
    }

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    if (!response.body) throw new Error('No stream body');

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        const batch: T[] = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) batch.push(...parsed);
                else                       batch.push(parsed);
            } catch { }
        }

        if (batch.length) onChunk(batch);
    }

    if (buffer.trim()) {
        try {
            const parsed = JSON.parse(buffer.trim());
            onChunk(Array.isArray(parsed) ? parsed : [parsed]);
        } catch { }
    }

    onDone();
}

export const apiClient = {
    get: <T>(url: string) => request<T>(url),
    post: <T>(url: string, body?: unknown) =>
        request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(url: string, body?: unknown) =>
        request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
    stream,
};
