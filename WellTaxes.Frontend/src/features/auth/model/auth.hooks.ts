import { useMsal } from '@azure/msal-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
    const { instance } = useMsal();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            await instance.clearCache();
            navigate('/auth');
        },
    });
};
