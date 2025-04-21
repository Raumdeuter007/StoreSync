import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

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

interface StockTableProps {
	data: InventoryItem[];
	onDelete: (requestId: number) => void;
}

const StockTable = ({ data, onDelete }: StockTableProps) => {
	// Group data by StoreName
	const groupedData = data.reduce((acc, item) => {
		if (!acc[item.StoreName]) {
			acc[item.StoreName] = [];
		}
		acc[item.StoreName].push(item);
		return acc;
	}, {} as { [key: string]: InventoryItem[] });

	return (
		<div className="space-y-8">
			{Object.entries(groupedData).map(([storeName, storeData]) => (
				<div key={storeName} className="flex flex-col">
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						{storeName}
					</h2>
					<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
							<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
								<table className="min-w-full divide-y divide-gray-200">
									<TableHeader />
									<tbody className="bg-white divide-y divide-gray-200">
										{storeData.map((item, index) => (
											<TableRow 
												key={item.RequestID} 
												item={item} 
												index={index}
												onDelete={onDelete}
											/>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default StockTable;