import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Calendar, Clock, Trophy, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 5;

    // Fetch Upcoming Sessions (Scheduled)
    const { data: upcomingData, isLoading: isLoadingUpcoming } = useQuery({
        queryKey: ['sessions', 'upcoming'],
        queryFn: async () => {
            const res = await api.get('/sessions?status=scheduled&limit=100'); // Get all upcoming
            return res.data; // Expecting { sessions: [], pagination: {} }
        }
    });

    // Fetch Past Sessions (Completed) with Pagination
    const { data: pastData, isLoading: isLoadingPast } = useQuery({
        queryKey: ['sessions', 'past', page],
        queryFn: async () => {
            const res = await api.get(`/sessions?status=completed&page=${page}&limit=${limit}`);
            return res.data;
        },
        placeholderData: (previousData) => previousData // Keep previous data while fetching new
    });

    const upcomingSessions = upcomingData?.sessions || [];
    const pastSessions = pastData?.sessions || [];
    const pagination = pastData?.pagination || { total: 0, page: 1, pages: 1 };

    return (
        <div className="min-h-screen bg-neutral-softGray">
            {/* Nav moved to Layout */}

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
                                    {/* Calculate based on total completed sessions from backend */}
                                    {((pagination.total || 0) * 0.3).toFixed(2)}
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
                        {isLoadingUpcoming ? (
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

                    <div className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Past Sessions</h3>
                            <span className="text-sm text-gray-500">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                        </div>

                        {isLoadingPast ? (
                            <div>Loading history...</div>
                        ) : pastSessions.length > 0 ? (
                            <div className="space-y-4">
                                {pastSessions.map((session: any) => (
                                    <div key={session._id} className="border p-4 rounded-xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-lg">{session.agenda}</p>
                                                <p className="text-gray-500 text-sm">
                                                    {new Date(session.startAt).toLocaleDateString()} • {
                                                        user?._id === session.mentorId?._id
                                                            ? (session.menteeId?.name || 'Mentee')
                                                            : (session.mentorId?.name || 'Mentor')
                                                    }
                                                </p>
                                            </div>
                                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                Completed
                                            </div>
                                        </div>

                                        {session.aiSummary ? (
                                            <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                <div className="flex items-center gap-2 mb-1 text-purple-700 font-bold text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                                    AI Summary
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {session.aiSummary}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-3">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/sessions/${session._id}/analyze`);
                                                            alert('Summary generated! Refreshing...');
                                                            window.location.reload();
                                                        } catch (err: any) {
                                                            alert('Failed to generate summary: ' + (err.response?.data?.message || err.message));
                                                        }
                                                    }}
                                                    className="text-sm text-purple-600 font-semibold hover:underline flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                                                    Generate AI Summary
                                                </button>
                                            </div>
                                        )}

                                        {session.notes && (
                                            <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                <div className="flex items-center gap-2 mb-1 text-yellow-700 font-bold text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    Session Notes
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {session.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="font-medium text-gray-700">
                                        Page {page}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => (pagination.pages > p ? p + 1 : p))}
                                        disabled={page >= pagination.pages}
                                        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No completed sessions yet.</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link to="/mentors" className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90">
                                Find a Mentor
                            </Link>
                            <Link to="/learning-path" className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90">
                                Learning Path
                            </Link>
                            <Link to="/challenges" className="block w-full bg-purple-600 text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90">
                                Coding Challenges
                            </Link>
                            <Link to="/matches" className="block w-full bg-teal-600 text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90 flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5" />
                                AI Smart Match
                            </Link>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="block w-full bg-gray-800 text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90">
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                onClick={() => navigate('/profile/edit')}
                                className="block w-full border border-gray-300 text-gray-700 text-center py-3 rounded-xl font-bold hover:bg-gray-50"
                            >
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
