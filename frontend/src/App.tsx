import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Owner from "./Pages/owner";
import Manager from "./Pages/Manager";
import NotFound from "./Pages/NotFound";
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/navbar";
import Logout from "./Pages/Logout";
import { useEffect, useState } from "react";
import { getItem, setItem } from "./utils/localStorage";
import { Stock_Owner } from "./Pages/Stock_Owner";

function App() {
	const [role, setRole] = useState(() => {
		const item = getItem("role");
		return item || null;
	});
	useEffect(() => {
		setItem("role", role);
	}, [role])
	return (
		<>
			<Navbar role={role} />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login setRole={setRole} />} />
					<Route path='/logout' element={<Logout setRole={setRole} />} />
					<Route element={<ProtectedRoute allow='owner' />}>
						<Route path="/owner" element={<Owner />} />
						<Route path="/owner" element={<Stock_Owner />} />
					</Route>
					<Route element={<ProtectedRoute allow='manager' />}>
						<Route path="/manager" element={<Manager />} />
					</Route>
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;