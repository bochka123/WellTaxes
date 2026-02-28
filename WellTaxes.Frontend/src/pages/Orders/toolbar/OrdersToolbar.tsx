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
}) => {
    return (
        <div className="flex items-center gap-2 justify-between mb-6">
            <div className="flex items-center gap-2 flex-col sm:flex-row">
                {!selectionMode && (
                    <>
                        <CreateOrderButton onClick={onCreateOrder} />
                        <ImportCsvButton onImport={onImportCsv} />
                    </>
                )}
                <SelectDeleteButton
                    selectionMode={selectionMode}
                    selectedCount={selectedCount}
                    isDeleting={isDeleting}
                    onToggle={onToggleSelection}
                    onDelete={onDeleteSelected}
                />
            </div>
            <div className="flex items-center gap-2 flex-col sm:flex-row">
                <FilterPanel value={filters} onChange={onFiltersChange} />
                <FilterSortPanel value={filterSort} onChange={onFilterSortChange} />
            </div>
        </div>
    );
};

export default OrdersToolbar;
