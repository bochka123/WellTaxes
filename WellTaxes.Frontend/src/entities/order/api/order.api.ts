import type { Order } from '@/entities/order';
import { apiClient } from '@/shared/api/client';

export const orderApi = {
    getAll: (): Promise<Order[]> =>
        apiClient.get<Order[]>('/Orders/Get'),

    getById: (id: string): Promise<Order> =>
        apiClient.get<Order>(`/Orders/GetById/${id}`),

    getByUserId: (userId: string): Promise<Order[]> =>
        apiClient.get<Order[]>(`/Orders/GetByUserId/${userId}`),

    create: (data: any): Promise<Order> =>
        apiClient.post<Order>('/Orders/Create', data),
};
