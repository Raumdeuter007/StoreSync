import { Dispatch, FormEvent, SetStateAction } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = 'owner' | 'manager';

interface Props {
    role: UserRole | undefined;
    setRole: Dispatch<SetStateAction<UserRole | undefined>>;
}

function Login({ role, setRole }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); // Hook to programmatically navigate between routes

    // Function to handle login form submission
    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
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
                setRole(role); // Set user role in parent component
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
        <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                {/* Dropdown to select user role */}
                <div className="mb-3">
                    <label className="form-label">Select Role:</label>
                    <select className="form-select" name="role" value={role} onChange={(e) => setRole(e.target.value === "owner" ? "owner" : "manager")}>
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                {/* Input fields for username and password */}
                <div className="mb-3">
                    <label className="form-label">Username:</label>
                    <input type="text" className="form-control" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password:</label>
                    <input type="password" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            {/* Display login messages */}
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </>
    );
}

export default Login;
