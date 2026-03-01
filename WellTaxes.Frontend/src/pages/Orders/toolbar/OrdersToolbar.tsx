import { type FC } from 'react';

import FilterPanel from '@/pages/Orders/toolbar/FilterPanel.tsx';
import FilterSortPanel, { type FilterSortState } from '@/pages/Orders/toolbar/FilterSortPanel.tsx';
import type { Filter } from '@/shared/api/api.types.ts';

import CreateOrderButton from './CreateOrderButton';
import ImportCsvButton from './ImportCsvButton';
import SelectDeleteButton from './SelectDeleteButton';

interface Props {
    filterSort:         FilterSortState;
    filters:            Filter[];
    selectionMode:      boolean;
    selectedCount:      number;
    isDeleting:         boolean;
    onFilterSortChange: (v: FilterSortState) => void;
    onFiltersChange:    (v: Filter[]) => void;
    onCreateOrder:      () => void;
    onImportCsv:        (file: File) => void;
    onToggleSelection:  () => void;
    onDeleteSelected:   () => void;
}

const OrdersToolbar: FC<Props> = ({
    filterSort, filters, selectionMode, selectedCount, isDeleting,
    onFilterSortChange, onFiltersChange, onCreateOrder, onImportCsv,
    onToggleSelection, onDeleteSelected,
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {!selectionMode && (
                <>
                    <CreateOrderButton onClick={onCreateOrder} className="flex-1 sm:flex-none" />
                    <ImportCsvButton onImport={onImportCsv} className="flex-1 sm:flex-none" />
                </>
            )}
            <SelectDeleteButton
                selectionMode={selectionMode}
                selectedCount={selectedCount}
                isDeleting={isDeleting}
                onToggle={onToggleSelection}
                onDelete={onDeleteSelected}
                className="flex-1 sm:flex-none"
            />
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <FilterPanel value={filters} onChange={onFiltersChange} className="flex-1 sm:flex-none" />
            <FilterSortPanel value={filterSort} onChange={onFilterSortChange} className="flex-1 sm:flex-none" />
        </div>

    </div>
);

export default OrdersToolbar;
