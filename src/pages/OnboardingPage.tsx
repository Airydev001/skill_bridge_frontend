
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import AvailabilitySelector from '../components/AvailabilitySelector';

const OnboardingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();
    const [availability, setAvailability] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (user?.role === 'mentor') {
                const formattedData = {
                    ...data,
                    skills: data.skills.split(',').map((s: string) => s.trim()),
                    languages: data.languages.split(',').map((s: string) => s.trim()),
                    yearsExperience: Number(data.yearsExperience),
                    availability: availability
                };
                await api.post('/users/mentor-profile', formattedData);
            } else {
                const formattedData = {
                    ...data,
                    interests: data.interests.split(',').map((s: string) => s.trim()),
                    learningGoals: data.learningGoals.split(',').map((s: string) => s.trim()),
                    preferredTimes: []
                };
                await api.post('/users/mentee-profile', formattedData);
            }
            navigate('/dashboard');
        } catch (error) {
            console.error('Onboarding failed', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl my-8">
                <h2 className="text-3xl font-heading font-bold text-center mb-6 text-primary">
                    Complete Your Profile
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {user?.role === 'mentor' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Bio</label>
                                <textarea {...register('bio', { required: true })} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" rows={4} placeholder="Tell us about yourself..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Skills (comma separated)</label>
                                <input {...register('skills', { required: true })} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="React, Node.js, Python" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-charcoal mb-1">Years of Experience</label>
                                    <input {...register('yearsExperience', { required: true })} type="number" className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-charcoal mb-1">Languages</label>
                                    <input {...register('languages', { required: true })} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="English, French" />
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <AvailabilitySelector onChange={setAvailability} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Interests (comma separated)</label>
                                <input {...register('interests', { required: true })} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" placeholder="Web Development, Data Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Skill Level</label>
                                <select {...register('skillLevel')} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-charcoal mb-1">Learning Goals (comma separated)</label>
                                <textarea {...register('learningGoals', { required: true })} className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none" rows={3} />
                            </div>
                        </>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition shadow-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                Saving...
                            </>
                        ) : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OnboardingPage;
