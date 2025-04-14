import { Outlet, Navigate } from 'react-router-dom';

type UserRole = 'owner' | 'manager';

interface Props {
    role: UserRole | undefined;
}
const ProtectedRoute = ({ role }: Props) => {
    return role ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;