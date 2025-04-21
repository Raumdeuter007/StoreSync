import { useEffect, useState } from "react";
import StockTable from "../Components/StockTable";
import { Sidebar } from '../Components/Sidebar';

interface InventoryItem {
	RequestID: number;
	RequestingStoreID: number;
	StoreName: string;
	ProductID: number;
	ProductName: string;
	RequestedQuantity: number;
	ReqStatus: number;
	request_date: string;
}

interface Store {
    StoreID: number;
    StoreName: string;
}

interface Product {
    ProductID: number;
    ProductName: string;
}

interface StockRequestForm {
    storeID: string;
    productID: string;
    quantity: string;
    message: string;
}

export function Stock_Owner() {
    const [stockReqs, setStockReqs] = useState<InventoryItem[]>([]);
    const [filteredReqs, setFilteredReqs] = useState<InventoryItem[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedStores, setSelectedStores] = useState<number[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<StockRequestForm>({
        storeID: '',
        productID: '',
        quantity: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    const statusOptions = [
        { id: 1, name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { id: 2, name: 'Approved', color: 'bg-green-100 text-green-800' },
        { id: 3, name: 'Rejected', color: 'bg-red-100 text-red-800' },
        { id: 5, name: 'Completed', color: 'bg-blue-100 text-blue-800' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqResponse, storeResponse, productsResponse] = await Promise.all([
                    fetch('http://localhost:5000/owner/stockReq', {
                        credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }),
                    fetch('http://localhost:5000/owner/store', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }),
                    fetch('http://localhost:5000/products', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    })
                ]);

                if (reqResponse.ok && storeResponse.ok && productsResponse.ok) {
                    const [reqData, storeData, productsData] = await Promise.all([
                        reqResponse.json(),
                        storeResponse.json(),
                        productsResponse.json()
                    ]);

                    const enrichedData = reqData.map((item: InventoryItem) => ({
                        ...item,
                        StoreName: storeData.find((s: Store) => s.StoreID === item.RequestingStoreID)?.StoreName || "Unknown Store",
                        ProductName: productsData.find((p: Product) => p.ProductID === item.ProductID)?.ProductName || "Unknown Product"
                    }));

                    setStockReqs(enrichedData);
                    setFilteredReqs(enrichedData);
                    setStores(storeData);
                    setProducts(productsData);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...stockReqs];

        if (selectedStores.length > 0) {
            filtered = filtered.filter(item => selectedStores.includes(item.RequestingStoreID));
        }

        if (selectedProducts.length > 0) {
            filtered = filtered.filter(item => selectedProducts.includes(item.ProductID));
        }

        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(item => selectedStatuses.includes(item.ReqStatus));
        }

        setFilteredReqs(filtered);
    }, [selectedStores, selectedProducts, selectedStatuses, stockReqs]);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5000/add_stockreq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
                body: new URLSearchParams({
                    storeID: formData.storeID,
                    productID: formData.productID,
                    quantity: formData.quantity,
                    message: formData.message
                })
            });

            if (response.ok) {
                setSuccess('Stock request created successfully!');
                setFormData({
                    storeID: '',
                    productID: '',
                    quantity: '',
                    message: ''
                });
                // Refresh the stock requests list
                window.location.reload();
            } else {
                setError('Failed to create stock request');
            }
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        }
    };

    const handleStoreChange = (id: number) => {
        setSelectedStores(prev => 
            prev.includes(id) 
                ? prev.filter(storeId => storeId !== id)
                : [...prev, id]
        );
    };

    const handleProductChange = (id: number) => {
        setSelectedProducts(prev => 
            prev.includes(id) 
                ? prev.filter(productId => productId !== id)
                : [...prev, id]
        );
    };

    const handleStatusChange = (id: number) => {
        setSelectedStatuses(prev => 
            prev.includes(id) 
                ? prev.filter(statusId => statusId !== id)
                : [...prev, id]
        );
    };

    const handleClearFilters = () => {
        setSelectedStores([]);
        setSelectedProducts([]);
        setSelectedStatuses([]);
    };

    const handleDelete = async (requestId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/stock_req/${requestId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setStockReqs(prev => prev.filter(req => req.RequestID !== requestId));
                setFilteredReqs(prev => prev.filter(req => req.RequestID !== requestId));
                setShowDeleteModal(false);
                setSelectedRequestId(null);
            } else {
                throw new Error('Failed to delete request');
            }
        } catch (err) {
            console.error('Error deleting request:', err);
            setError('Failed to delete request');
        }
    };

    return (
        <div className="mt-16 flex">
            <Sidebar
                stores={stores}
                products={products}
                statusOptions={statusOptions}
                selectedStores={selectedStores}
                selectedProducts={selectedProducts}
                selectedStatuses={selectedStatuses}
                onStoreChange={handleStoreChange}
                onProductChange={handleProductChange}
                onStatusChange={handleStatusChange}
                onClearFilters={handleClearFilters}
            />

            {/* Main Content */}
            <div className="ml-64 flex-1 px-4 py-6 overflow-x-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Stock Requests</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 font-medium text-sm"
                    >
                        Create New Stock Request
                    </button>
                </div>

                <StockTable 
                    data={filteredReqs} 
                    onDelete={(requestId) => {
                        setSelectedRequestId(requestId);
                        setShowDeleteModal(true);
                    }}
                />
            </div>

            {/* Modal Form */}
            {showModal && (
                <>
                    {/* Semi-transparent backdrop */}
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity z-40"
                        onClick={() => setShowModal(false)}
                    />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-50">
                        <div className="flex h-full items-center justify-center p-4">
                            <div 
                                className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full sm:max-w-lg"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="bg-white px-6 pt-5 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Create Stock Request</h2>
                                </div>

                                {/* Modal Body */}
                                <div className="bg-white px-6 pt-2 pb-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Store
                                            </label>
                                            <select
                                                value={formData.storeID}
                                                onChange={(e) => setFormData({...formData, storeID: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                required
                                            >
                                                <option value="">Select Store</option>
                                                {stores.map(store => (
                                                    <option key={store.StoreID} value={store.StoreID}>
                                                        {store.StoreName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product
                                            </label>
                                            <select
                                                value={formData.productID}
                                                onChange={(e) => setFormData({...formData, productID: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(product => (
                                                    <option key={product.ProductID} value={product.ProductID}>
                                                        {product.ProductName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Message
                                            </label>
                                            <textarea
                                                value={formData.message}
                                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                rows={3}
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="text-red-500 text-sm">{error}</div>
                                        )}
                                        {success && (
                                            <div className="text-green-500 text-sm">{success}</div>
                                        )}
                                    </form>
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-2">
                                    <button
                                        type="submit"
                                        onClick={handleSubmit}
                                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                                    >
                                        Create Request
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity z-40"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    
                    <div className="fixed inset-0 z-50">
                        <div className="flex h-full items-center justify-center p-4">
                            <div 
                                className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full sm:max-w-lg"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="bg-white px-6 pt-5 pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                                Delete Stock Request
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to delete this stock request? This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => selectedRequestId && handleDelete(selectedRequestId)}
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

