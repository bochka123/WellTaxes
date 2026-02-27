export interface Order {
    Id: string;
    OrderNumber: string;
    UserId: string;
    Amount: number;
    AmountWithTax: number;
    Latitude: number;
    Longitude: number;
    CreatedAt: string;
    UpdatedAt: string;
}

export const MOCK_ORDERS: Order[] = [
    { Id: '1',  OrderNumber: 'ORD-0001', UserId: 'u1', Amount: 10000,  AmountWithTax: 12000,  Latitude: 50.4501, Longitude: 30.5234, CreatedAt: '2026-02-20T10:00:00Z', UpdatedAt: '2026-02-20T10:00:00Z' },
    { Id: '2',  OrderNumber: 'ORD-0002', UserId: 'u2', Amount: 2667,   AmountWithTax: 3200,   Latitude: 49.8397, Longitude: 24.0297, CreatedAt: '2026-02-21T11:30:00Z', UpdatedAt: '2026-02-21T11:30:00Z' },
    { Id: '3',  OrderNumber: 'ORD-0003', UserId: 'u1', Amount: 72917,  AmountWithTax: 87500,  Latitude: 48.9226, Longitude: 24.7111, CreatedAt: '2026-02-21T14:00:00Z', UpdatedAt: '2026-02-22T09:00:00Z' },
    { Id: '4',  OrderNumber: 'ORD-0004', UserId: 'u3', Amount: 4667,   AmountWithTax: 5600,   Latitude: 47.8388, Longitude: 35.1396, CreatedAt: '2026-02-22T08:15:00Z', UpdatedAt: '2026-02-22T08:15:00Z' },
    { Id: '5',  OrderNumber: 'ORD-0005', UserId: 'u2', Amount: 18417,  AmountWithTax: 22100,  Latitude: 50.6199, Longitude: 26.2516, CreatedAt: '2026-02-22T16:45:00Z', UpdatedAt: '2026-02-23T10:00:00Z' },
    { Id: '6',  OrderNumber: 'ORD-0006', UserId: 'u4', Amount: 1542,   AmountWithTax: 1850,   Latitude: 46.9591, Longitude: 31.9974, CreatedAt: '2026-02-23T09:00:00Z', UpdatedAt: '2026-02-23T09:00:00Z' },
    { Id: '7',  OrderNumber: 'ORD-0007', UserId: 'u1', Amount: 35833,  AmountWithTax: 43000,  Latitude: 49.5535, Longitude: 25.5948, CreatedAt: '2026-02-23T12:00:00Z', UpdatedAt: '2026-02-24T08:00:00Z' },
    { Id: '8',  OrderNumber: 'ORD-0008', UserId: 'u3', Amount: 6083,   AmountWithTax: 7300,   Latitude: 50.4501, Longitude: 30.5234, CreatedAt: '2026-02-24T10:30:00Z', UpdatedAt: '2026-02-24T10:30:00Z' },
    { Id: '9',  OrderNumber: 'ORD-0009', UserId: 'u5', Amount: 800,    AmountWithTax: 960,    Latitude: 51.5022, Longitude: 31.2893, CreatedAt: '2026-02-25T07:00:00Z', UpdatedAt: '2026-02-25T07:00:00Z' },
    { Id: '10', OrderNumber: 'ORD-0010', UserId: 'u2', Amount: 13125,  AmountWithTax: 15750,  Latitude: 49.8397, Longitude: 24.0297, CreatedAt: '2026-02-25T15:00:00Z', UpdatedAt: '2026-02-25T15:00:00Z' },
    { Id: '11', OrderNumber: 'ORD-0011', UserId: 'u4', Amount: 27667,  AmountWithTax: 33200,  Latitude: 48.4647, Longitude: 35.0462, CreatedAt: '2026-02-26T08:00:00Z', UpdatedAt: '2026-02-26T08:00:00Z' },
    { Id: '12', OrderNumber: 'ORD-0012', UserId: 'u1', Amount: 1750,   AmountWithTax: 2100,   Latitude: 48.9226, Longitude: 24.7111, CreatedAt: '2026-02-26T09:30:00Z', UpdatedAt: '2026-02-26T09:30:00Z' },
];
