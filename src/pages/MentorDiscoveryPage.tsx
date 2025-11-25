import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';

const MentorDiscoveryPage = () => {
    const [filters, setFilters] = useState({ skill: '', language: '', name: '' });

    const { data: mentors, isLoading } = useQuery({
        queryKey: ['mentors', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.skill) params.append('skill', filters.skill);
            if (filters.language) params.append('language', filters.language);
            if (filters.name) params.append('name', filters.name);
            const res = await api.get(`/mentors?${params.toString()}`);
            return res.data;
        }
    });

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-heading font-bold text-neutral-charcoal mb-8">Find a Mentor</h2>

                <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 flex gap-4 flex-wrap">
                    <input
                        placeholder="Search by name..."
                        className="p-3 border rounded-lg flex-grow"
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    />
                    <input
                        placeholder="Filter by skill..."
                        className="p-3 border rounded-lg flex-grow"
                        onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    />
                    <input
                        placeholder="Filter by language..."
                        className="p-3 border rounded-lg flex-grow"
                        onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    />
                </div>

                {isLoading ? (
                    <div>Loading mentors...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors?.map((mentor: any) => (
                            <div key={mentor._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {mentor.userId?.name?.[0] || '?'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{mentor.userId?.name || 'Unknown Mentor'}</h3>
                                        <p className="text-gray-500">{mentor.yearsExperience} years exp.</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-3">{mentor.bio}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {mentor.skills.map((skill: string) => (
                                        <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{skill}</span>
                                    ))}
                                </div>
                                <Link to={`/book/${mentor._id}`} className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
                                    Book Session
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MentorDiscoveryPage;
