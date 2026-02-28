import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    selectionMode: boolean;
    selectedCount: number;
    isDeleting:    boolean;
    onToggle:      () => void;
    onDelete:      () => void;
}

const SelectDeleteButton: FC<Props> = ({ selectionMode, selectedCount, isDeleting, onToggle, onDelete }) => {
    const { t } = useTranslation();

    if (!selectionMode) {
        return (
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="5" width="4" height="4" rx="1"/><rect x="3" y="11" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/>
                    <line x1="10" y1="7" x2="21" y2="7"/><line x1="10" y1="13" x2="21" y2="13"/><line x1="10" y1="19" x2="21" y2="19"/>
                </svg>
                {t('table.select')}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
                {t('common.cancel')}
            </button>
            <button
                onClick={onDelete}
                disabled={selectedCount === 0 || isDeleting}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                {isDeleting ? t('table.deleting') : t('table.deleteSelected', { count: selectedCount })}
            </button>
        </div>
    );
};

export default SelectDeleteButton;
