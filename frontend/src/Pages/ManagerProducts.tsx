import { useEffect, useState } from "react";
import ManagerProductsTable from "../Components/ManagerProductsTable";

interface Product {
    ProductID: number;
    ProductName: string;
    BusinessID: number;
    Category: string;
    PricePerUnit: number;
}

export function ManagerProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState('');

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
                } else {
                    setError('Failed to fetch products');
                }
            } catch (err) {
                console.error(err);
                setError('An error occurred while fetching products');
            }
        };
        fetchData();
    }, []);

    return (
        <div className="mt-16 flex">
            <div className="flex-1 px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <ManagerProductsTable data={products} />
            </div>
        </div>
    );
} 