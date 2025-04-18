import { useEffect, useState } from "react";
import StockTable from "../Components/StockTable";

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
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<StockRequestForm>({
        storeID: '',
        productID: '',
        quantity: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqResponse, storeResponse, productsResponse] = await Promise.all([
                    fetch('http://localhost:5000/owner/stockReq', {
                        credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }),
                    fetch('http://localhost:5000/owner/stores', {
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

        setFilteredReqs(filtered);
    }, [selectedStores, selectedProducts, stockReqs]);

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

    return (
        <div className="mt-16 flex">
            {/* Sidebar */}
            <div className="w-64 fixed left-0 top-16 h-full bg-gray-50 border-r border-gray-200 shadow-lg">
                <div className="p-6 space-y-8">
                    {/* Store Filters */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Stores
                        </h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {stores.map(store => (
                                <label key={store.StoreID} 
                                    className="flex items-center p-2 rounded-lg hover:bg-white transition-colors duration-150 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedStores.includes(store.StoreID)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStores([...selectedStores, store.StoreID]);
                                                } else {
                                                    setSelectedStores(selectedStores.filter(id => id !== store.StoreID));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center
                                            ${selectedStores.includes(store.StoreID) 
                                                ? 'bg-blue-500 border-blue-500' 
                                                : 'border-gray-300 group-hover:border-blue-400'}`}>
                                            {selectedStores.includes(store.StoreID) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-3 text-sm ${selectedStores.includes(store.StoreID) 
                                        ? 'text-blue-600 font-medium' 
                                        : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {store.StoreName}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Filters */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Products
                        </h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {products.map(product => (
                                <label key={product.ProductID} 
                                    className="flex items-center p-2 rounded-lg hover:bg-white transition-colors duration-150 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.ProductID)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts([...selectedProducts, product.ProductID]);
                                                } else {
                                                    setSelectedProducts(selectedProducts.filter(id => id !== product.ProductID));
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded transition-colors duration-200 flex items-center justify-center
                                            ${selectedProducts.includes(product.ProductID) 
                                                ? 'bg-blue-500 border-blue-500' 
                                                : 'border-gray-300 group-hover:border-blue-400'}`}>
                                            {selectedProducts.includes(product.ProductID) && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`ml-3 text-sm ${selectedProducts.includes(product.ProductID) 
                                        ? 'text-blue-600 font-medium' 
                                        : 'text-gray-600 group-hover:text-gray-900'}`}>
                                        {product.ProductName}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <button
                        onClick={() => {
                            setSelectedStores([]);
                            setSelectedProducts([]);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg 
                            hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-all duration-200 
                            flex items-center justify-center space-x-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Clear Filters</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 flex-1 px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Stock Requests</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Create New Stock Request
                    </button>
                </div>

                <StockTable data={filteredReqs} />
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
        </div>
    );
}

