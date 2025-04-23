import { useEffect, useState } from 'react';
import SaleModal from '../Components/SaleModal';

/**
 * Interface for inventory items received from the API
 */
interface InventoryItem {
    StoreName: string;
    ProductName: string;
    stockQuantity: number;
    ProductID: number;
    StoreID: number;
    MinQuantity?: number;
}

/**
 * Interface for store details
 */
interface StoreDetails {
    StoreID: number;
    StoreName: string;
}

/**
 * Interface for products that need reordering
 */
interface ReorderProduct {
    ProductID: number;
    ProductName: string;
    stockQuantity: number;
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
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [selectedSaleProduct, setSelectedSaleProduct] = useState<InventoryItem | null>(null);
    const [saleError, setSaleError] = useState<string | null>(null);
    const [storeDetails, setStoreDetails] = useState<StoreDetails[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Add useEffect to update formData when selectedProduct changes
    useEffect(() => {
        if (selectedProduct) {
            setFormData({
                amount: selectedProduct.ReorderAmount,
                message: `Requesting reorder for ${selectedProduct.ProductName} due to low stock. Current quantity: ${selectedProduct.stockQuantity}, Minimum required: ${selectedProduct.MinQuantity || 5}`
            });
        }
    }, [selectedProduct]);

    /**
     * Fetches store details from the API
     */
    useEffect(() => {
        const fetchStoreDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/manager/store', {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch store details');
                }

                const data: StoreDetails[] = await response.json();
                setStoreDetails(data);
            } catch (err) {
                console.error('Store details fetch error:', err);
                setError('Failed to load store details');
            }
        };

        fetchStoreDetails();
    }, []);

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
            message: `Requesting reorder for ${product.ProductName} due to low stock. Current quantity: ${product.stockQuantity}, Minimum required: ${product.MinQuantity || 5}`
        });
        setShowReorderModal(true);
    };

    /**
     * Handles the sale action for a product
     * @param product The product to sell
     */
    const handleSaleClick = (product: InventoryItem) => {
        if (!storeDetails || storeDetails.length === 0) {
            setSaleError('Store details not available. Please try again.');
            return;
        }
        setSelectedSaleProduct(product);
        setShowSaleModal(true);
        setSaleError(null);
    };

    /**
     * Handles the sale confirmation
     * @param quantity The quantity to sell
     */
    const handleSaleConfirm = async (quantity: number) => {
        if (!selectedSaleProduct || !storeDetails || storeDetails.length === 0) return;

        try {
            const response = await fetch(
                `http://localhost:5000/manager/sale/${storeDetails[0].StoreID}/${selectedSaleProduct.ProductID}/${quantity}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to record sale');
            }

            // Close modal and refresh the page to show updated inventory
            setShowSaleModal(false);
            window.location.reload();
        } catch (err) {
            setSaleError('Failed to record sale. Please try again.');
        }
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
     * Confirms and processes the reorder request
     */
    const handleConfirmReorder = async () => {
        if (!selectedProduct || !validateForm()) {
            return;
        }

        if (!storeDetails || storeDetails.length === 0) {
            setError('Store details not available. Please try again.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/add_stockreq', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    storeID: storeDetails[0].StoreID.toString(),
                    productID: selectedProduct.ProductID.toString(),
                    quantity: formData.amount.toString(),
                    message: formData.message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to place reorder');
            }

            // Show success message
            setSuccessMessage(`Stock request for ${selectedProduct.ProductName} has been successfully created.`);
            setShowSuccessModal(true);
            setShowReorderModal(false);
        } catch (err) {
            console.error('Reorder error:', err);
            setError('Failed to place reorder. Please try again.');
        } finally {
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
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-medium text-red-800">
                                    Low Stock Alerts
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p className="mb-3">The following products are running low on stock and need to be reordered:</p>
                                    <ul className="space-y-2">
                                        {reorderProducts.map((product) => (
                                            <li key={product.ProductID} className="flex items-center justify-between bg-white/50 p-3 rounded-md">
                                                <div className="flex-1">
                                                    <span className="font-medium">{product.ProductName}</span>
                                                    <div className="text-sm text-red-600 mt-1">
                                                        <span>Current Stock: {product.stockQuantity}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>Minimum Required: {product.MinQuantity || 5}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleReorder(product)}
                                                    className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                >
                                                    Reorder Now
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
                                {storeItems.map((item) => (
                                    <tr 
                                        key={`${item.StoreID}-${item.ProductID}`}
                                        className={reorderProducts.some(p => p.ProductName === item.ProductName) ? 'bg-red-50' : ''}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.ProductName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.stockQuantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {reorderProducts.some(p => p.ProductName === item.ProductName) ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            {reorderProducts.some(p => p.ProductName === item.ProductName) && (
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
                                            <button
                                                onClick={() => handleSaleClick(item)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                            >
                                                Record Sale
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Reorder Modal */}
            {showReorderModal && selectedProduct && (
                <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="bg-white/95 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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
                                    value={formData.amount || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            amount: value === '' ? 0 : Number(value)
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }));
                                    }}
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

            {/* Sale Modal */}
            {showSaleModal && selectedSaleProduct && storeDetails.length > 0 && (
                <SaleModal
                    isOpen={showSaleModal}
                    onClose={() => {
                        setShowSaleModal(false);
                        setSelectedSaleProduct(null);
                        setSaleError(null);
                    }}
                    onConfirm={handleSaleConfirm}
                    productName={selectedSaleProduct.ProductName}
                    storeName={storeDetails[0].StoreName}
                    currentStock={selectedSaleProduct.stockQuantity}
                    error={saleError}
                />
            )}

            {/* Success Message Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-center mb-4">
                            <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                            Success!
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            {successMessage}
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    window.location.href = '/manager/stock_req';
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                View Stock Requests
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inventory; 