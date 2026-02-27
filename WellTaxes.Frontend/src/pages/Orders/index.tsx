import { type FC, useState } from 'react';

import { useOrders } from '@/entities/order';
import OrdersTable from '@/pages/Orders/OrdersTable.tsx';
import Pagination from '@/pages/Orders/Pagination.tsx';
import type { FilterSortState } from '@/pages/Orders/toolbar/FilterSortPanel.tsx';
import type { Filter } from '@/shared/api/api.types.ts';
import Spinner from '@/shared/ui/Spinner';
import CreateOrderModal from '@/widgets/CreateOrderModal.tsx';

import OrdersToolbar from './toolbar/OrdersToolbar';

const Orders: FC = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filterSort, setFilterSort] = useState<FilterSortState>({
        sortBy:         'createdAt',
        sortDescending: true,
    });
    const [filters, setFilters] = useState<Filter[]>([]);

    const { data: orders, isLoading } = useOrders({
        page,
        pageSize,
        sortBy: filterSort.sortBy,
        sortDescending: filterSort.sortDescending,
        filters: filters.length ? filters : undefined,
    });

    const handleCreateOrder = (): void => {
        setModalVisible(true);
    };

    const handleImportCsv = (file: File): void => {
        alert(`TODO: import file "${file.name}"`);
    };
    
    return (
        <div className="flex justify-center min-h-screen w-full">
            <div className="flex flex-col gap-4 px-6 py-6 max-w-6xl w-6xl">
                <OrdersToolbar
                    filters={filters}
                    filterSort={filterSort}
                    onFilterSortChange={setFilterSort}
                    onFiltersChange={setFilters}
                    onCreateOrder={handleCreateOrder}
                    onImportCsv={handleImportCsv}
                />
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm px-6 py-2">
                    <OrdersTable orders={orders?.items ?? []} />
                    {
                        isLoading && <Spinner />
                    }
                    <Pagination
                        total={orders?.totalCount ?? 0}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    />
                </div>
            </div>

            <CreateOrderModal visible={modalVisible} setVisible={setModalVisible} />
        </div>
    );
};

export default Orders;
