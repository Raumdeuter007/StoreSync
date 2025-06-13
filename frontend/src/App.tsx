import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
const Home = lazy(() => import('./Pages/Home'));
const Login = lazy(() => import('./Pages/Login'));
const Owner = lazy(() => import('./Pages/owner'));
const Manager = lazy(() => import('./Pages/Manager'));
const NotFound = lazy(() => import('./Pages/NotFound'));
const Logout = lazy(() => import("./Pages/Logout"));
const Register = lazy(() => import("./Pages/Register"))
const Inventory = lazy(() => import('./Pages/Inventory'));
import ProtectedRoute from "./Components/ProtectedRoute";
import Navbar from "./Components/navbar";
import { getItem, setItem } from "./utils/localStorage";
import { Stock_Owner } from "./Pages/Stock_Owner";
import { Stock_Manager } from "./Pages/Stock_Manager";
import { Stores } from './Pages/Stores';
import OwnerInventory from './Pages/OwnerInventory';
import { Products } from './Pages/Products';
import { ManagerProducts } from './Pages/ManagerProducts';

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

			<BrowserRouter>
				<Navbar role={role} />
				<Suspense fallback={<div className="container">Loading...</div>}>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login setRole={setRole} />} />
						<Route path='/logout' element={<Logout setRole={setRole} />} />
						<Route path='/Register' element={<Register  />} />
						<Route element={<ProtectedRoute allow='owner' />}>
							<Route path="/owner" element={<Owner />} />
							<Route path="/owner/stock_req" element={<Stock_Owner />} />
							<Route path="/owner/stores" element={<Stores />} />
							<Route path="/owner/products" element={<Products />} />
							<Route path="/owner/inventory" element={<OwnerInventory />} />
						</Route>
						<Route element={<ProtectedRoute allow='manager' />}>
							<Route path="/manager" element={<Manager />} />
							<Route path="/manager/stock_req" element={<Stock_Manager />} />
							<Route path="/manager/inventory" element={<Inventory />} />
							<Route path="/manager/products" element={<ManagerProducts />} />
						</Route>
						<Route path="/stores" element={<Stores />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Suspense>
			</BrowserRouter>
		</>
	);
}

export default App;
