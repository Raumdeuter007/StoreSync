import React from 'react';

interface Manager {
    managerID: number;
    ManagerName: string;
}

interface AssignManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    storeId: number;
    availableManagers: Manager[];
    onAssign: (storeId: number, managerId: number) => Promise<void>;
}

interface UnassignManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    managerName: string;
    onConfirm: () => Promise<void>;
}

export const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
    isOpen,
    onClose,
    storeName,
    storeId,
    availableManagers,
    onAssign
}) => {
    const [selectedManager, setSelectedManager] = React.useState('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedManager) return;
        
        setError('');
        try {
            await onAssign(storeId, parseInt(selectedManager));
            onClose();
        } catch (err) {
            setError('Failed to assign manager');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Assign Manager to {storeName}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Manager
                                </label>
                                <select
                                    value={selectedManager}
                                    onChange={(e) => setSelectedManager(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    required
                                >
                                    <option value="">Choose a manager</option>
                                    {availableManagers.map(manager => (
                                        <option key={manager.managerID} value={manager.managerID}>
                                            {manager.ManagerName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                                    disabled={!selectedManager}
                                >
                                    Assign Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export const UnassignManagerModal: React.FC<UnassignManagerModalProps> = ({
    isOpen,
    onClose,
    storeName,
    managerName,
    onConfirm
}) => {
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleUnassign = async () => {
        setError('');
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            setError('Failed to unassign manager');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Unassign Manager</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to unassign {managerName} from {storeName}?
                        </p>
                        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnassign}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
                            >
                                Unassign Manager
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}; 