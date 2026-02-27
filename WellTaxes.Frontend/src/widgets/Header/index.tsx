import { type FC } from 'react';

import LanguageSwitcher from '@/shared/ui/LanguageSwitcher';

import HeaderNav from './HeaderNav.tsx';
import UserMenu from './UserMenu.tsx';

const Header: FC = () => {
    return (
        <header className="h-14 bg-white border-b border-zinc-100 px-6 flex items-center justify-between select-none">
            <div className="flex w-full justify-center items-center gap-8">
                <HeaderNav />
            </div>
            <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <UserMenu />
            </div>
        </header>
    );
};

export default Header;
