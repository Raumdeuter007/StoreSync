import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Owner from "./Pages/owner";
import Manager from "./Pages/Manager";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/navbar";
import { useState } from "react";

type UserRole = 'owner' | 'manager';

function App() {
	const [role, setRole] = useState<UserRole>();
	return (
		<>
			<Navbar role={role} />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login setRole={setRole} role={role} />} />
					<Route element={<ProtectedRoute role={role} />}>
						<Route path="/owner" element={<Owner />} />
						<Route path="/manager" element={<Manager />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;