import { useEffect, useState } from "react";
import ProductsTable from "../Components/ProductsTable";

interface Product {
    ProductID: number;
    ProductName: string;
    BusinessID: number;
    Category: string;
    PricePerUnit: number;
}

export function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        ProductName: '',
        Category: '',
        PricePerUnit: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/products', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch products');
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new URLSearchParams();
            formDataToSend.append('name', formData.ProductName);
            formDataToSend.append('category', formData.Category);
            formDataToSend.append('price', formData.PricePerUnit);

            const response = await fetch('http://localhost:5000/owner/add_product', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formDataToSend.toString()
            });

            if (response.ok) {
                setSuccess('Product added successfully');
                setShowModal(false);
                setFormData({
                    ProductName: '',
                    Category: '',
                    PricePerUnit: ''
                });
                // Refresh the products list
                const updatedResponse = await fetch('http://localhost:5000/products', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                if (updatedResponse.ok) {
                    const data = await updatedResponse.json();
                    setProducts(data);
                }
            } else {
                setError('Failed to add product');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while adding the product');
        }
    };

    return (
        <div className="mt-16 flex">
            <div className="flex-1 px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium text-base"
                    >
                        Add New Product
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                <ProductsTable data={products} />
            </div>

            {/* Add Product Modal */}
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
                                    <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                                </div>

                                <div className="bg-white px-6 pt-2 pb-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product Name
                                            </label>
                                            <input
                                                type="text"
                                                name="ProductName"
                                                value={formData.ProductName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <input
                                                type="text"
                                                name="Category"
                                                value={formData.Category}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Price Per Unit
                                            </label>
                                            <input
                                                type="number"
                                                name="PricePerUnit"
                                                value={formData.PricePerUnit}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                                required
                                            />
                                        </div>

                                        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-2">
                                            <button
                                                type="submit"
                                                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                                            >
                                                Add Product
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 