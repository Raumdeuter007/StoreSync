import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Inline components representing pages

const Home = () => (
  <div className="container mt-4">
    <h2>Welcome to StoreSync</h2>
    <p>Your one-stop solution for business and store management.</p>
  </div>
);

const Login = ({ setUserRole }) => {
  const [role, setRole] = useState('owner');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const endpoint = role === 'owner' ? '/owner/login' : '/manager/login';
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ username, password })
      });
      if (response.ok) {
        setMessage('Logged in successfully!');
        setUserRole(role);
        navigate(role === 'owner' ? '/owner' : '/manager');
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
        <div className="mb-3">
          <label className="form-label">Select Role:</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
          </select>
        </div>
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
      {message && <div className="mt-3 alert alert-info">{message}</div>}
    </div>
  );
};

const OwnerDashboard = () => {
  const [updateInfo, setUpdateInfo] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  // Example: fetch business details
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

  // Example: update business info endpoint
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

  // ...add additional features (add store, product, update price, etc.) using similar patterns

  return (
    <div className="container mt-4">
      <h2>Owner Dashboard</h2>
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

const ManagerDashboard = () => {
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);

  // Example: fetch manager details
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

  // Example: approve stock request endpoint
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

  // ...add additional endpoints/features (notifications, stock requests, etc.) using similar patterns

  return (
    <div className="container mt-4">
      <h2>Manager Dashboard</h2>
      <button className="btn btn-secondary me-2" onClick={fetchData}>Fetch Manager Data</button>
      <button className="btn btn-success" onClick={approveRequest}>Approve Request</button>
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

function App() {
  const [userRole, setUserRole] = useState(null);

  return (
    <>
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
