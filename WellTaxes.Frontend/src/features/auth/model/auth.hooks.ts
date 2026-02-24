// import { useGoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { authApi, type AuthCredentials, type GoogleAuthDto } from '../api/auth.api';
import { useAuthStore } from './auth.store';

export const useLogin = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (data: AuthCredentials) => authApi.login(data),
        onSuccess: () => navigate('/'),
        onError: (error) => console.error('Login failed:', error),
    });
};

export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (data: AuthCredentials) => authApi.register(data),
        onSuccess: () => navigate('/'),
        onError: (error) => console.error('Register failed:', error),
    });
};

export const useLogout = () => {
    const { clearAuth } = useAuthStore();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => clearAuth(),
    });
};

export const useGoogleAuth = () => {
    // const navigate = useNavigate();

    // const { mutate: googleLogin, isPending } = useMutation({
    //     mutationFn: (data: GoogleAuthDto) => authApi.googleLogin(data),
    //     onSuccess: () => navigate('/'),
    //     onError: (error) => console.error('Google login failed:', error),
    // });

    // const login = useGoogleLogin({
    //     onSuccess: (response) => googleLogin({ accessToken: response.access_token }),
    //     onError: () => console.error('Google OAuth failed'),
    // });

    const login = 'test';
    const isPending = false;

    return { login, isPending };
};
