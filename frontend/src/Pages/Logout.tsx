import { Navigate } from 'react-router-dom';
import { Dispatch, useEffect } from 'react';
import { getItem, setItem } from '../utils/localStorage';

interface Props {
    setRole: Dispatch<any>
}

const Logout = ({ setRole }: Props) => {

    useEffect(() => {
        server_logout();
        setItem("role", null);
        setRole(null);
    }, []);
    return (
        <Navigate to='/login' />
    )
}

export function server_logout() {
    if (getItem("role") != undefined && getItem("role") != null) {
        try {
            fetch('http://localhost:5000/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include',
            });
        } catch (err) {
            console.error('Login error:', err);
        }
    }
}

export default Logout;