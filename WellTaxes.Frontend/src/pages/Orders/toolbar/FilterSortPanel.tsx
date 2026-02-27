import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SortField } from '@/entities/order';

export interface FilterSortState {
    sortBy?:         SortField;
    sortDescending:  boolean;
}

interface Props {
    value: FilterSortState;
    onChange: (v: FilterSortState) => void;
}

const FilterSortPanel: FC<Props> = ({ value, onChange }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const SORT_FIELDS: { value: SortField; label: string }[] = [
        { value: 'createdAt',     label: t('filterSort.createdAt') },
        { value: 'amount',        label: t('filterSort.amount') },
        { value: 'amountWithTax', label: t('filterSort.amountWithTax') },
        { value: 'orderNumber',   label: t('filterSort.orderNumber') },
    ];

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 cursor-pointer"
            >
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="9" y1="18" x2="3" y2="18"/>
                </svg>
                {t('filterSort.sorting')}
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-60 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">{t('filterSort.sortBy')}</p>
                        <div className="flex flex-col gap-0.5">
                            {SORT_FIELDS.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => onChange({ ...value, sortBy: f.value })}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all duration-100 cursor-pointer ${
                                        value.sortBy === f.value
                                            ? 'font-medium text-zinc-900 bg-zinc-100'
                                            : 'text-zinc-500 hover:bg-zinc-50'
                                    }`}
                                >
                                    {f.label}
                                    {value.sortBy === f.value && (
                                        <span className="text-xs" style={{ color: '#63aeff' }}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">{t('filterSort.direction')}</p>
                        <div className="flex gap-1.5">
                            {([false, true] as boolean[]).map((desc) => (
                                <button
                                    key={String(desc)}
                                    onClick={() => onChange({ ...value, sortDescending: desc })}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                        value.sortDescending === desc ? 'text-white border-transparent' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                    }`}
                                    style={value.sortDescending === desc ? { backgroundColor: '#63aeff', borderColor: '#63aeff' } : {}}
                                >
                                    {!desc
                                        ? <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>{t('filterSort.asc')}</>
                                        : <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>{t('filterSort.desc')}</>
                                    }
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default FilterSortPanel;
