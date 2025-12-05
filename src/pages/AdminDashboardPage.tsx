
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

const AdminDashboardPage = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const res = await api.get('/admin/stats');
            return res.data;
        }
    });

    const { data: users } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        }
    });

    const { data: reports } = useQuery({
        queryKey: ['adminReports'],
        queryFn: async () => {
            const res = await api.get('/admin/reports');
            return res.data;
        }
    });

    if (isLoading) return <div>Loading stats...</div>;

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-heading font-bold text-neutral-charcoal mb-8">Admin Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-gray-500 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold">{stats?.totalUsers}</p>
                        <p className="text-sm text-green-500 mt-2">{stats?.activeUsers} Active</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-gray-500 mb-2">Donated Hours</h3>
                        <p className="text-3xl font-bold text-primary">{stats?.totalDonatedHours}h</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-gray-500 mb-2">Sessions</h3>
                        <p className="text-3xl font-bold">{stats?.totalSessions}</p>
                        <p className="text-sm text-gray-400 mt-2">{stats?.completedSessions} Completed</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-gray-500 mb-2">Pending Reports</h3>
                        <p className="text-3xl font-bold text-red-500">{stats?.pendingReports}</p>
                    </div>
                </div>

                {/* Pending Mentors Verification */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden col-span-1 lg:col-span-2">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold">Pending Mentor Verifications</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left text-sm">Name</th>
                                    <th className="p-4 text-left text-sm">Email</th>
                                    <th className="p-4 text-left text-sm">Joined</th>
                                    <th className="p-4 text-right text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.filter((u: any) => u.role === 'mentor' && !u.isVerified).map((user: any) => (
                                    <tr key={user._id} className="border-t">
                                        <td className="p-4 text-sm font-medium">{user.name}</td>
                                        <td className="p-4 text-sm text-gray-500">{user.email}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Verify ${user.name}?`)) {
                                                        await api.put(`/admin/mentors/${user._id}/verify`);
                                                        window.location.reload(); // Simple reload for now
                                                    }
                                                }}
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                                            >
                                                Verify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users?.filter((u: any) => u.role === 'mentor' && !u.isVerified).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-gray-500">No pending mentor verifications.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold">Safety Reports</h3>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                            {reports?.filter((r: any) => r.status === 'pending').length} Pending
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left text-sm">Reporter</th>
                                    <th className="p-4 text-left text-sm">Reason</th>
                                    <th className="p-4 text-left text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports?.slice(0, 5).map((report: any) => (
                                    <tr key={report._id} className="border-t">
                                        <td className="p-4 text-sm">
                                            <div className="font-medium">{report.reporterId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">Reported: {report.reportedId?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="p-4 text-sm">{report.reason}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                report.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {reports?.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-gray-500">No reports found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Recent Users</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left text-sm">Name</th>
                                    <th className="p-4 text-left text-sm">Role</th>
                                    <th className="p-4 text-left text-sm">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.slice(0, 5).map((user: any) => (
                                    <tr key={user._id} className="border-t">
                                        <td className="p-4 text-sm font-medium">
                                            {user.name}
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${user.role === 'mentor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AdminDashboardPage;
