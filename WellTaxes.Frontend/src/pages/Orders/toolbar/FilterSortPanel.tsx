import { type FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import type { SortField } from '@/entities/order';
import Button from '@/shared/ui/Button';

export interface FilterSortState {
    sortBy?:        SortField;
    sortDescending: boolean;
}

interface Props {
    value:      FilterSortState;
    onChange:   (v: FilterSortState) => void;
    className?: string;
}

const SORT_GROUPS: { labelKey: string; fields: SortField[] }[] = [
    {
        labelKey: 'sort.groups.order',
        fields: ['orderNumber', 'subtotal', 'taxAmount', 'totalAmount', 'compositeTaxRate', 'timestamp', 'latitude', 'longitude'],
    },
    {
        labelKey: 'sort.groups.breakdown',
        fields: ['stateRate', 'countyRate', 'cityRate', 'specialRate'],
    },
    {
        labelKey: 'sort.groups.jurisdiction',
        fields: ['zipCode', 'taxRegionName'],
    },
];

const SortIcon = (
    <svg className="shrink-0 w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="9" y1="18" x2="3" y2="18"/>
    </svg>
);

const FilterSortPanel: FC<Props> = ({ value, onChange, className }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const triggerRef  = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const panelContent = (
        <>
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide shrink-0">
                    {t('sort.labels.sortBy')}
                </p>
                <div className="flex flex-col gap-1">
                    {SORT_GROUPS.map((group, gi) => (
                        <div className="flex flex-col gap-2" key={group.labelKey}>
                            {gi > 0 && <div className="border-t border-zinc-200 my-2" />}

                            <div className="flex items-center gap-2 px-1 mb-1">
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                    {t(group.labelKey)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-0.5">
                                {group.fields.map((field) => (
                                    <button
                                        key={field}
                                        onClick={() => onChange({ ...value, sortBy: field })}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                                            value.sortBy === field
                                                ? 'font-medium text-zinc-900 bg-zinc-100'
                                                : 'text-zinc-500 hover:bg-zinc-50'
                                        }`}
                                    >
                                        {t(`sort.fields.${field}`)}
                                        {value.sortBy === field && (
                                            <span className="text-xs" style={{ color: '#63aeff' }}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 border-t border-zinc-100 pt-3">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                    {t('sort.labels.direction')}
                </p>
                <div className="flex gap-1.5">
                    {([false, true] as boolean[]).map((desc) => (
                        <button
                            key={String(desc)}
                            onClick={() => onChange({ ...value, sortDescending: desc })}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                value.sortDescending === desc
                                    ? 'text-white border-transparent'
                                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                            }`}
                            style={value.sortDescending === desc ? { backgroundColor: '#63aeff', borderColor: '#63aeff' } : {}}
                        >
                            {!desc
                                ? <><svg className="shrink-0 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>{t('sort.labels.asc')}</>
                                : <><svg className="shrink-0 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>{t('sort.labels.desc')}</>
                            }
                        </button>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <div className={`relative ${className}`} ref={triggerRef}>
            <Button
                onClick={() => setOpen((v) => !v)}
                variant="outline"
                className="w-full"
                icon={SortIcon}
            >
                {t('sort.labels.sorting')}
                {value.sortBy !== 'timestamp' && (
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#63aeff' }} />
                )}
            </Button>

            {open && (
                <>
                    {/* Desktop */}
                    <div
                        ref={dropdownRef}
                        className="hidden sm:flex absolute right-0 top-12 w-60 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex-col gap-4 max-h-[70vh] overflow-hidden"
                    >
                        {panelContent}
                    </div>

                    {/* Mobile */}
                    {createPortal(
                        <div className="sm:hidden fixed inset-0 z-100 flex flex-col justify-end bg-black/40">
                            <div
                                ref={dropdownRef}
                                className="flex flex-col gap-3 bg-white rounded-t-2xl p-4 max-h-[85dvh] overflow-hidden"
                            >
                                <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto shrink-0" />
                                {panelContent}
                            </div>
                        </div>,
                        document.body
                    )}
                </>
            )}
        </div>
    );
};

export default FilterSortPanel;
