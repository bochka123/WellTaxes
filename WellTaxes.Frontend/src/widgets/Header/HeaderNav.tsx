import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const HeaderNav: FC = () => {
    const { t } = useTranslation();

    const NAV_LINKS = [
        { path: '/', label: t('nav.home') },
        { path: '/orders', label: t('nav.orders') },
    ];

    return (
        <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    end
                    className={({ isActive }) => `
                            relative px-3 py-1.5 text-sm font-medium rounded-md
                            transition-colors duration-150 group
                            ${isActive
                        ? 'text-zinc-900'
                        : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                >
                    {({ isActive }) => (
                        <>
                            {label}
                            <span
                                className={`
                                    absolute bottom-0 left-3 right-3 h-0.5 rounded-full
                                    transition-all duration-200 
                                    ${isActive 
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-30'
                                    }`}
                                style={{ backgroundColor: '#63aeff' }}
                            />
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default HeaderNav;
