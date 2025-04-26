import { useState, useEffect } from "react";

// Interface for manager details from the API
interface ManagerDetails {
  managerID: number;
  name: string;
  email: string;
  username: string;
  businessID: number;
  BusinessName: string;
  StoreID: number | null;
  StoreName: string | null;
}


function Manager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [managerData, setManagerData] = useState<ManagerDetails | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    // Function to fetch manager details
    const fetchManagerDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/manager/manager_details', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Failed to fetch manager details: ${response.statusText}`);
            }

            if (result.status === "success" && result.data) {
                setManagerData(result.data);
            } else {
                throw new Error("Invalid data format received from server");
            }
        } catch (err) {
            console.error('Error fetching manager details:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        setUpdateSuccess(null);
        setIsUpdating(true);

        try {
            const response = await fetch('http://localhost:5000/manager/ChangeEmail', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    email: newEmail
                })
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update email');
            }

            if (result.status === "success") {
                setUpdateSuccess('Email updated successfully');
                fetchManagerDetails();
                setIsEditingEmail(false);
                setShowNotification(true);
                setTimeout(() => {
                    setShowNotification(false);
                    setUpdateSuccess(null);
                }, 1000);
            } else {
                throw new Error(result.message || 'Failed to update email');
            }
        } catch (err) {
            console.error('Error updating email:', err);
            setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
                setUpdateError(null);
            }, 1000);
        } finally {
            setIsUpdating(false);
        }
    };

    const startEditingEmail = () => {
        if (managerData) {
            setNewEmail(managerData.email);
            setIsEditingEmail(true);
        }
    };

    const cancelEditing = () => {
        setIsEditingEmail(false);
        setUpdateError(null);
        setUpdateSuccess(null);
    };

    // Fetch manager details on component mount
    useEffect(() => {
        fetchManagerDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manager Details</h1>
            {managerData && (
                <div className="relative">
                    {/* Animated Notification */}
                    {showNotification && (updateSuccess || updateError) && (
                        <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                            animate-fade-in-out rounded-lg p-4 shadow-lg ${
                                updateSuccess 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {updateSuccess ? (
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${
                                        updateSuccess 
                                            ? 'text-green-800' 
                                            : 'text-red-800'
                                    }`}>
                                        {updateSuccess || updateError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Field
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Name
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {managerData.name}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Email
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 group relative">
                                            {isEditingEmail ? (
                                                <form onSubmit={handleEmailUpdate} className="flex items-center space-x-2">
                                                    <input
                                                        type="email"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                        placeholder="Enter new email"
                                                        required
                                                    />
                                                    <div className="flex space-x-1">
                                                        <button
                                                            type="submit"
                                                            disabled={isUpdating}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            {isUpdating ? (
                                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                'Save'
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEditing}
                                                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span>{managerData.email}</span>
                                                    <button
                                                        onClick={startEditingEmail}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Edit email"
                                                    >
                                                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Username
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {managerData.username}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Business
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {managerData.BusinessName}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Store
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {managerData.StoreName || 'Not assigned'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
         
          {}
            <div className="mt-8 grid grid-cols-3 gap-8">
                {}
                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/>
                    <path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    <path d="M8 12h8"/>
                    <path d="M8 16h8"/>
                </svg>

                {}
                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 8v13H3V8"/>
                    <path d="M1 3h22v5H1z"/>
                    <path d="M10 12h4"/>
                    <path d="M12 12v7"/>
                </svg>

                {}
                <svg className="w-64 h-64 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
            </div>
        </div>
    );
}

export default Manager; 