import { type FC } from 'react';

import HeaderNav from './HeaderNav.tsx';
import UserMenu from './UserMenu.tsx';

const Header: FC = () => {
    return (
        <header className="h-14 bg-white border-b border-zinc-100 px-6 flex items-center justify-between select-none">
            <div className="flex w-full justify-center items-center gap-8">
                <HeaderNav />
            </div>
            <UserMenu />
        </header>
    );
};

export default Header;
