import { type FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDeleteOrders, useImportCSV, useOrders } from '@/entities/order';
import OrdersTable from '@/pages/Orders/OrdersTable.tsx';
import Pagination from '@/pages/Orders/Pagination.tsx';
import type { FilterSortState } from '@/pages/Orders/toolbar/FilterSortPanel.tsx';
import type { Filter } from '@/shared/api/api.types.ts';
import CreateOrderModal from '@/widgets/CreateOrderModal';

import OrdersToolbar from './toolbar/OrdersToolbar';

const Orders: FC = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filterSort, setFilterSort] = useState<FilterSortState>({
        sortBy:         'timestamp',
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

    const { mutate: importCSV } = useImportCSV();
    const { mutate: deleteOrders, isPending: isDeleting } = useDeleteOrders();
    const { t } = useTranslation();
    const toastIdRef = useRef<string | number | undefined>(undefined);

    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggleSelection = (): void => {
        setSelectionMode((v) => !v);
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = (): void => {
        const ids = Array.from(selectedIds);
        toastIdRef.current = toast.loading(t('delete.loading', { count: ids.length }));
        deleteOrders(ids, {
            onSuccess: () => {
                toast.dismiss(toastIdRef.current);
                toast.success(t('delete.success', { count: ids.length }));
                setSelectedIds(new Set());
                setSelectionMode(false);
            },
            onError: (err) => {
                toast.dismiss(toastIdRef.current);
                toast.error(t('delete.error'), { description: err.message });
            },
        });
    };

    const handleImportCsv = (file: File): void => {
        toastIdRef.current = toast.loading(t('import.loading'));
        importCSV(file, {
            onSuccess: (data) => {
                toast.dismiss(toastIdRef.current);
                const { successCount, failedCount, totalRecords } = data.result;

                if (failedCount === 0) {
                    toast.success(t('import.success', { count: successCount }));
                } else if (successCount > 0) {
                    toast.warning(t('import.partialWarning', { success: successCount, total: totalRecords, failed: failedCount }), {
                        description: t('import.partialWarningDesc'),
                    });
                } else {
                    toast.error(t('import.allFailed'), {
                        description: t('import.allFailedDesc'),
                    });
                }
            },
            onError: (err) => {
                toast.dismiss(toastIdRef.current);
                toast.error(t('import.error'), { description: err.message });
            },
        });
    };

    const handleCreateOrder = (): void => {
        setModalVisible(true);
    };

    return (
        <div className="flex justify-center w-full">
            <div className="flex flex-col gap-4 px-6 py-6 w-full max-w-300 min-w-0">
                <OrdersToolbar
                    filters={filters}
                    filterSort={filterSort}
                    selectionMode={selectionMode}
                    selectedCount={selectedIds.size}
                    isDeleting={isDeleting}
                    onFilterSortChange={setFilterSort}
                    onFiltersChange={setFilters}
                    onCreateOrder={handleCreateOrder}
                    onImportCsv={handleImportCsv}
                    onToggleSelection={handleToggleSelection}
                    onDeleteSelected={handleDeleteSelected}
                />
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm px-4 py-2">
                    <OrdersTable
                        orders={orders?.items ?? []}
                        isLoading={isLoading}
                        selectionMode={selectionMode}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                    />
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
