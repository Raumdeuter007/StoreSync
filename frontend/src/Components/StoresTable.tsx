import React from 'react';
import { EditStoreModal, DeleteStoreModal } from './StoreModals';
import { AssignManagerModal, UnassignManagerModal } from './ManagerModals';

interface Store {
    StoreID: number;
    StoreName: string;
    StoreAddress: string;
    ManagerID: number | null;
    ManagerName: string | null;
    ManagerEmail: string | null;
}

interface Manager {
    managerID: number;
    ManagerName: string;
}

interface StoresTableProps {
    data: Store[];
    availableManagers: Manager[];
    onEdit: (storeId: number, field: string, value: string) => Promise<void>;
    onDelete: (storeId: number) => Promise<void>;
    onAssignManager: (storeId: number, managerId: number) => Promise<void>;
    onUnassignManager: (managerId: number) => Promise<void>;
}

export const StoresTable: React.FC<StoresTableProps> = ({
    data,
    availableManagers,
    onEdit,
    onDelete,
    onAssignManager,
    onUnassignManager
}) => {
    const [editModalStore, setEditModalStore] = React.useState<Store | null>(null);
    const [deleteModalStore, setDeleteModalStore] = React.useState<Store | null>(null);
    const [assignManagerStore, setAssignManagerStore] = React.useState<Store | null>(null);
    const [unassignManagerStore, setUnassignManagerStore] = React.useState<Store | null>(null);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Store Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Manager
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((store) => (
                            <tr key={store.StoreID} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{store.StoreName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{store.StoreAddress}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {store.ManagerName ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900">{store.ManagerName}</span>
                                                <button
                                                    onClick={() => setUnassignManagerStore(store)}
                                                    className="text-red-600 hover:text-red-900 text-xs"
                                                >
                                                    (Unassign)
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 italic">No manager assigned</span>
                                                <button
                                                    onClick={() => setAssignManagerStore(store)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm ml-2"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {store.ManagerEmail ? (
                                            <a href={`mailto:${store.ManagerEmail}`} className="text-blue-600 hover:text-blue-800">
                                                {store.ManagerEmail}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">No email available</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button 
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                        onClick={() => setEditModalStore(store)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="text-red-600 hover:text-red-900"
                                        onClick={() => setDeleteModalStore(store)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editModalStore && (
                <EditStoreModal
                    isOpen={!!editModalStore}
                    onClose={() => setEditModalStore(null)}
                    store={editModalStore}
                    onSubmit={(field, value) => onEdit(editModalStore.StoreID, field, value)}
                />
            )}

            {deleteModalStore && (
                <DeleteStoreModal
                    isOpen={!!deleteModalStore}
                    onClose={() => setDeleteModalStore(null)}
                    storeName={deleteModalStore.StoreName}
                    onConfirm={() => onDelete(deleteModalStore.StoreID)}
                />
            )}

            {assignManagerStore && (
                <AssignManagerModal
                    isOpen={!!assignManagerStore}
                    onClose={() => setAssignManagerStore(null)}
                    storeName={assignManagerStore.StoreName}
                    storeId={assignManagerStore.StoreID}
                    availableManagers={availableManagers}
                    onAssign={onAssignManager}
                />
            )}

            {unassignManagerStore && (
                <UnassignManagerModal
                    isOpen={!!unassignManagerStore}
                    onClose={() => setUnassignManagerStore(null)}
                    storeName={unassignManagerStore.StoreName}
                    managerName={unassignManagerStore.ManagerName || ''}
                    onConfirm={() => onUnassignManager(unassignManagerStore.ManagerID!)}
                />
            )}
        </>
    );
}; 