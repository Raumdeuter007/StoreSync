import { useState } from 'react';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (quantity: number) => void;
    productName: string;
    storeName: string;
    currentStock: number;
    error?: string | null;
}

const SaleModal = ({ isOpen, onClose, onConfirm, productName, storeName, currentStock, error }: SaleModalProps) => {
    const [quantity, setQuantity] = useState<number>(1);
    const [localError, setLocalError] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            setLocalError('Quantity must be greater than 0');
            return;
        }
        if (quantity > currentStock) {
            setLocalError(`Cannot sell more than current stock (${currentStock})`);
            return;
        }
        onConfirm(quantity);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        Record Sale
                    </h3>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-700 w-16">Store:</span>
                            <span className="text-sm text-gray-900">{storeName}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-700 w-16">Product:</span>
                            <span className="text-sm text-gray-900">{productName}</span>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sale Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={currentStock}
                            value={quantity}
                            onChange={(e) => {
                                setQuantity(Number(e.target.value));
                                setLocalError('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Current stock: {currentStock}
                        </p>
                    </div>

                    {(error || localError) && (
                        <div className="text-red-500 text-sm">
                            {error || localError}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Record Sale
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleModal; 