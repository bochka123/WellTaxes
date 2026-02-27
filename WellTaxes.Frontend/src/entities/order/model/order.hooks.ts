import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type CreateOrderDto, orderApi } from '@/entities/order/api/order.api.ts';
import type { GetOrdersParams } from '@/entities/order/types/order.types.ts';

export const orderKeys = {
    all:    () => ['orders'] as const,
    list:   (params: GetOrdersParams) => [...orderKeys.all(), params] as const,
    detail: (id: string)              => [...orderKeys.all(), id] as const,
};

export const useOrders = (params: GetOrdersParams) =>
    useQuery({
        queryKey: orderKeys.list(params),
        queryFn:  () => orderApi.getAll(params),
    });

export const useOrder = (id: string) =>
    useQuery({
        queryKey: orderKeys.detail(id),
        queryFn:  () => orderApi.getById(id),
        enabled:  !!id,
    });

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderDto) => orderApi.create(data),
        onSuccess:  () => queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
    });
};
