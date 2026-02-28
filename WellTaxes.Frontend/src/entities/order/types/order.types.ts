import type { Filter, PaginatedResponse } from '@/shared/api/api.types.ts';

export interface TaxBreakdown {
    stateRate:   number;
    countryRate: number;
    cityRate:    number;
    specialRate: number;
}

export interface JurisdictionInfo {
    zipCode:       string;
    taxRegionName: string;
}

export interface Order {
    id:                  string;
    orderNumber:         string;
    subtotal:            number;
    taxAmount:           number;
    totalAmount:         number;
    compositeTaxRate:    number;
    timestamp:           string;
    latitude:            number;
    longitude:           number;
    breakdown:           TaxBreakdown;
    jurisdictionInfoDto: JurisdictionInfo;
}

export type SortField =
    | keyof Pick<Order, 'orderNumber' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'compositeTaxRate' | 'timestamp' | 'latitude' | 'longitude'>
    | keyof Pick<TaxBreakdown, 'stateRate' | 'countryRate' | 'cityRate' | 'specialRate'>
    | keyof Pick<JurisdictionInfo, 'zipCode' | 'taxRegionName'>;

export interface GetOrdersParams {
    page:            number;
    pageSize:        number;
    sortBy?:         SortField;
    sortDescending?: boolean;
    filters?:        Filter[];
}

export interface PaginatedOrders extends PaginatedResponse<Order> { }
