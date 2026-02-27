import type { GetOrdersParams, Order } from '@/entities/order';
import type { PaginatedOrders } from '@/entities/order/types/order.types.ts';
import { apiClient } from '@/shared/api/client';

export interface CreateOrderDto {
    userId:        string;
    amount:        number;
    latitude:      number;
    longitude:     number;
}

const buildQuery = (params: GetOrdersParams): string => {
    const query = new URLSearchParams();

    query.set('Page', String(params.page));
    query.set('PageSize', String(params.pageSize));

    if (params.sortBy) query.set('SortBy', params.sortBy);
    if (params.sortDescending !== undefined)
        query.set('SortDescending',  String(params.sortDescending));

    params.filters?.forEach((f, i) => {
        query.append(`Filters[${i}].field`,    f.field);
        query.append(`Filters[${i}].operator`, f.operator);
        query.append(`Filters[${i}].value`,    f.value);
    });

    return query.toString();
};

export const orderApi = {
    getAll: (params: GetOrdersParams): Promise<PaginatedOrders> =>
        apiClient.get<PaginatedOrders>(`/Orders?${buildQuery(params)}`),

    getById: (id: string): Promise<Order> =>
        apiClient.get<Order>(`/Orders/GetById/${id}`),

    create: (data: CreateOrderDto): Promise<Order> =>
        apiClient.post<Order>('/Orders', data),

    importCSV: (data: any): Promise<void> =>
        apiClient.post<void>('/Orders/Import', data)
};
