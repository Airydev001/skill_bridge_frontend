import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Calendar, Clock, Video, Star, Trophy, Award } from 'lucide-react';

const DashboardPage = () => {
    const { user, logout } = useAuth();

    const { data: sessions, isLoading } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const res = await api.get('/sessions');
            return res.data;
        }
    });

    const upcomingSessions = sessions?.filter((s: any) => {
        const isScheduled = s.status === 'scheduled';
        const isNotExpired = new Date(s.endAt) > new Date();
        return isScheduled && isNotExpired;
    }) || [];

    return (
        <div className="min-h-screen bg-neutral-softGray">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-2xl font-heading font-bold text-primary">SkillBridge</h1>
                <div className="flex items-center gap-4">
                    <span className="font-medium text-neutral-charcoal">Hello, {user?.name}</span>
                    <button onClick={logout} className="text-red-500 font-medium hover:text-red-700">Logout</button>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-heading font-bold text-neutral-charcoal mb-8">Dashboard</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-lightGray">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Upcoming Sessions</p>
                                <p className="text-2xl font-bold text-neutral-charcoal">{upcomingSessions.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-lightGray">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Hours</p>
                                <p className="text-2xl font-bold text-neutral-charcoal">
                                    {/* Mock calculation */}
                                    {(sessions?.filter((s: any) => s.status === 'completed').length || 0) * 0.3}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-lightGray">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Streak</p>
                                <p className="text-2xl font-bold text-neutral-charcoal">{user?.streak?.count || 0} Days</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-lightGray">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Badges Earned</p>
                                <p className="text-2xl font-bold text-neutral-charcoal">{user?.badges?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                {user?.badges && user.badges.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-neutral-charcoal mb-4">Your Achievements</h3>
                        <div className="flex gap-4 flex-wrap">
                            {user.badges.map((badge: string) => (
                                <div key={badge} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <span className="font-semibold text-yellow-800">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2">
                        <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
                        {isLoading ? (
                            <div>Loading sessions...</div>
                        ) : upcomingSessions.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingSessions.map((session: any) => (
                                    <div key={session._id} className="border p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{session.agenda}</p>
                                            <p className="text-gray-500">
                                                {new Date(session.startAt).toLocaleString()} with {
                                                    user?._id === session.mentorId?._id
                                                        ? (session.menteeId?.name || 'Unknown Mentee')
                                                        : (session.mentorId?.name || 'Unknown Mentor')
                                                }
                                            </p>
                                        </div>
                                        <Link
                                            to={`/session/${session._id}`}
                                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-opacity-90"
                                        >
                                            Join Session
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-500">No upcoming sessions.</p>
                                <Link to="/mentors" className="mt-4 inline-block text-primary font-medium hover:underline">Find a mentor</Link>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link to="/mentors" className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90">
                                Find a Mentor
                            </Link>
                            <button className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-xl font-bold hover:bg-gray-50">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
