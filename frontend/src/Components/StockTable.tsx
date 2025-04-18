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
}

interface Props {
	data: Array<InventoryItem>
}

const StockTable = ({ data }: Props) => {
	return (
		<div className="flex flex-col">
			<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
					<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
						<table className="min-w-full divide-y divide-gray-200">
							<TableHeader />
							<tbody className="bg-white divide-y divide-gray-200">
								{data.map((item, index) => (
									<TableRow key={index} item={item} index={index} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StockTable;