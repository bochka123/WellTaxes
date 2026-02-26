import { type FC, useEffect, useRef, useState } from 'react';

export type SortField = 'createdAt' | 'updatedAt' | 'amount' | 'amountWithTax' | 'orderNumber';
export type SortDir   = 'asc' | 'desc';

export interface FilterSortState {
    sortBy:  SortField;
    sortDir: SortDir;
}

interface Props {
    value: FilterSortState;
    onChange: (v: FilterSortState) => void;
}

const SORT_FIELDS: { value: SortField; label: string }[] = [
    { value: 'createdAt',     label: 'Creation Date' },
    { value: 'updatedAt',     label: 'Modified Date' },
    { value: 'amount',        label: 'Amount' },
    { value: 'amountWithTax', label: 'Amount (Incl. Tax)' },
    { value: 'orderNumber',   label: 'Order Number' },
];

const FilterSortPanel: FC<Props> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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
                Sorting
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-60 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex flex-col gap-4">

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Sort by</p>
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
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Direction</p>
                        <div className="flex gap-1.5">
                            {(['asc', 'desc'] as SortDir[]).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => onChange({ ...value, sortDir: d })}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-100 cursor-pointer ${
                                        value.sortDir === d
                                            ? 'text-white border-transparent'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                                    }`}
                                    style={value.sortDir === d ? { backgroundColor: '#63aeff', borderColor: '#63aeff' } : {}}
                                >
                                    {d === 'asc' ? (
                                        <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>Asc</>
                                    ) : (
                                        <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>Desc</>
                                    )}
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
