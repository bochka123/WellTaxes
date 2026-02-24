import type { FC } from 'react';
import { msalInstance } from './auth/msalConfig';
import { MsalProvider } from '@azure/msal-react';
import { LoginButton } from './components/LoginButton';


const App: FC = () => {
    return (
        <MsalProvider instance={msalInstance}>
            <LoginButton></LoginButton>
        </MsalProvider>
    );
};

export default App;
