import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Loader2, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchPage = () => {
    const { data: matches, isLoading, error } = useQuery({
        queryKey: ['matches'],
        queryFn: async () => {
            const res = await api.get('/matches');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-neutral-softGray">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Finding your perfect AI match...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-softGray">
                <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-sm">
                    <p className="text-red-500 font-bold mb-2">Could not find matches.</p>
                    <p className="text-gray-600">Please ensure your profile is fully updated so our AI can understand your needs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-heading font-bold text-neutral-charcoal mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        AI Smart Matching
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        We've analyzed your profile against our community using advanced AI vector matching to find the people who best align with your goals, skills, and interests.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match: any, index: number) => (
                        <motion.div
                            key={match._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                            {/* Match Score Badge */}
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl z-10">
                                {match.matchPercentage}% Match
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                {match.userId.avatarUrl ? (
                                    <img src={match.userId.avatarUrl} alt={match.userId.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{match.userId.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{match.userId.role || 'User'}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {match.bio && (
                                    <p className="text-sm text-gray-600 line-clamp-3 italic">"{match.bio}"</p>
                                )}

                                {match.skills && match.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {match.skills.slice(0, 3).map((skill: string) => (
                                            <span key={skill} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                        {match.skills.length > 3 && (
                                            <span className="text-xs text-gray-400 px-1">+{match.skills.length - 3} more</span>
                                        )}
                                    </div>
                                )}

                                {match.interests && match.interests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {match.interests.slice(0, 3).map((interest: string) => (
                                            <span key={interest} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-neutral-charcoal text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2">
                                View Profile
                            </button>
                        </motion.div>
                    ))}
                </div>

                {matches.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No matches found yet. Try updating your profile with more details!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchPage;
