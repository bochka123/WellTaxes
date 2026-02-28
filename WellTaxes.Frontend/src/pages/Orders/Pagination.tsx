import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import Select from '@/shared/ui/Select';

interface Props {
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [5, 10, 25, 50];

const Pagination: FC<Props> = ({ total, page, pageSize, onPageChange, onPageSizeChange }) => {
    const { t } = useTranslation();
    const totalPages = Math.ceil(total / pageSize);
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const getPages = (): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
        if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', page - 1, page, page + 1, '...', totalPages];
    };

    const btnBase = 'min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <div className="flex items-center justify-between px-3 py-3 border-t border-zinc-100">
            <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              {from}–{to} {t('pagination.of')} {total}
            </span>
                <Select
                    value={pageSize}
                    onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
                    className="[&>select]:py-0.5"
                >
                    {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s} {t('pagination.perPage')}</option>
                    ))}
                </Select>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={`${btnBase} text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700`}
                >
                    <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>

                {getPages().map((p, i) =>
                        p === '...' ? (
                            <span key={`ellipsis-${i}`} className="min-w-8 h-8 flex items-center justify-center text-sm text-zinc-300">
                              ···
                            </span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p as number)}
                                className={`${btnBase} ${
                                    page === p
                                        ? 'text-white'
                                        : 'text-zinc-600 hover:bg-zinc-100'
                                }`}
                                style={page === p ? { backgroundColor: '#63aeff' } : {}}
                            >
                                {p}
                            </button>
                        )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`${btnBase} text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700`}
                >
                    <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>

        </div>
    );
};

export default Pagination;
