import { useIsAuthenticated } from '@azure/msal-react';
import { type ElementType, type FC, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import Spinner from '@/shared/ui/Spinner';

const Home = lazy(() => import('@/pages/Home'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppLayout: FC = () => (
    <div className="flex flex-col min-h-screen">
        {/*<Header />*/}
        <main className="flex-1 pb-16">
            <Suspense fallback={<Spinner />}>
                <Outlet />
            </Suspense>
        </main>
        {/*<BottomNav />*/}
    </div>
);

const ProtectedRoute: ElementType = () => {
    const isAuthenticated = useIsAuthenticated();
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

const GuestRoute: ElementType = () => {
    const isAuthenticated = useIsAuthenticated();
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/', element: <Home /> },
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
