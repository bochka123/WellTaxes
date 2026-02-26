import { type FC } from 'react';

import { LoginButton } from '@/features/auth';

const AuthPage: FC = () => {
    return (
        <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="flex flex-col gap-2 w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <img
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl"
                            src={'./pwa-512x512.png'}
                            alt={'Logo'}
                        />
                    </div>
                    <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
                        Ласкаво просимо
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Увійдіть через корпоративний акаунт
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                    <LoginButton />
                </div>

                <p className="text-center text-xs text-zinc-400 mt-6">
                    Використовуйте свій Microsoft / Azure AD акаунт
                </p>
            </div>
        </main>
    );
};

export default AuthPage;
