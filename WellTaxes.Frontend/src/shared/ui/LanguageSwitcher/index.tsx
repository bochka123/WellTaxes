import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type Language,LANGUAGES } from '@/shared/config/i18n';

const LanguageSwitcher: FC = () => {
  const { i18n } = useTranslation();

  const handleChange = (lng: Language): void => {
    void i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  return (
    <div className="flex gap-1">
      {(Object.keys(LANGUAGES) as Language[]).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => handleChange(lng)}
          className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer
            ${i18n.language === lng
              ? 'bg-[#63aeff] border-[#63aeff] text-white font-semibold'
              : 'bg-transparent border-gray-300 text-gray-600 hover:border-[#63aeff] hover:text-[#63aeff]'
            }`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
