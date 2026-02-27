import { type FC, useEffect,useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type Filter } from '@/shared/api/api.types';
import { OperatorEnum } from '@/shared/api/api.types';

interface Props {
    value:    Filter[];
    onChange: (filters: Filter[]) => void;
}

const OPERATORS: { value: Filter['operator']; label: string }[] = [
    { value: OperatorEnum.EQUAL,         label: '=' },
    { value: OperatorEnum.GREATER_THAN,  label: '>' },
    { value: OperatorEnum.LESS_THAN,     label: '<' },
    { value: OperatorEnum.LIKE,          label: '~' },
];

const EMPTY_FILTER: Filter = { field: 'amount', operator: OperatorEnum.EQUAL, value: '' };

const FilterPanel: FC<Props> = ({ value, onChange }) => {
    const { t } = useTranslation();

    const FILTER_FIELDS: { value: string; label: string }[] = [
        { value: 'amount',        label: t('filter.amount') },
        { value: 'amountWithTax', label: t('filter.amountWithTax') },
        { value: 'totalRate',     label: t('filter.totalRate') },
        { value: 'taxRegionName', label: t('filter.taxRegionName') },
        { value: 'orderNumber',   label: t('filter.orderNumber') },
    ];

    const [open, setOpen]     = useState(false);
    const [draft, setDraft]   = useState<Filter[]>(value.length ? value : [{ ...EMPTY_FILTER }]);
    const ref = useRef<HTMLDivElement>(null);

    const handleOpen = () => {
        setDraft(value.length ? [...value] : [{ ...EMPTY_FILTER }]);
        setOpen(true);
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const updateRow = (i: number, patch: Partial<Filter>) => {
        setDraft((prev) => prev.map((f, idx) => idx === i ? { ...f, ...patch } : f));
    };

    const addRow    = () => setDraft((prev) => [...prev, { ...EMPTY_FILTER }]);
    const removeRow = (i: number) => setDraft((prev) => prev.filter((_, idx) => idx !== i));

    const handleApply = () => {
        onChange(draft.filter((f) => f.value.trim() !== ''));
        setOpen(false);
    };

    const handleReset = () => {
        setDraft([{ ...EMPTY_FILTER }]);
        onChange([]);
        setOpen(false);
    };

    const activeCount = value.filter((f) => f.value.trim() !== '').length;

    const inputClass = 'bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-[#63aeff] transition-colors';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => open ? setOpen(false) : handleOpen()}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer"
            >
                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                {t('filter.title')}
                {activeCount > 0 && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#63aeff' }}>
                        {activeCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-120 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex flex-col gap-3">

                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{t('filter.title')}</p>

                    <div className="flex flex-col gap-2">
                        {draft.map((filter, i) => (
                            <div key={i} className="flex items-center gap-1.5">

                                <select
                                    value={filter.field}
                                    onChange={(e) => updateRow(i, { field: e.target.value })}
                                    className={`${inputClass} flex-1 min-w-0 px-2 py-1.5 cursor-pointer`}
                                >
                                    {FILTER_FIELDS.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>

                                <select
                                    value={filter.operator}
                                    onChange={(e) => updateRow(i, { operator: e.target.value as Filter['operator'] })}
                                    className={`${inputClass} w-12 px-1.5 py-1.5 text-center cursor-pointer`}
                                >
                                    {OPERATORS.map((op) => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    placeholder={t('filter.valuePlaceholder')}
                                    value={filter.value}
                                    onChange={(e) => updateRow(i, { value: e.target.value })}
                                    className={`${inputClass} flex-1 min-w-0 px-2 py-1.5`}
                                />

                                <button
                                    onClick={() => removeRow(i)}
                                    disabled={draft.length === 1}
                                    className="p-1 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-0 disabled:pointer-events-none"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>

                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addRow}
                        className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer w-fit"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        {t('filter.addCondition')}
                    </button>

                    <div className="flex gap-2 pt-1 border-t border-zinc-100">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 border border-zinc-200 transition-colors cursor-pointer"
                        >
                            {t('filter.reset')}
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer"
                            style={{ backgroundColor: '#63aeff' }}
                        >
                            {t('filter.apply')}
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default FilterPanel;
