import { useState, FormEvent, useEffect, Dispatch } from "react";
import { useNavigate } from "react-router-dom";
import { setItem } from "../utils/localStorage";
import { server_logout } from "./Logout";
type UserRole = 'owner' | 'manager';

interface Props {
    setRole: Dispatch<any>
}

function Login({ setRole }: Props) {
    useEffect(() => {
        server_logout();
    }, []);
    const [username, setUsername] = useState('');
    const [this_role, setForm] = useState<UserRole>('owner');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const endpoint = this_role == 'owner' ? '/owner/login' : '/manager/login';
        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
                body: new URLSearchParams({ username, password })
            });
            if (response.ok) {
                setMessage('Logged in successfully!');
                setRole(this_role);
                setItem("role", this_role);
                navigate(this_role === 'owner' ? '/owner' : '/manager');
            } else {
                setMessage('Login failed!');
            }
        } catch (err) {
            console.error('Login error:', err);
            setMessage('Error connecting to server');
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 mt-16">
            <div className="bg-white p-5 rounded-xl shadow-xl w-80 transform hover:scale-[1.02] transition-transform z-10">
                <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-gray-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Role
                            </label>
                            <select 
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors bg-gray-50 text-sm"
                                value={this_role}
                                onChange={(e) => setForm(e.target.value === "owner" ? "owner" : "manager")}
                            >
                                <option value="owner">Business Owner</option>
                                <option value="manager">Store Manager</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-800 transform transition-all hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg text-sm"
                    >
                        Sign In
                    </button>
                </form>

                {message && (
                    <div className={`mt-3 p-2 rounded-lg text-xs ${
                        message.includes('successfully') 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        {this_role === 'owner' ? 'Business Owner Portal' : 'Store Manager Portal'}
                    </p>
                </div>
            </div>
                </div>
    );
}

export default Login;
