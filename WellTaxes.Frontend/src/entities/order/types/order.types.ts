import type { Filter, PaginatedResponse } from '@/shared/api/api.types.ts';

export interface Order {
    id:            string;
    orderNumber:   string;
    subtotal:      number;
    taxAmount:     number;
    totalAmount:   number;
    totalRate:     number;
    taxRegionName: string;
    timestamp:     string;
}

export type SortField = keyof Pick<Order,
    'subtotal' | 'totalAmount' | 'totalRate' | 'orderNumber' | 'timestamp'
>;

export interface GetOrdersParams {
    page:            number;
    pageSize:        number;
    sortBy?:         SortField;
    sortDescending?: boolean;
    filters?:        Filter[];
}

export interface PaginatedOrders extends PaginatedResponse<Order> { }
