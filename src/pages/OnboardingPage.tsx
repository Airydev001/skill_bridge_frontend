
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const OnboardingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();

    const onSubmit = async (data: any) => {
        try {
            if (user?.role === 'mentor') {
                // Transform availability to array of objects if needed, for MVP simple string split
                const formattedData = {
                    ...data,
                    skills: data.skills.split(',').map((s: string) => s.trim()),
                    languages: data.languages.split(',').map((s: string) => s.trim()),
                    yearsExperience: Number(data.yearsExperience),
                    availability: [] // TODO: Implement complex availability UI
                };
                await api.post('/users/mentor-profile', formattedData);
            } else {
                const formattedData = {
                    ...data,
                    interests: data.interests.split(',').map((s: string) => s.trim()),
                    learningGoals: data.learningGoals.split(',').map((s: string) => s.trim()),
                    preferredTimes: [] // TODO: Implement complex time UI
                };
                await api.post('/users/mentee-profile', formattedData);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-heading font-bold text-center mb-6 text-primary">
                    Complete Your Profile
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {user?.role === 'mentor' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Bio</label>
                                <textarea {...register('bio', { required: true })} className="w-full p-3 rounded-lg border" rows={4} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Skills (comma separated)</label>
                                <input {...register('skills', { required: true })} className="w-full p-3 rounded-lg border" placeholder="React, Node.js, Python" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Years of Experience</label>
                                <input {...register('yearsExperience', { required: true })} type="number" className="w-full p-3 rounded-lg border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Languages (comma separated)</label>
                                <input {...register('languages', { required: true })} className="w-full p-3 rounded-lg border" placeholder="English, French" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Interests (comma separated)</label>
                                <input {...register('interests', { required: true })} className="w-full p-3 rounded-lg border" placeholder="Web Development, Data Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Skill Level</label>
                                <select {...register('skillLevel')} className="w-full p-3 rounded-lg border">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Learning Goals (comma separated)</label>
                                <textarea {...register('learningGoals', { required: true })} className="w-full p-3 rounded-lg border" rows={3} />
                            </div>
                        </>
                    )}
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
                        Complete Profile
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;
