import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Code, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white overflow-hidden selection:bg-primary selection:text-white font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SkillBridge</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    {user ? (
                        <Link to="/dashboard" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full font-medium transition-all">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition-colors">
                                Log In
                            </Link>
                            <Link to="/register" className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-all shadow-lg shadow-primary/25">
                                Sign Up
                            </Link>
                        </>
                    )}
                </motion.div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">


                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
                >
                    Millions of young women globally want to enter tech, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">but lack mentorship.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
                >
                    SkillBridge connects them to micro-mentorship instantly using AI.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={handleGetStarted}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    <Link
                        to="/mentors"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Explore Mentors
                    </Link>
                </motion.div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full">
                    <FeatureCard
                        icon={<BookOpen className="w-6 h-6 text-blue-400" />}
                        title="AI Learning Paths"
                        description="Generate custom curriculums tailored to your goals and skill level instantly."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={<Users className="w-6 h-6 text-green-400" />}
                        title="1-on-1 Mentorship"
                        description="Book sessions with industry experts for guidance, code reviews, and career advice."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={<Code className="w-6 h-6 text-purple-400" />}
                        title="Coding Challenges"
                        description="Practice with AI-generated challenges and get instant feedback on your code."
                        delay={0.6}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-12 text-center text-gray-500">
                <p>&copy; 2024 SkillBridge. Built for the future of tech.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-left group"
    >
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

export default LandingPage;
