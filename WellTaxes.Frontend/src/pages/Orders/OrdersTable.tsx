import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { Order } from '@/entities/order';

interface Props {
    orders: Order[];
}

const OrdersTable: FC<Props> = ({ orders }) => {
    const { i18n, t } = useTranslation();
    
    const formatAmount = (amount: number): string =>
        new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

    const formatDate = (date: string): string =>
        new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

    const COLUMNS = [
        t('orders.colNumber'),
        t('orders.colAmount'),
        t('orders.colAmountWithTax'),
        t('orders.colCoordinates'),
        t('orders.colCreated'),
        '',
    ];

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <svg className="w-10 h-10 mb-3 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p className="text-sm">{t('orders.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="border-b border-zinc-100">
                    {COLUMNS.map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wide px-4 py-3 first:pl-0 last:pr-0 whitespace-nowrap">
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-zinc-50/60 transition-colors duration-100">
                        <td className="px-4 py-3.5 pl-0 font-mono text-xs text-zinc-500 whitespace-nowrap">{order.orderNumber}</td>
                        <td className="px-4 py-3.5 font-medium text-zinc-900 whitespace-nowrap">{formatAmount(order.amount)}</td>
                        <td className="px-4 py-3.5 text-zinc-600 whitespace-nowrap">{formatAmount(order.amountWithTax)}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-zinc-400 whitespace-nowrap">
                            {/*{order.Latitude.toFixed(4)}, {order.Longitude.toFixed(4)}*/}
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3.5 pr-0">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer">
                                <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                                </svg>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;
