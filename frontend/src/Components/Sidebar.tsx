import React from 'react';
import { FilterCategory } from './FilterCategory';

interface SidebarProps {
    stores: Array<{ StoreID: number; StoreName: string; }>;
    products: Array<{ ProductID: number; ProductName: string; }>;
    statusOptions: Array<{ id: number; name: string; color: string; }>;
    selectedStores: number[];
    selectedProducts: number[];
    selectedStatuses: number[];
    onStoreChange: (id: number) => void;
    onProductChange: (id: number) => void;
    onStatusChange: (id: number) => void;
    onClearFilters: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    stores,
    products,
    statusOptions,
    selectedStores,
    selectedProducts,
    selectedStatuses,
    onStoreChange,
    onProductChange,
    onStatusChange,
    onClearFilters
}) => {
    const icons = {
        store: (
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        product: (
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        status: (
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    return (
        <div className="w-64 fixed left-0 top-16 bottom-0 bg-gray-50 border-r border-gray-200 shadow-lg overflow-y-auto">
            <div className="p-4 space-y-6">
                <FilterCategory
                    title="Stores"
                    icon={icons.store}
                    options={stores.map(s => ({ id: s.StoreID, name: s.StoreName }))}
                    selectedValues={selectedStores}
                    onChange={onStoreChange}
                />

                <FilterCategory
                    title="Products"
                    icon={icons.product}
                    options={products.map(p => ({ id: p.ProductID, name: p.ProductName }))}
                    selectedValues={selectedProducts}
                    onChange={onProductChange}
                />

                <FilterCategory
                    title="Status"
                    icon={icons.status}
                    options={statusOptions}
                    selectedValues={selectedStatuses}
                    onChange={onStatusChange}
                    maxHeight="max-h-full"
                    showColors={true}
                />

                <button
                    onClick={onClearFilters}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg 
                        hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-all duration-200 
                        flex items-center justify-center space-x-2 shadow-sm"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear Filters</span>
                </button>
            </div>
        </div>
    );
}; 