import '@/index.css';
import '@/shared/config/i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from '@/app/App.tsx';

registerSW({
    immediate: true,
    onNeedRefresh() {
        window.location.reload();
    }
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);
