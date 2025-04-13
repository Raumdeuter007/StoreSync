// Importing necessary libraries and components
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap for styling

// Inline components representing different pages of the application

// Home component: Displays a welcome message
const Home = () => (
  <div className="container mt-4">
    <h2>Welcome to StoreSync</h2>
    <p>Your one-stop solution for business and store management.</p>
  </div>
);

// Login component: Handles user login functionality
const Login = ({ setUserRole }) => {
  const [role, setRole] = useState('owner'); // State to track selected role (owner/manager)
  const [username, setUsername] = useState(''); // State to track username input
  const [password, setPassword] = useState(''); // State to track password input
  const [message, setMessage] = useState(''); // State to display login messages
  const navigate = useNavigate(); // Hook to programmatically navigate between routes

  // Function to handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const endpoint = role === 'owner' ? '/owner/login' : '/manager/login'; // Determine endpoint based on role
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ username, password })
      });
      if (response.ok) {
        setMessage('Logged in successfully!');
        setUserRole(role); // Set user role in parent component
        navigate(role === 'owner' ? '/owner' : '/manager'); // Navigate to respective dashboard
      } else {
        setMessage('Login failed!');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Error connecting to server');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        {/* Dropdown to select user role */}
        <div className="mb-3">
          <label className="form-label">Select Role:</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        {/* Input fields for username and password */}
        <div className="mb-3">
          <label className="form-label">Username:</label>
          <input type="text" className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      {/* Display login messages */}
      {message && <div className="mt-3 alert alert-info">{message}</div>}
    </div>
  );
};

// OwnerDashboard component: Displays owner-specific features and data
const OwnerDashboard = () => {
  const [updateInfo, setUpdateInfo] = useState(''); // State to track business info updates
  const [message, setMessage] = useState(''); // State to display messages
  const [data, setData] = useState(null); // State to store fetched data

  // Function to fetch business details
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/owner', {
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

  // Function to update business information
  const updateBusinessInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/owner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ info: updateInfo })
      });
      if (response.ok) {
        setMessage('Business info updated successfully!');
      } else {
        setMessage('Failed to update business info');
      }
    } catch (err) {
      console.error('Update business info error:', err);
      setMessage('Error updating business info');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Owner Dashboard</h2>
      {/* Button to fetch business data */}
      <button className="btn btn-secondary me-2" onClick={fetchData}>Fetch Business Data</button>
      <div className="mt-3">
        <h5>Update Business Info</h5>
        <div className="input-group mb-3">
          <input 
            type="text" 
            className="form-control" 
            placeholder="New business info" 
            value={updateInfo} 
            onChange={(e)=>setUpdateInfo(e.target.value)} 
          />
          <button className="btn btn-outline-primary" onClick={updateBusinessInfo}>Update</button>
        </div>
      </div>
      {/* Display messages and fetched data */}
      {message && <div className="alert alert-info">{message}</div>}
      {data && (
        <div className="mt-3">
          <h5>Business Data:</h5>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// ManagerDashboard component: Displays manager-specific features and data
const ManagerDashboard = () => {
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
};

// Main App component: Defines the structure and routing of the application
function App() {
  const [userRole, setUserRole] = useState(null); // State to track the role of the logged-in user

  return (
    <>
      {/* Navigation bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">StoreSync</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              {/* Conditional links based on user role */}
              {!userRole && (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              )}
              {userRole === 'owner' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/owner">Owner Dashboard</Link>
                </li>
              )}
              {userRole === 'manager' && (
                <li className="nav-item">
                  <Link className="nav-link" to="/manager">Manager Dashboard</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Define routes for different pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        {/* Add more routes for additional features/endpoints as needed */}
      </Routes>
    </>
  );
}

export default App;
