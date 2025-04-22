import React from 'react';

interface EditStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: {
        StoreID: number;
        StoreName: string;
        StoreAddress: string;
    };
    onSubmit: (field: string, value: string) => Promise<void>;
}

interface AddStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, address: string) => Promise<void>;
}

interface DeleteStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    onConfirm: () => Promise<void>;
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, store, onSubmit }) => {
    const [field, setField] = React.useState('StoreName');
    const [value, setValue] = React.useState('');
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
        setError('');
        try {
            await onSubmit(field, value);
            onClose();
        } catch (err) {
            setError('Failed to update store');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Edit Store</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Field to Edit
                                </label>
                                <select
                                    value={field}
                                    onChange={(e) => setField(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                >
                                    <option value="StoreName">Store Name</option>
                                    <option value="Address">Store Address</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Value
                                </label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    required
                                />
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
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export const AddStoreModal: React.FC<AddStoreModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = React.useState('');
    const [address, setAddress] = React.useState('');
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
        setError('');
        try {
            await onSubmit(name, address);
            setName('');
            setAddress('');
            onClose();
        } catch (err) {
            setError('Failed to create store');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Store Address
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 p-2"
                                    required
                                />
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
                                >
                                    Create Store
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export const DeleteStoreModal: React.FC<DeleteStoreModalProps> = ({ isOpen, onClose, storeName, onConfirm }) => {
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

    const handleDelete = async () => {
        setError('');
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            setError('Failed to delete store');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Delete Store</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete the store "{storeName}"? This action cannot be undone.
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
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
                            >
                                Delete Store
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}; 