export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    amount: number;
    amountWithTax: number;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

export interface GetOrdersParams {
    page:     number;
    pageSize: number;
    sortBy:   keyof Pick<Order, 'createdAt' | 'updatedAt' | 'amount' | 'amountWithTax' | 'orderNumber'>;
    sortDir:  'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data:     T[];
    total:    number;
    page:     number;
    pageSize: number;
}
