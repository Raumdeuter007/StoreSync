import React, { useState, useEffect } from 'react';

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

const TableRow: React.FC<{ item: InventoryItem; index: number }> = ({ item, index }) => {
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/owner/approve_req/${item.RequestID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to approve request');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
        } finally {
            setIsLoading(false);
            setShowModal(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/owner/decline_req/${item.RequestID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to reject request');
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request');
        } finally {
            setIsLoading(false);
            setShowModal(false);
        }
    };

    // Determine status color based on status value
    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return 'bg-yellow-100 text-yellow-800';
            case 2:
                return 'bg-green-100 text-green-800';
            case 3:
                return 'bg-red-100 text-red-800';
            case 5:
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800'; // Default color for unknown status
        }
    };

    const getStatus = (status: number) => {
        switch (status) {
            case 1:
                return 'Pending';
            case 2:
                return 'Approved';
            case 3:
                return 'Rejected';
            case 5:
                return 'Completed';
            default:
                return 'Unknown';
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ProductName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.RequestedQuantity}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(item.request_date)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.ReqStatus)}`}>
                    {getStatus(item.ReqStatus)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {item.ReqStatus === 1 && (
                    <>
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded inline-flex items-center"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : "Actions"}
                        </button>

                        {/* Action Modal */}
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
                                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                                <div className="sm:flex sm:items-start">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                                        <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                                                            Confirm Action
                                                        </h3>
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-600">
                                                                Stock request details:
                                                            </p>
                                                            <div className="mt-2 bg-gray-50 rounded-lg p-4">
                                                                <dl className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">Product</dt>
                                                                        <dd className="text-sm font-medium text-gray-900">{item.ProductName}</dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">Quantity</dt>
                                                                        <dd className="text-sm font-medium text-gray-900">{item.RequestedQuantity} units</dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">Store</dt>
                                                                        <dd className="text-sm font-medium text-gray-900">{item.StoreName}</dd>
                                                                    </div>
                                                                    <div>
                                                                        <dt className="text-xs text-gray-500">Request Date</dt>
                                                                        <dd className="text-sm font-medium text-gray-900">{formatDate(item.request_date)}</dd>
                                                                    </div>
                                                                </dl>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={isLoading}
                                                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? (
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={isLoading}
                                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed mt-2 sm:mt-0"
                                                >
                                                    {isLoading ? (
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setShowModal(false)}
                                                    disabled={isLoading}
                                                    className="mt-2 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </td>
        </tr>
    );
};

export default TableRow;