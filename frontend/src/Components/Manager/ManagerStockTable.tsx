import { useState } from "react";

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

interface ManagerStockTableProps {
    data: InventoryItem[];
    onDelete: (requestId: number) => void;
    onComplete: (requestId: number) => void;
    showCompleteModal: boolean;
    setShowCompleteModal: (show: boolean) => void;
}

const ManagerStockTable = ({ 
    data, 
    onDelete, 
    onComplete, 
    showCompleteModal, 
    setShowCompleteModal 
}: ManagerStockTableProps) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

    const handleDelete = async (requestId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/stock_req/${requestId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                onDelete(requestId);
                setShowDeleteModal(false);
                setSelectedRequestId(null);
            } else {
                throw new Error('Failed to delete request');
            }
        } catch (err) {
            console.error('Error deleting request:', err);
        }
    };

    const handleComplete = async (requestId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/manager/complete_req/${requestId}`, {
                method: 'PUT',
                credentials: 'include',
            });

            if (response.ok) {
                onComplete(requestId);
            } else {
                throw new Error('Failed to complete request');
            }
        } catch (err) {
            console.error('Error completing request:', err);
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
            case 2:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 3:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            case 5:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Completed</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfilment Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.RequestID} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.ProductName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{item.RequestedQuantity}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(item.ReqStatus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {new Date(item.request_date).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            timeZone: 'Asia/Karachi'
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {item.fullfillmentdate ? new Date(item.fullfillmentdate).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            timeZone: 'Asia/Karachi'
                                        }) : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.ReqStatus === 1 && (
                                        <button
                                            onClick={() => {
                                                setSelectedRequestId(item.RequestID);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-600 hover:text-red-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {item.ReqStatus === 2 && (
                                        <button
                                            onClick={() => {
                                                setSelectedRequestId(item.RequestID);
                                                setShowCompleteModal(true);
                                            }}
                                            className="text-green-600 hover:text-green-900 font-medium"
                                        >
                                            Complete Request
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            {/* Complete Confirmation Modal */}
            {showCompleteModal && (
                <>
                    <div 
                        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity z-40"
                        onClick={() => setShowCompleteModal(false)}
                    />
                    
                    <div className="fixed inset-0 z-50">
                        <div className="flex h-full items-center justify-center p-4">
                            <div 
                                className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full sm:max-w-lg"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="bg-white px-6 pt-5 pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <h3 className="text-lg font-semibold leading-6 text-gray-900">
                                                Complete Stock Request
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to mark this stock request as completed?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            selectedRequestId && handleComplete(selectedRequestId);
                                            setShowCompleteModal(false);
                                            window.location.reload();
                                        }}
                                        className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto"
                                    >
                                        Complete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCompleteModal(false)}
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
};

export default ManagerStockTable; 