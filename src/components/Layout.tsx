import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-neutral-softGray">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
                <Link to="/dashboard" className="text-2xl font-heading font-bold text-primary">SkillBridge</Link>
                <div className="flex items-center gap-4">
                    <span className="font-medium text-neutral-charcoal hidden md:inline">Hello, {user?.name}</span>
                    <button onClick={logout} className="text-red-500 font-medium hover:text-red-700">Logout</button>
                </div>
            </nav>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
