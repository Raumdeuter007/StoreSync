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
            <div className="w-64 fixed left-0 top-16 h-full bg-white border-r border-gray-200 p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Store Filters */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Filter by Stores
                        </h3>
                        <div className="space-y-2">
                            {stores.map(store => (
                                <label key={store.StoreID} className="flex items-center space-x-2 cursor-pointer">
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
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">{store.StoreName}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Filters */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Filter by Products
                        </h3>
                        <div className="space-y-2">
                            {products.map(product => (
                                <label key={product.ProductID} className="flex items-center space-x-2 cursor-pointer">
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
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-600">{product.ProductName}</span>
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
                        className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Clear Filters
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create Stock Request</h2>
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

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Create Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

