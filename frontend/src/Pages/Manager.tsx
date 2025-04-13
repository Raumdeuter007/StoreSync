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
    );
}

export default Manager;