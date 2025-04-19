import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("owner");

  // Common
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Owner-only
  const [business, setBusiness] = useState("");
  const [address, setAddress] = useState("");

  // Manager-only
  const [businessID, setBusinessID] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<{ BusinessID: number; BusinessName: string }[]>([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('http://localhost:5000/business', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data);
        }
      } catch (err) {
        console.error('Failed to load businesses:', err);
      }
    };

    if (role === 'manager') {
      fetchBusinesses();
    }
  }, [role]);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    const endpoint = role === "owner" ? "/owner/register" : "/manager/register";
    const body =
      role === "owner"
        ? new URLSearchParams({
            name,
            email,
            username,
            password,
            business,
            address,
          })
        : new URLSearchParams({
            name,
            email,
            username,
            password,
            businessID,
          });

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (response.ok) {
        setMessage("Registered successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("Registration failed!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 mt-16 px-4 overflow-hidden">
      <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-[800px]">
        <div className="text-center mb-2">
          <div className="w-14 h-14 bg-gray-900 rounded-full mx-auto mb-2 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Account</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-2">
          <div className="grid grid-cols-2 gap-7">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Select Role</label>
                <select
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="owner">Business Owner</option>
                  <option value="manager">Store Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {role === "owner" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Business Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-0.5">Address</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {role === "manager" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-0.5">Business</label>
              <select
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                value={businessID}
                onChange={(e) => setBusinessID(e.target.value)}
                required
              >
                <option value="">Select a business</option>
                {businesses.map(business => (
                  <option key={business.BusinessID} value={business.BusinessID}>
                    {business.BusinessName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-[300px] mx-auto block bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-800 transform transition-all hover:scale-[1.02] active:scale-[0.98] font-medium shadow-lg text-sm mt-4"
          >
            Register
          </button>
        </form>

        {message && (
          <div className={`mt-2 p-2 rounded-lg text-xs ${
            message.includes('successfully')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
