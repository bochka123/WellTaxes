import { useQuery } from '@tanstack/react-query';

import { orderApi } from '@/entities/order/api/order.api.ts';
import type { GetOrdersParams } from '@/entities/order/types/order.types.ts';

export const orderKeys = {
    all:     () => ['orders'] as const,
    list:    (params: GetOrdersParams) => [...orderKeys.all(), params] as const,
    detail:  (id: string) => [...orderKeys.all(), id] as const,
};

export const useOrders = (params: GetOrdersParams) =>
    useQuery({
        queryKey: orderKeys.list(params),
        queryFn:  () => orderApi.getOrders(params),
    });

export const useOrder = (id: string) =>
    useQuery({
        queryKey: orderKeys.detail(id),
        queryFn:  () => orderApi.getOrderById(id),
        enabled:  !!id,
    });
