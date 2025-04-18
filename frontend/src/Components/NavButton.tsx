import { NavLink } from "react-router-dom";

interface Props {
    link: string;
    value: string;
};

function NavButton({ link, value }: Props) {
    return (
        <li>
            <NavLink 
                to={link}
                className={({ isActive }) => 
                    `block py-2 px-4 text-sm transition-colors duration-200 ${
                        isActive 
                            ? 'text-blue-400 font-semibold' 
                            : 'text-gray-300 hover:text-white'
                    }`
                }
            >
                {value}
            </NavLink>
        </li>
    );
}

export default NavButton;