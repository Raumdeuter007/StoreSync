import { useEffect, useState } from 'react';

/**
 * Interface representing an inventory item with store and product details
 */
interface InventoryItem {
    StoreID: number;
    StoreName: string;
    ProductID: number;
    ProductName: string;
    stockQuantity: number;
    MinQuantity: number;
    MaxQuantity: number;
}

/**
 * Interface for grouped inventory data by store
 */
interface StoreInventory {
    storeId: number;
    storeName: string;
    inventory: InventoryItem[];
}

/**
 * Interface for the reorder form data
 */
interface ReorderFormData {
    amount: number;
    message: string;
}

/**
 * OwnerInventory component displays inventory data across all stores
 * with low stock alerts and store-wise inventory tables
 */
export function OwnerInventory() {
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState<ReorderFormData>({
        amount: 0,
        message: ''
    });
    const [formError, setFormError] = useState('');

    // Fetch inventory data when component mounts
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('http://localhost:5000/owner/inventory', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory data');
                }

                const data = await response.json();
                setInventoryData(data);
            } catch (err) {
                setError('Failed to load inventory data');
                console.error('Error fetching inventory:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Group inventory items by store
    const groupByStore = (items: InventoryItem[]): StoreInventory[] => {
        const storeMap = new Map<number, StoreInventory>();
        
        items.forEach(item => {
            if (!storeMap.has(item.StoreID)) {
                storeMap.set(item.StoreID, {
                    storeId: item.StoreID,
                    storeName: item.StoreName,
                    inventory: []
                });
            }
            storeMap.get(item.StoreID)?.inventory.push(item);
        });

        return Array.from(storeMap.values());
    };

    // Get low stock items across all stores
    const getLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
        return items.filter(item => item.stockQuantity <= item.MinQuantity);
    };

    /**
     * Handles the reorder action for a product
     */
    const handleReorder = (item: InventoryItem) => {
        setSelectedItem(item);
        const suggestedAmount = item.MaxQuantity - item.stockQuantity;
        setFormData({
            amount: suggestedAmount > 0 ? suggestedAmount : 1,
            message: `Requesting reorder for ${item.ProductName} at ${item.StoreName}. Current quantity: ${item.stockQuantity}, Minimum required: ${item.MinQuantity}`
        });
        setShowReorderModal(true);
    };

    /**
     * Validates the reorder form data
     */
    const validateForm = (): boolean => {
        if (formData.amount <= 0) {
            setFormError('Reorder amount must be greater than 0');
            return false;
        }
        if (!formData.message.trim()) {
            setFormError('Please provide a message for the reorder request');
            return false;
        }
        setFormError('');
        return true;
    };

    /**
     * Handles form input changes
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    /**
     * Confirms and processes the reorder request
     */
    const handleConfirmReorder = async () => {
        if (!selectedItem || !validateForm()) return;

        try {
            const response = await fetch('http://localhost:5000/add_stockreq', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    storeID: selectedItem.StoreID.toString(),
                    productID: selectedItem.ProductID.toString(),
                    quantity: formData.amount.toString(),
                    message: formData.message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to place reorder');
            }

            // Refresh the page to show updated inventory
            window.location.reload();
        } catch (err) {
            console.error('Reorder error:', err);
            setError('Failed to place reorder. Please try again.');
        } finally {
            setShowReorderModal(false);
            setSelectedItem(null);
            setFormData({ amount: 0, message: '' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    const storeInventories = groupByStore(inventoryData);
    const lowStockItems = getLowStockItems(inventoryData);

    return (
        <div className="mt-16 px-6 py-4">
            {/* Low Stock Alerts Section */}
            {lowStockItems.length > 0 && (
                <div className="mb-8">
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Low Stock Alerts
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {lowStockItems.map((item) => (
                                            <li key={`${item.StoreID}-${item.ProductName}`} className="flex items-center justify-between">
                                                <span>
                                                    {item.ProductName} - Store: {item.StoreName} - Current: {item.stockQuantity}, Min: {item.MinQuantity}
                                                </span>
                                                <button
                                                    onClick={() => handleReorder(item)}
                                                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                                                >
                                                    Reorder
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Business Inventory</h1>
                <p className="mt-2 text-gray-600">View inventory across all your stores</p>
            </div>

            {/* Store-wise Inventory Tables */}
            {storeInventories.map((storeInventory) => (
                <div key={storeInventory.storeId} className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg p-4">
                        <h2 className="text-2xl font-bold text-white">{storeInventory.storeName}</h2>
                    </div>
                    
                    <div className="bg-white rounded-b-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {storeInventory.inventory.map((item) => {
                                    const isLowStock = item.stockQuantity <= item.MinQuantity;
                                    return (
                                        <tr 
                                            key={`${item.StoreID}-${item.ProductName}`}
                                            className={isLowStock ? 'bg-red-50' : ''}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.ProductName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.stockQuantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {isLowStock ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        In Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {isLowStock && (
                                                    <button
                                                        onClick={() => handleReorder(item)}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                    >
                                                        Reorder
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Reorder Modal */}
            {showReorderModal && selectedItem && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Reorder {selectedItem.ProductName} for {selectedItem.StoreName}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reorder Amount
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    min="1"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add any additional information about this reorder request..."
                                />
                            </div>

                            {formError && (
                                <div className="text-red-500 text-sm">{formError}</div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowReorderModal(false);
                                    setSelectedItem(null);
                                    setFormData({ amount: 0, message: '' });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReorder}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                                Confirm Reorder
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OwnerInventory; 