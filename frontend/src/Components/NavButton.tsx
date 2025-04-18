import { NavLink } from "react-router-dom";

interface Props {
    link: string;
    value: string;
};

function NavButton({ link, value }: Props) {
    return (
        <>
            <li className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                <NavLink to={link}>{value}</NavLink>
            </li>
        </>
    )
}

export default NavButton;