import React from 'react';

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
    const handleApprove = async () => {
        try {
            const response = await fetch(`http://localhost:5000/owner/approve_req/${item.RequestID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            });

            if (response.ok) {
                // Refresh the page to show updated status
                window.location.reload();
            } else {
                throw new Error('Failed to approve request');
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request');
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
                    <button
                        onClick={handleApprove}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1 px-3 rounded"
                    >
                        Approve
                    </button>
                )}
            </td>
        </tr>
    );
};

export default TableRow;