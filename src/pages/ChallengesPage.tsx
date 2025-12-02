import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Code, Plus, CheckCircle, Clock, Trophy, ArrowRight, Loader2 } from 'lucide-react';

const ChallengesPage = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    const queryClient = useQueryClient();

    // Fetch my challenges
    const { data: challenges, isLoading } = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const res = await api.get('/challenges/my');
            return res.data;
        }
    });

    // Generate challenge mutation
    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/challenges/generate', { topic, difficulty });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            setTopic('');
        }
    });

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            generateMutation.mutate();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-neutral-charcoal mb-2">Coding Challenges</h1>
                        <p className="text-gray-600">Sharpen your skills with AI-generated tasks.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-gray-800">Your Points: {challenges?.reduce((acc: number, c: any) => acc + (c.points || 0), 0) || 0}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Generator Panel */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            New Challenge
                        </h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. React Hooks, Python Lists"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={!topic.trim() || generateMutation.isPending}
                                className="w-full bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                            </button>
                        </form>
                    </div>

                    {/* Challenges List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Code className="w-5 h-5 text-gray-700" />
                            Your Challenges
                        </h2>

                        {isLoading ? (
                            <div className="text-center py-10">Loading...</div>
                        ) : challenges?.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl">No challenges yet. Generate one to get started!</div>
                        ) : (
                            challenges?.map((challenge: any) => (
                                <div key={challenge._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-gray-800">{challenge.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {challenge.difficulty}
                                            </span>
                                            {challenge.status === 'graded' && (
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Completed (+{challenge.points} pts)
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm mb-2">{challenge.description.substring(0, 100)}...</p>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(challenge.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Link
                                        to={`/challenges/${challenge._id}`}
                                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-3 rounded-xl transition-colors"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengesPage;
