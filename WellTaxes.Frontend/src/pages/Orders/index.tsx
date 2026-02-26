import { type FC, useMemo, useState } from 'react';

import type { FilterSortState } from '@/pages/Orders/FilterSortPanel.tsx';
import OrdersTable from '@/pages/Orders/OrdersTable.tsx';
import CreateOrderModal from '@/widgets/CreateOrderModal.tsx';

import { MOCK_ORDERS } from './mock';
import OrdersToolbar from './toolbar/OrdersToolbar';

const Orders: FC = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const [filterSort, setFilterSort] = useState<FilterSortState>({
        sortBy:  'createdAt',
        sortDir: 'desc',
    });

    const handleCreateOrder = () => {
        setModalVisible(true);
    };

    const handleImportCsv = (file: File) => {
        alert(`TODO: import file "${file.name}"`);
    };

    const sorted = useMemo(() => {
        return [...MOCK_ORDERS].sort((a, b) => {
            let cmp = 0;
            switch (filterSort.sortBy) {
                case 'createdAt':     cmp = a.CreatedAt.localeCompare(b.CreatedAt); break;
                case 'updatedAt':     cmp = a.UpdatedAt.localeCompare(b.UpdatedAt); break;
                case 'amount':        cmp = a.Amount - b.Amount; break;
                case 'amountWithTax': cmp = a.AmountWithTax - b.AmountWithTax; break;
                case 'orderNumber':   cmp = a.OrderNumber.localeCompare(b.OrderNumber); break;
            }
            return filterSort.sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filterSort]);
    
    return (
        <div className="flex justify-center min-h-screen w-full">
            <div className="flex flex-col gap-4 px-6 py-6 max-w-6xl w-6xl">
                <OrdersToolbar
                    filterSort={filterSort}
                    onFilterSortChange={setFilterSort}
                    onCreateOrder={handleCreateOrder}
                    onImportCsv={handleImportCsv}
                />
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm px-6 py-2">
                    <OrdersTable orders={sorted} />
                </div>
            </div>

            <CreateOrderModal visible={modalVisible} setVisible={setModalVisible} />
        </div>
    );
};

export default Orders;
