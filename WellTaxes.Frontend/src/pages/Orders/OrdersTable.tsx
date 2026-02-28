import { type FC, lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Order } from '@/entities/order';
import Spinner from '@/shared/ui/Spinner';

const MapPreview = lazy(() => import('@/shared/ui/MapPreview'));

interface Props {
    orders: Order[];
    isLoading: boolean;
}

const formatRate = (rate: number): string => `${(rate * 100).toFixed(2)}%`;

const OrdersTable: FC<Props> = ({ orders, isLoading }) => {
    const { t, i18n } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const formatAmount = (amount: number): string =>
        new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);

    const formatDate = (date: string): string =>
        new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

    const COLUMNS = [
        t('table.columns.orderNumber'),
        t('table.columns.region'),
        t('table.columns.zip'),
        t('table.columns.subtotal'),
        t('table.columns.taxAmount'),
        t('table.columns.totalAmount'),
        t('table.columns.compositeTaxRate'),
        t('table.columns.breakdown'),
        t('table.columns.timestamp'),
        '',
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Spinner />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <svg className="w-10 h-10 mb-3 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p className="text-sm">{t('table.empty')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="border-b border-zinc-100">
                    {COLUMNS.map((h, i) => (
                        <th key={i} className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                {orders.map((order) => (
                    <>
                        <tr
                            key={order.id}
                            className="group hover:bg-zinc-50/60 transition-colors duration-100 cursor-pointer"
                            onClick={() => setExpandedId((v) => v === order.id ? null : order.id)}
                        >
                            <td className="px-4 py-3.5 font-mono text-xs text-zinc-500 whitespace-nowrap">
                                {order.orderNumber}
                            </td>

                            <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">
                                {order.jurisdiction?.taxRegionName}
                            </td>

                            <td className="px-4 py-3.5 font-mono text-xs text-zinc-400 whitespace-nowrap">
                                {order.jurisdiction?.zipCode}
                            </td>

                            <td className="px-4 py-3.5 text-zinc-700 whitespace-nowrap">
                                {formatAmount(order.subtotal)}
                            </td>

                            <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">
                                {formatAmount(order.taxAmount)}
                            </td>

                            <td className="px-4 py-3.5 font-medium text-zinc-900 whitespace-nowrap">
                                {formatAmount(order.totalAmount)}
                            </td>

                            <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">
                                {formatRate(order.compositeTaxRate)}
                            </td>

                            <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                    {[
                                        { label: t('table.breakdown.state'),   value: order.breakdown.stateRate },
                                        { label: t('table.breakdown.county'),  value: order.breakdown.countyRate },
                                        { label: t('table.breakdown.city'),    value: order.breakdown.cityRate },
                                        { label: t('table.breakdown.special'), value: order.breakdown.specialRate },
                                    ].map((b) => (
                                        <span
                                            key={b.label}
                                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500"
                                        >
                                            {b.label} {formatRate(b.value ?? 0)}
                                        </span>
                                    ))}
                                </div>
                            </td>

                            <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">
                                {formatDate(order.timestamp)}
                            </td>

                            <td>
                                <div className="flex justify-center items-center px-4 py-3.5">
                                    <button
                                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); setExpandedId((v) => v === order.id ? null : order.id); }}
                                    >
                                        <svg
                                            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${expandedId === order.id ? 'rotate-180' : ''}`}
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                        >
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>

                        {expandedId === order.id && (
                            <tr key={`${order.id}-expanded`} className="bg-zinc-50/40">
                                <td colSpan={COLUMNS.length} className="px-4 py-3">
                                    <div className="flex gap-4">

                                        <div className="w-72 shrink-0 rounded-lg overflow-hidden border border-zinc-200">
                                            <Suspense fallback={
                                                <div className="w-full bg-zinc-100 animate-pulse rounded-lg" style={{ height: 180 }} />
                                            }>
                                                <MapPreview
                                                    position={{ lat: order.latitude, lng: order.longitude }}
                                                    height={180}
                                                />
                                            </Suspense>
                                        </div>

                                        <div className="flex flex-col justify-center gap-2 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-16 text-zinc-400 shrink-0">Latitude</span>
                                                <span className="font-mono text-zinc-600">{order.latitude.toFixed(6)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-16 text-zinc-400 shrink-0">Longitude</span>
                                                <span className="font-mono text-zinc-600">{order.longitude.toFixed(6)}</span>
                                            </div>
                                        </div>

                                    </div>
                                </td>
                            </tr>
                        )}
                    </>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;
