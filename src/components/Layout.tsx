import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-neutral-softGray">
            <nav className="bg-white shadow-sm p-3 sm:p-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="text-xl sm:text-2xl font-heading font-bold text-primary">SkillBridge</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-neutral-softGray/50"
                        aria-label="Toggle menu"
                        onClick={() => setMenuOpen((s) => !s)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>

                    <div className="hidden md:flex items-center gap-4">
                        <span className="font-medium text-neutral-charcoal">Hello, {user?.name}</span>
                        <button onClick={logout} className="text-red-500 font-medium hover:text-red-700">Logout</button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div className="absolute right-4 top-16 bg-white shadow-md rounded-lg p-3 md:hidden z-50">
                        <div className="flex flex-col gap-2">
                            <span className="font-medium text-neutral-charcoal">Hello, {user?.name}</span>
                            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-neutral-charcoal hover:text-primary">Dashboard</Link>
                            <button onClick={() => { setMenuOpen(false); logout(); }} className="text-left text-red-500 hover:text-red-700">Logout</button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
