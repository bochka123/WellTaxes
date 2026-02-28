import { useMutation, type UseMutationResult, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import { type CreateOrderDto, orderApi } from '@/entities/order/api/order.api.ts';
import type { GetOrdersParams, Order, PaginatedOrders } from '@/entities/order/types/order.types.ts';

export const orderKeys = {
    all:    () => ['orders'] as const,
    list:   (params: GetOrdersParams) => [...orderKeys.all(), params] as const,
    detail: (id: string)              => [...orderKeys.all(), id] as const,
};

export const useOrders = (params: GetOrdersParams): UseQueryResult<PaginatedOrders, Error> =>
    useQuery<PaginatedOrders, Error>({
        queryKey: orderKeys.list(params),
        queryFn: () => orderApi.getAll(params),
    });

export const useOrder = (id: string): UseQueryResult<Order, Error> =>
    useQuery<Order, Error>({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderApi.getById(id),
        enabled: !!id,
    });

export const useCreateOrder = (): UseMutationResult<Order, Error, CreateOrderDto> => {
    const queryClient = useQueryClient();
    return useMutation<Order, Error, CreateOrderDto>({
        mutationFn: (data) => orderApi.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
    });
};

export const useImportCSV = (): UseMutationResult<void, Error, File> => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, File>({
        mutationFn: (file) => orderApi.importCSV(file),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
    });
};
