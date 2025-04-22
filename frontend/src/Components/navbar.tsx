import { useNavigate } from "react-router-dom";
import Navlinks from "./navlinks";

interface Props {
    role: "manager" | "owner" | null;
}

function Navbar({ role }: Props) {
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg h-16">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse group">
                    <img 
                        src="https://png.pngtree.com/png-vector/20230408/ourmid/pngtree-sync-line-icon-vector-png-image_6695898.png" 
                        className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-1.5 transition-transform group-hover:scale-110" 
                        alt="StoreSync Logo" 
                    />
                    <span className="self-center text-xl font-semibold text-white tracking-wide">
                        Store<span className="text-blue-400">Sync</span>
                    </span>
                </a>
                
                <div className="flex items-center gap-4">
                    <Navlinks role={role} />
                    {role && (
                        <button
                            onClick={() => navigate('/logout')}
                            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;