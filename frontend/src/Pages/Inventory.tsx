import { useEffect, useState } from 'react';

/**
 * Interface for inventory items received from the API
 */
interface InventoryItem {
    StoreName: string;
    ProductName: string;
    stockQuantity: number;
    MinQuantity?: number; // Optional as it might come from a different endpoint
}

/**
 * Interface for products that need reordering
 */
interface ReorderProduct {
    ProductID: number;
    ProductName: string;
    CurrentQuantity: number;
    MinQuantity: number;
    MaxQuantity: number;
    ReorderAmount: number;
}

/**
 * Interface for the reorder form data
 */
interface ReorderFormData {
    amount: number;
    message: string;
}

/**
 * Main Inventory component that displays store inventory with low stock indicators
 * and reordering capabilities
 */
export function Inventory() {
    // State management
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [reorderProducts, setReorderProducts] = useState<ReorderProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ReorderProduct | null>(null);
    const [formData, setFormData] = useState<ReorderFormData>({
        amount: 0,
        message: ''
    });
    const [formError, setFormError] = useState('');

    /**
     * Fetches inventory data from the API
     */
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch('http://localhost:5000/manager/inventory', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch inventory');
                }

                const data: InventoryItem[] = await response.json();
                setInventory(data);
            } catch (err) {
                setError('Failed to load inventory');
                console.error('Inventory fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    /**
     * Fetches products that need reordering
     */
    useEffect(() => {
        const fetchReorderProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/manager/ReorderProds', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reorder products');
                }

                const data: ReorderProduct[] = await response.json();
                setReorderProducts(data);
            } catch (err) {
                console.error('Reorder products fetch error:', err);
            }
        };

        fetchReorderProducts();
    }, []);

    /**
     * Handles the reorder action for a product
     * @param product The product to reorder
     */
    const handleReorder = (product: ReorderProduct) => {
        setSelectedProduct(product);
        setFormData({
            amount: product.ReorderAmount,
            message: `Requesting reorder for ${product.ProductName} due to low stock. Current quantity: ${product.CurrentQuantity}, Minimum required: ${product.MinQuantity}`
        });
        setShowReorderModal(true);
    };

    /**
     * Validates the reorder form data
     * @returns boolean indicating if the form is valid
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
     * @param e The form event
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
        if (!selectedProduct || !validateForm()) return;

        try {
            const response = await fetch('http://localhost:5000/manager/reorder', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    productId: selectedProduct.ProductID.toString(),
                    amount: formData.amount.toString(),
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
            setSelectedProduct(null);
            setFormData({ amount: 0, message: '' });
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="mt-16 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="mt-16 flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    // Group inventory by store for organized display
    const inventoryByStore = inventory.reduce((acc, item) => {
        if (!acc[item.StoreName]) {
            acc[item.StoreName] = [];
        }
        acc[item.StoreName].push(item);
        return acc;
    }, {} as Record<string, InventoryItem[]>);

    return (
        <div className="mt-16 px-6 py-4">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="mt-2 text-gray-600">Monitor and manage your store's inventory</p>
            </div>

            {/* Low Stock Alerts Banner */}
            {reorderProducts.length > 0 && (
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
                                        {reorderProducts.map((product) => (
                                            <li key={product.ProductID} className="flex items-center justify-between">
                                                <span>
                                                    {product.ProductName} - Current: {product.CurrentQuantity}, Min: {product.MinQuantity}
                                                </span>
                                                <button
                                                    onClick={() => handleReorder(product)}
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
            
            {/* Store Inventory Tables */}
            {Object.entries(inventoryByStore).map(([storeName, storeItems]) => (
                <div key={storeName} className="mb-8">
                    {/* Store Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg p-4">
                        <h2 className="text-2xl font-bold text-white">{storeName}</h2>
                    </div>
                    
                    {/* Inventory Table */}
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
                                {storeItems.map((item, index) => {
                                    const needsReorder = reorderProducts.some(
                                        p => p.ProductName === item.ProductName
                                    );
                                    return (
                                        <tr 
                                            key={`${item.ProductName}-${index}`}
                                            className={needsReorder ? 'bg-red-50' : ''}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.ProductName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.stockQuantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {needsReorder ? (
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
                                                {needsReorder && (
                                                    <button
                                                        onClick={() => {
                                                            const product = reorderProducts.find(
                                                                p => p.ProductName === item.ProductName
                                                            );
                                                            if (product) handleReorder(product);
                                                        }}
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
            {showReorderModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Reorder {selectedProduct.ProductName}
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
                                    setSelectedProduct(null);
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

export default Inventory; 