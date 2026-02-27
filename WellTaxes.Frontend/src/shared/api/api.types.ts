export interface PaginatedResponse<T> {
    items:      T[];
    totalCount: number;
    page:       number;
    pageSize:   number;
}

export const OperatorEnum = {
    EQUAL:         'eq',
    GREATER_THAN:  'gt',
    LESS_THAN:     'lt',
    LIKE:          'like',
} as const;

export type Operator = typeof OperatorEnum[keyof typeof OperatorEnum];

export interface Filter {
    field:    string;
    operator: Operator;
    value:    string;
}
