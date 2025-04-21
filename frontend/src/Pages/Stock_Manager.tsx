import { useEffect, useState } from "react";
import ManagerStockTable from "../Components/Manager/ManagerStockTable";
import { ManagerSidebar } from '../Components/Manager/ManagerSidebar';

interface InventoryItem {
	RequestID: number;
	RequestingStoreID: number;
	StoreName: string;
	ProductID: number;
	ProductName: string;
	RequestedQuantity: number;
	ReqStatus: number;
	request_date: string;
	fullfillmentdate: string;
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

export function Stock_Manager() {
    const [stockReqs, setStockReqs] = useState<InventoryItem[]>([]);
    const [filteredReqs, setFilteredReqs] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
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
    const [storeID, setStoreID] = useState<number | null>(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const statusOptions = [
        { id: 1, name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { id: 2, name: 'Approved', color: 'bg-green-100 text-green-800' },
        { id: 3, name: 'Rejected', color: 'bg-red-100 text-red-800' },
        { id: 5, name: 'Completed', color: 'bg-blue-100 text-blue-800' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqResponse, productsResponse] = await Promise.all([
                    fetch('http://localhost:5000/manager/stockReq', {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }),
                    fetch('http://localhost:5000/products', {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    })
                ]);

                if (reqResponse.ok && productsResponse.ok) {
                    const [reqData, productsData] = await Promise.all([
                        reqResponse.json(),
                        productsResponse.json()
                    ]);

                    if (reqData.length > 0) {
                        setStoreID(reqData[0].RequestingStoreID);
                    }

                    setStockReqs(reqData);
                    setFilteredReqs(reqData);
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

        if (selectedProducts.length > 0) {
            filtered = filtered.filter(item => selectedProducts.includes(item.ProductID));
        }

        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(item => selectedStatuses.includes(item.ReqStatus));
        }

        setFilteredReqs(filtered);
    }, [selectedProducts, selectedStatuses, stockReqs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!storeID) {
            setError('Store ID not found');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/add_stockreq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
                body: new URLSearchParams({
                    storeID: storeID.toString(),
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
                window.location.reload();
            } else {
                setError('Failed to create stock request');
            }
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        }
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
        setSelectedProducts([]);
        setSelectedStatuses([]);
    };

    const handleDelete = (requestId: number) => {
        setStockReqs(prev => prev.filter(req => req.RequestID !== requestId));
        setFilteredReqs(prev => prev.filter(req => req.RequestID !== requestId));
    };

    const handleComplete = (requestId: number) => {
        setStockReqs(prev => prev.map(req => 
            req.RequestID === requestId ? { ...req, ReqStatus: 5 } : req
        ));
        setFilteredReqs(prev => prev.map(req => 
            req.RequestID === requestId ? { ...req, ReqStatus: 5 } : req
        ));
    };

    return (
        <div className="mt-16 flex">
            <ManagerSidebar
                products={products}
                statusOptions={statusOptions}
                selectedProducts={selectedProducts}
                selectedStatuses={selectedStatuses}
                onProductChange={handleProductChange}
                onStatusChange={handleStatusChange}
                onClearFilters={handleClearFilters}
            />

            {/* Main Content */}
            <div className="ml-64 flex-1 px-6 py-8 overflow-x-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Stock Requests</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium text-base mr-4"
                    >
                        Create New Stock Request
                    </button>
                </div>

                <ManagerStockTable 
                    data={filteredReqs} 
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                    showCompleteModal={showCompleteModal}
                    setShowCompleteModal={setShowCompleteModal}
                />
            </div>

            {/* Create Request Modal */}
            {showModal && (
                <>
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity z-40"
                        onClick={() => setShowModal(false)}
                    />
                    
                    <div className="fixed inset-0 z-50">
                        <div className="flex h-full items-center justify-center p-4">
                            <div 
                                className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full sm:max-w-lg"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="bg-white px-6 pt-5 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Create Stock Request</h2>
                                </div>

                                <div className="bg-white px-6 pt-2 pb-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
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

