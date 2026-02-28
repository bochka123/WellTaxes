import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/ui/Button';

interface Props {
    selectionMode: boolean;
    selectedCount: number;
    isDeleting:    boolean;
    onToggle:      () => void;
    onDelete:      () => void;
    className?:    string;
}

const SelectIcon = (
    <svg className="shrink-0 w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="5" width="4" height="4" rx="1"/><rect x="3" y="11" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/>
        <line x1="10" y1="7" x2="21" y2="7"/><line x1="10" y1="13" x2="21" y2="13"/><line x1="10" y1="19" x2="21" y2="19"/>
    </svg>
);

const TrashIcon = (
    <svg className="shrink-0 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
);

const SelectDeleteButton: FC<Props> = ({ selectionMode, selectedCount, isDeleting, onToggle, onDelete, className }) => {
    const { t } = useTranslation();

    if (!selectionMode) {
        return (
            <Button onClick={onToggle} variant="outline" className={className} icon={SelectIcon}>
                {t('table.select')}
            </Button>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className ?? ''}`}>
            <Button
                onClick={onToggle}
                variant="outline"
                className="flex-1 sm:flex-none"
            >
                {t('common.cancel')}
            </Button>
            <Button
                onClick={onDelete}
                variant="dangerSoft"
                disabled={selectedCount === 0 || isDeleting}
                className="flex-1 sm:flex-none"
                icon={TrashIcon}
            >
                {isDeleting ?
                    t('table.deleting') :
                    t('table.deleteSelected', { count: selectedCount })
                }
            </Button>
        </div>
    );
};

export default SelectDeleteButton;

