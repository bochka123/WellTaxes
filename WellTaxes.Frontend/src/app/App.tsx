import type { FC } from 'react';
import { RouterProvider } from 'react-router-dom';

import { Providers } from '@/app/providers.tsx';
import { router } from '@/app/router.tsx';

const App: FC = () => {
    return (
        <Providers>
            <RouterProvider router={router} />
        </Providers>
    );
};

export default App;
