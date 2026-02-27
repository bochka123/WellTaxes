import type { AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/features/auth';
import { msalScopes } from '@/shared/config/msal.ts';
import { useUserPhoto } from '@/shared/lib/msal/useUserPhoto.ts';
import { Avatar } from '@/shared/ui/Avatar';

const getInitials = (name: string): string =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const UserMenu: FC = () => {
    const { accounts, instance } = useMsal();
    const { mutate: logout, isPending } = useLogout();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const photoUrl = useUserPhoto();
    const { t } = useTranslation();

    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    const otherAccounts = accounts.filter((a) => a.homeAccountId !== activeAccount?.homeAccountId);

    const displayName = activeAccount?.name ?? 'User';
    const email = activeAccount?.username ?? '';

    useEffect(() => {
        const handler = (e: MouseEvent): void => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchAccount = (account: AccountInfo): void => {
        instance.setActiveAccount(account);
        setOpen(false);
        instance.acquireTokenSilent({ scopes: msalScopes, account }).catch(() => {});
    };

    const addAccount = (): void => {
        setOpen(false);
        void instance.loginPopup({
            scopes: msalScopes,
            prompt: 'select_account',
        });
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-150 cursor-pointer"
                style={{ backgroundColor: '#63aeff' }}
                aria-label="User menu"
            >
                <Avatar name={displayName} photoUrl={photoUrl} size="md" />
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-64 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-col gap-2 px-4 py-3 border-b border-zinc-100">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
                            {t('userMenu.activeAccount')}
                        </p>
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                style={{ backgroundColor: '#63aeff' }}
                            >
                                <Avatar name={displayName} photoUrl={photoUrl} size="sm" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-zinc-900 truncate">{displayName}</p>
                                <p className="text-xs text-zinc-400 truncate">{email}</p>
                            </div>
                        </div>
                    </div>

                    {otherAccounts.length > 0 && (
                        <div className="border-b border-zinc-100">
                            <p className="px-4 pt-2.5 pb-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                {t('userMenu.otherAccounts')}
                            </p>
                            {otherAccounts.map((account) => (
                                <button
                                    key={account.homeAccountId}
                                    onClick={() => switchAccount(account)}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 transition-colors duration-100 cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 bg-zinc-400">
                                        {getInitials(account.name ?? 'U')}
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-medium text-zinc-700 truncate">{account.name}</p>
                                        <p className="text-xs text-zinc-400 truncate">{account.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-1.5 flex flex-col gap-0.5">
                        <button
                            onClick={addAccount}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors duration-100 cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            {t('userMenu.addAccount')}
                        </button>

                        <button
                            onClick={() => { setOpen(false); logout(); }}
                            disabled={isPending}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors duration-100 cursor-pointer disabled:opacity-50"
                            style={{ color: '#fe8380' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff1f1')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {isPending ? t('userMenu.loggingOut') : t('auth.logout')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
