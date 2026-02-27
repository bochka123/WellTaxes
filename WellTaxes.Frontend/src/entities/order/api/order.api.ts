import { apiClient } from '@/shared/api/client';

import type { GetOrdersParams, Order, PaginatedResponse } from '../types/order.types';

export const orderApi = {
    getOrders: (params: GetOrdersParams): Promise<PaginatedResponse<Order>> => {
        const query = new URLSearchParams({
            page:     String(params.page),
            pageSize: String(params.pageSize),
            sortBy:   params.sortBy,
            sortDir:  params.sortDir,
        });

        return apiClient.get<PaginatedResponse<Order>>(`/api/orders?${query}`);
    },

    getOrderById: (id: string): Promise<Order> =>
        apiClient.get<Order>(`/api/orders/${id}`),
};
