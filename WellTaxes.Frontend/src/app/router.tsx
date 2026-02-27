import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { type ElementType, type FC, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import Spinner from '@/shared/ui/Spinner';
import Header from '@/widgets/Header';

const Home = lazy(() => import('@/pages/Home'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Orders = lazy(() => import('@/pages/Orders'));

const AppLayout: FC = () => (
    <div className="flex flex-col min-h-screen">
        <Suspense fallback={<Spinner />}>
            <Outlet />
        </Suspense>
    </div>
);

const MainLayout: FC = () => (
    <>
        <Header />
        <main className="flex-1">
            <Outlet />
        </main>
    </>
);

const ProtectedRoute: ElementType = () => {
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal();

    if (inProgress !== InteractionStatus.None) {
        return <Spinner fullscreen />;
    }
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

const GuestRoute: ElementType = () => {
    const isAuthenticated = useIsAuthenticated();
    const { inProgress } = useMsal();

    if (inProgress !== InteractionStatus.None) {
        return <Spinner fullscreen />;
    }
    
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <MainLayout />,
                        children: [
                            { path: '/', element: <Home /> },
                            { path: '/orders', element: <Orders /> }
                        ],
                    },
                ],
            },
            {
                element: <GuestRoute />,
                children: [
                    { path: '/auth', element: <Auth /> },
                ],
            },
        ],
    },
    { path: '*', element: <NotFound /> },
]);
