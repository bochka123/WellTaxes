import { type ChangeEvent, type FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/Button';

interface Props {
    onImport: (file: File) => void;
    className?: string;
}

const UploadIcon = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

const ImportCsvButton: FC<Props> = ({ onImport, className }) => {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) : void => {
        const file = e.target.files?.[0];
        if (file) onImport(file);
        e.target.value = '';
    };

    return (
        <>
            <Button onClick={() => inputRef.current?.click()} variant="outline" icon={UploadIcon} className={className}>
                {t('createOrder.importCSV')}
            </Button>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
        </>
    );
};

export default ImportCsvButton;
