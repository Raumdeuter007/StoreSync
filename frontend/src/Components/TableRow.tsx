
interface InventoryItem {
    RequestID: number;
    RequestingStoreID: number;
    StoreName: string;
    ProductID: number;
    ProductName: string;
    RequestedQuantity: number;
    ReqStatus: number;
}

const TableRow: React.FC<{ item: InventoryItem; index: number }> = ({ item, index }) => {
    // Determine status color based on status value
    const getStatusColor = (status: number) => {
        switch (status) {
            case 1:
                return 'bg-yellow-100 text-yellow-800';
            case 2:
                return 'bg-red-100 text-red-800';
            case 3:
                return 'bg-green-100 text-green-800';
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
            case 3:
                return 'Approved';
            case 2:
                return 'Rejected';
            case 5:
                return 'Completed';
            default:
                return 'Unknown';
        }
    }
    console.log(item);
    return (
        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.RequestingStoreID}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.StoreName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ProductID}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ProductName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.RequestedQuantity}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.ReqStatus)}`}>
                    {getStatus(item.ReqStatus)}
                </span>
            </td>
        </tr>
    );
};

export default TableRow;