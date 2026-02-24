import { apiClient } from '@/shared/api/client';

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface GoogleAuthDto {
    accessToken: string;
}

export const authApi = {
    login: (data: AuthCredentials) =>
        apiClient.post<null>('/api/auth/login', data),

    register: (data: AuthCredentials) =>
        apiClient.post<null>('/api/auth/register', data),

    logout: () =>
        apiClient.post<null>('/api/auth/logout'),

    googleLogin: (data: GoogleAuthDto) =>
        apiClient.post<null>('/api/auth/google', data),
};
