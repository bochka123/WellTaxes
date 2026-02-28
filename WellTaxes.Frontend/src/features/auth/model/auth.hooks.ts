import { useMsal } from '@azure/msal-react';
import { useMutation } from '@tanstack/react-query';

export const useLogout = () => {
    const { instance } = useMsal();

    return useMutation({
        mutationFn: async () => {
            await instance.logoutRedirect({
                postLogoutRedirectUri: '/auth',
            });
        },
    });
};
