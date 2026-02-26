import { useMsal } from '@azure/msal-react';
import { useEffect,useState } from 'react';

const GRAPH_PHOTO_URL = 'https://graph.microsoft.com/v1.0/me/photo/$value';

export const useUserPhoto = (): string | null => {
    const { instance, accounts } = useMsal();
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!accounts[0]) return;

        const fetchPhoto = async () => {
            try {
                const { accessToken } = await instance.acquireTokenSilent({
                    scopes: ['User.Read'],
                    account: accounts[0],
                });

                const response = await fetch(GRAPH_PHOTO_URL, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (!response.ok) return;

                const blob = await response.blob();
                setPhotoUrl(URL.createObjectURL(blob));
            } catch {
                
            }
        };

        void fetchPhoto();
        
        return () => {
            if (photoUrl) URL.revokeObjectURL(photoUrl);
        };
    }, [accounts[0]?.homeAccountId]);

    return photoUrl;
};