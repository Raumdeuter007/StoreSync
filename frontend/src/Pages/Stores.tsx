import { useEffect, useState } from 'react';
import { StoresTable } from '../Components/StoresTable';
import { AddStoreModal } from '../Components/StoreModals';

interface BusinessStore {
    BusinessID: number;
    BusinessName: string;
    StoreID: number;
    StoreName: string;
    StoreAddress: string;
    ManagerID: number | null;
    ManagerName: string | null;
    ManagerEmail: string | null;
}

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
    ManagerEmail: string;
    username: string;
}

export function Stores() {
    const [businessName, setBusinessName] = useState('');
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch('http://localhost:5000/owner/stores', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stores');
                }

                const data: BusinessStore[] = await response.json();
    
                if (data.length > 0) {
                    setBusinessName(data[0].BusinessName);
                }

                // Filter out records that don't have a StoreID (these are unassigned managers)
                const storeRecords = data.filter(record => record.StoreID !== null);

                // Transform the filtered store records
                const transformedStores = storeRecords.map(store => ({
                    StoreID: store.StoreID,
                    StoreName: store.StoreName,
                    StoreAddress: store.StoreAddress,
                    ManagerID: store.ManagerID,
                    ManagerName: store.ManagerID ? store.ManagerName : null,
                    ManagerEmail: store.ManagerID ? store.ManagerEmail : null
                }));

                setStores(transformedStores);
            } catch (err) {
                setError('Failed to load stores');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                // First get all managers
                const managersResponse = await fetch('http://localhost:5000/owner/managers', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (!managersResponse.ok) throw new Error('Failed to fetch managers');
                const managers: any[] = await managersResponse.json(); // Use any[] temporarily for raw API data

                // Transform the managers data to match our interface
                const transformedManagers: Manager[] = managers.map(manager => ({
                    managerID: manager.managerID,
                    ManagerName: manager.name,      // Transform from API's 'name' to our 'ManagerName'
                    ManagerEmail: manager.email,    // Transform from API's 'email' to our 'ManagerEmail'
                    username: manager.username
                }));

                // Get stores data
                const storesResponse = await fetch('http://localhost:5000/owner/stores', {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });

                if (!storesResponse.ok) throw new Error('Failed to fetch stores');
                const storesData: BusinessStore[] = await storesResponse.json();

                // Filter stores to only include actual store records (not manager records)
                const actualStores = storesData.filter(record => record.StoreID !== null);

                // Get IDs of managers who are already assigned to stores
                const assignedManagerIds = new Set(
                    actualStores
                        .filter(store => store.ManagerID !== null)
                        .map(store => store.ManagerID)
                );

                // Filter out managers who are already assigned
                const unassignedManagers = transformedManagers.filter(
                    manager => !assignedManagerIds.has(manager.managerID)
                );
                
                setAvailableManagers(unassignedManagers);
            } catch (err) {
                console.error('Failed to load available managers:', err);
            }
        };

        fetchManagers();
    }, []);

    const handleAddStore = async (name: string, address: string) => {
        try {
            const response = await fetch('http://localhost:5000/owner/add_store', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    name,
                    address
                })
            });

            if (!response.ok) throw new Error('Failed to add store');
            
            // Refresh stores list
            window.location.reload();
        } catch (err) {
            throw err;
        }
    };

    const handleEditStore = async (storeId: number, field: string, value: string) => {
        try {
            const response = await fetch(`http://localhost:5000/owner/UpdateStores/${storeId}/${field}/${value}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.ok) throw new Error('Failed to update store');
            
            // Refresh stores list
            window.location.reload();
        } catch (err) {
            throw err;
        }
    };

    const handleDeleteStore = async (storeId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/owner/store/${storeId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.ok) throw new Error('Failed to delete store');
            
            // Refresh stores list
            window.location.reload();
        } catch (err) {
            throw err;
        }
    };

    const handleAssignManager = async (storeId: number, managerId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/owner/sto_manager/${storeId}/${managerId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.ok) throw new Error('Failed to assign manager');
            
            window.location.reload();
        } catch (err) {
            throw err;
        }
    };

    const handleUnassignManager = async (managerId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/owner/sto_manager/${managerId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            if (!response.ok) throw new Error('Failed to unassign manager');
            
            window.location.reload();
        } catch (err) {
            throw err;
        }
    };

    if (loading) {
        return (
            <div className="mt-16 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-16 flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="mt-16 px-6 py-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{businessName}</h1>
                <p className="mt-2 text-gray-600">Manage your stores and their managers</p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Stores</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Store
                </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <StoresTable 
                    data={stores} 
                    availableManagers={availableManagers}
                    onEdit={handleEditStore}
                    onDelete={handleDeleteStore}
                    onAssignManager={handleAssignManager}
                    onUnassignManager={handleUnassignManager}
                />
            </div>

            <AddStoreModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddStore}
            />
        </div>
    );
} 