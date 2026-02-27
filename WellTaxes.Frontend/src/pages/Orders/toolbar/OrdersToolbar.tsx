import { type FC } from 'react';

import FilterSortPanel, { type FilterSortState } from '@/pages/Orders/FilterSortPanel.tsx';

import CreateOrderButton from './CreateOrderButton';
import ImportCsvButton from './ImportCsvButton';

interface Props {
    filterSort: FilterSortState;
    onFilterSortChange: (v: FilterSortState) => void;
    onCreateOrder: () => void;
    onImportCsv: (file: File) => void;
}

const OrdersToolbar: FC<Props> = ({ filterSort, onFilterSortChange, onCreateOrder, onImportCsv }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <CreateOrderButton onClick={onCreateOrder} />
                <ImportCsvButton onImport={onImportCsv} />
            </div>
            <FilterSortPanel value={filterSort} onChange={onFilterSortChange} />
        </div>
    );
};

export default OrdersToolbar;
