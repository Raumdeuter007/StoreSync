import { useEffect, useState } from "react";
import StockTable from "../Components/StockTable";

export function Stock_Owner() {
    const [stockReqs, setStockReqs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/owner/stockReq`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    credentials: 'include',
                });
                const store = await fetch(`http://localhost:5000/owner/stores`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    credentials: 'include',
                });
                const products = await fetch(`http://localhost:5000/products`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    credentials: 'include',
                });
                if (res.ok && store.ok && products.ok) {
                    const productsData = await products.json();
                    const data = await res.json();
                    const storeData = await store.json();
                    for (let i = 0; i < data.length; i++) {
                        const storeId = data[i].RequestingStoreID;
                        const storeName = storeData.find((s: any) => s.StoreID === storeId)?.StoreName;
                        data[i].StoreName = storeName || "Unknown Store"; // Set default name if not found
                        const productId = data[i].ProductID;
                        const productName = productsData.find((p: any) => p.ProductID === productId)?.ProductName;
                        data[i].ProductName = productName || "Unknown Product"; // Set default name if not found
                    }
                    setStockReqs(data);
                } else {
                    throw "You are not authorized for this action";
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Stock Requests</h1>
            <StockTable data={stockReqs} />
        </div>
    );
}

