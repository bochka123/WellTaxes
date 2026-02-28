import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type Language, LANGUAGES } from '@/shared/config/i18n';

interface Props {
    variant?: 'compact' | 'full';
}

const LanguageSwitcher: FC<Props> = ({ variant = 'compact' }) => {
    const { i18n } = useTranslation();

    const handleChange = (lng: Language): void => {
        void i18n.changeLanguage(lng);
        localStorage.setItem('lang', lng);
    };

    if (variant === 'full') {
        return (
            <div className="flex flex-col gap-0.5">
                {(Object.entries(LANGUAGES) as [Language, string][]).map(([lng, label]) => {
                    const active = i18n.language === lng;
                    return (
                        <button
                            key={lng}
                            type="button"
                            onClick={() => handleChange(lng)}
                            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-100 cursor-pointer ${
                                active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                            }`}
                        >
                            <span className="text-base leading-none">{lng === 'en' ? 'en' : 'uk'}</span>
                            {label}
                            {active && (
                                <span className="ml-auto text-xs" style={{ color: '#63aeff' }}>✓</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex gap-1">
            {(Object.keys(LANGUAGES) as Language[]).map((lng) => {
                const active = i18n.language === lng;
                return (
                    <button
                        key={lng}
                        type="button"
                        onClick={() => handleChange(lng)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors duration-150 cursor-pointer ${
                            active
                                ? 'text-white border-transparent'
                                : 'bg-transparent border-zinc-200 text-zinc-500 hover:border-[#63aeff] hover:text-[#63aeff]'
                        }`}
                        style={active ? { backgroundColor: '#63aeff', borderColor: '#63aeff' } : {}}
                    >
                        {lng.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
};

export default LanguageSwitcher;
