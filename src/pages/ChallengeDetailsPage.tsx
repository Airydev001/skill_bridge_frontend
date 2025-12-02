import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { ArrowLeft, Play, CheckCircle, XCircle, Loader2, Trophy } from 'lucide-react';

const ChallengeDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [code, setCode] = useState('');

    const { data: challenge, isLoading } = useQuery({
        queryKey: ['challenge', id],
        queryFn: async () => {
            const res = await api.get(`/challenges/${id}`);
            return res.data;
        }
    });

    useEffect(() => {
        if (challenge && !code) {
            setCode(challenge.submission?.code || challenge.starterCode || '// Write your code here...');
        }
    }, [challenge]);

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/challenges/${id}/submit`, { code });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['challenge', id], data);
        }
    });

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!challenge) return <div>Challenge not found</div>;

    const isCompleted = challenge.status === 'graded';

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/challenges')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Challenges
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
                    {/* Left Panel: Problem Description */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-2xl font-bold text-gray-800">{challenge.title}</h1>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                    challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {challenge.difficulty}
                            </span>
                        </div>
                        <div className="prose max-w-none text-gray-600 mb-8">
                            <p className="whitespace-pre-wrap">{challenge.description}</p>
                        </div>

                        {challenge.aiEvaluation && (
                            <div className={`p-4 rounded-xl border ${challenge.aiEvaluation.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <h3 className={`font-bold mb-2 flex items-center gap-2 ${challenge.aiEvaluation.passed ? 'text-green-800' : 'text-red-800'}`}>
                                    {challenge.aiEvaluation.passed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    AI Evaluation: {challenge.aiEvaluation.score}/100
                                </h3>
                                <p className="text-sm text-gray-700">{challenge.aiEvaluation.feedback}</p>
                                {challenge.aiEvaluation.passed && (
                                    <div className="mt-3 flex items-center gap-2 text-yellow-600 font-bold text-sm">
                                        <Trophy className="w-4 h-4" />
                                        +{challenge.points} Points Earned!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Code Editor */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 bg-gray-900 rounded-2xl p-4 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-2 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <span>Code Editor</span>
                                <span>{challenge.category}</span>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                disabled={isCompleted || submitMutation.isPending}
                                className="flex-1 bg-transparent text-gray-100 font-mono text-sm resize-none outline-none w-full h-full"
                                spellCheck="false"
                            />
                        </div>

                        {!isCompleted && (
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending}
                                className="bg-primary text-white py-4 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                            >
                                {submitMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 fill-current" />
                                        Run & Submit
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChallengeDetailsPage;
