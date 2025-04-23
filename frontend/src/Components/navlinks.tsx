import NavButton from "./NavButton";

interface Props {
    role: "manager" | "owner" | null;
}

const Navlinks = ({ role }: Props) => {
    const ownerlinks = [["Stores", "/stores"], ["Products", "/products"], ["Stock Requests", "/stock_req"], ["Inventory", "/inventory"]];
    const managerlinks = [["Stock Requests", "/stock_req"], ["Products", "/products"], ["Inventory", "/inventory"]];
    const defo = [["Register", "/register"], ["Sign In", "/login"]];
    
    return (
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 bg-gray-900">
                {role === "owner" && ownerlinks.map((link, i) => (
                    <NavButton link={"owner" + link[1]} value={link[0]} key={i} />
                ))}
                {role === "manager" && managerlinks.map((link, i) => (
                    <NavButton link={"manager" + link[1]} value={link[0]} key={i} />
                ))}
                {role == null && defo.map((link, i) => (
                    <NavButton link={link[1]} value={link[0]} key={i} />
                ))}
            </ul>
        </div>
    );
};

export default Navlinks;