import { Outlet, Navigate } from 'react-router-dom';
import { getItem } from '../utils/localStorage';
type UserRole = 'owner' | 'manager';

interface Props {
    allow: UserRole;
}
const ProtectedRoute = ({ allow }: Props) => {
    const role = getItem("role");
    console.log(role);
    return (role && (role == allow)) ? <Outlet /> : <Navigate to="/logout" />;
}

export default ProtectedRoute;