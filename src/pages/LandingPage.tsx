
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-neutral-softGray flex flex-col">
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-primary">SkillBridge</h1>
                <div className="flex gap-4">
                    <Link to="/login" className="text-neutral-charcoal font-medium hover:text-primary">Login</Link>
                    <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90">Sign Up</Link>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-5xl font-heading font-bold text-neutral-charcoal mb-6">
                    20 minutes. One mentor. <span className="text-primary">Big impact.</span>
                </h2>
                <p className="text-xl text-neutral-charcoal mb-10 max-w-2xl">
                    SkillBridge connects young women across Africa with volunteer tech mentors for short, powerful mentorship sessions.
                </p>
                <div className="flex gap-6">
                    <Link to="/register?role=mentee" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition shadow-lg">
                        Find a Mentor
                    </Link>
                    <Link to="/register?role=mentor" className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">
                        Become a Mentor
                    </Link>
                </div>
            </main>

            <footer className="bg-neutral-charcoal text-white p-8 text-center">
                <p>&copy; 2024 SkillBridge. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
