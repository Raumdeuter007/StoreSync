import { useState } from "react";

function Manager() {
    const [message, setMessage] = useState(''); // State to display messages
    const [data, setData] = useState(null); // State to store fetched data

    // Function to fetch manager details
    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:5000/manager', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                setMessage('Failed to retrieve data');
            }
        } catch (err) {
            console.error('Fetch data error:', err);
            setMessage('Error retrieving data');
        }
    };

    // Function to approve stock requests
    const approveRequest = async () => {
        try {
            const response = await fetch('http://localhost:5000/manager/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (response.ok) {
                setMessage('Request approved successfully!');
            } else {
                setMessage('Failed to approve request');
            }
        } catch (err) {
            console.error('Approve request error:', err);
            setMessage('Error approving request');
        }
    };

    return (
     <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="container mt-4">
            <h2>Manager Dashboard</h2>
            {/* Buttons to fetch data and approve requests */}
            <button className="btn btn-secondary me-2" onClick={fetchData}>Fetch Manager Data</button>
            <button className="btn btn-success" onClick={approveRequest}>Approve Request</button>
            {/* Display messages and fetched data */}
            {message && <div className="alert alert-info mt-3">{message}</div>}
            {data && (
                <div className="mt-3">
                    <h5>Manager Data:</h5>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
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
