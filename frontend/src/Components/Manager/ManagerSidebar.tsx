interface ManagerSidebarProps {
    products: { ProductID: number; ProductName: string }[];
    statusOptions: { id: number; name: string; color: string }[];
    selectedProducts: number[];
    selectedStatuses: number[];
    onProductChange: (id: number) => void;
    onStatusChange: (id: number) => void;
    onClearFilters: () => void;
}

export function ManagerSidebar({
    products,
    statusOptions,
    selectedProducts,
    selectedStatuses,
    onProductChange,
    onStatusChange,
    onClearFilters
}: ManagerSidebarProps) {
    return (
        <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>

                {/* Products Filter */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-900">Products</h3>
                        <span className="text-xs text-gray-500">
                            {selectedProducts.length} selected
                        </span>
                    </div>
                    <div className="space-y-3">
                        {products.map(product => (
                            <label key={product.ProductID} className="relative flex items-start py-0.5 group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.ProductID)}
                                        onChange={() => onProductChange(product.ProductID)}
                                        className="peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 text-blue-600 
                                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                        disabled:opacity-50 disabled:checked:bg-blue-500 appearance-none checked:bg-blue-500 
                                        checked:border-blue-500 hover:border-blue-500 transition-colors duration-200"
                                    />
                                    <svg
                                        className="absolute w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div className="ml-3 flex items-center">
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        {product.ProductName}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-900">Status</h3>
                        <span className="text-xs text-gray-500">
                            {selectedStatuses.length} selected
                        </span>
                    </div>
                    <div className="space-y-3">
                        {statusOptions.map(status => (
                            <label key={status.id} className="relative flex items-start py-0.5 group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={selectedStatuses.includes(status.id)}
                                        onChange={() => onStatusChange(status.id)}
                                        className="peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 text-blue-600 
                                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed 
                                        disabled:opacity-50 disabled:checked:bg-blue-500 appearance-none checked:bg-blue-500 
                                        checked:border-blue-500 hover:border-blue-500 transition-colors duration-200"
                                    />
                                    <svg
                                        className="absolute w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <div className="ml-3 flex items-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                        {status.name}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Clear All button */}
                <button
                    onClick={onClearFilters}
                    className="w-full py-2.5 px-4 bg-white text-blue-600 hover:text-white hover:bg-blue-600 
                    font-medium rounded-lg border-2 border-blue-600 transition-all duration-200 
                    flex items-center justify-center gap-2 group"
                >
                    <svg 
                        className="w-4 h-4 transition-transform group-hover:rotate-90" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    Clear all filters
                </button>
            </div>
        </div>
    );
} 