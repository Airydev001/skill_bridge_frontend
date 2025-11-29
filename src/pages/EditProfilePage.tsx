import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import AvailabilitySelector from '../components/AvailabilitySelector';

const EditProfilePage = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [availability, setAvailability] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                const userData = res.data;

                // Pre-fill form
                setValue('name', userData.name);
                setValue('avatarUrl', userData.avatarUrl);

                if (userData.profile) {
                    if (userData.role === 'mentor') {
                        setValue('bio', userData.profile.bio);
                        setValue('skills', userData.profile.skills.join(', '));
                        setValue('yearsExperience', userData.profile.yearsExperience);
                        setValue('languages', userData.profile.languages.join(', '));
                        setAvailability(userData.profile.availability || []);
                    } else {
                        setValue('interests', userData.profile.interests.join(', '));
                        setValue('skillLevel', userData.profile.skillLevel);
                        setValue('learningGoals', userData.profile.learningGoals.join(', '));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [setValue]);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const payload: any = {
                name: data.name,
                avatarUrl: data.avatarUrl,
            };

            if (data.password) {
                payload.password = data.password;
            }

            if (user?.role === 'mentor') {
                payload.bio = data.bio;
                payload.skills = data.skills.split(',').map((s: string) => s.trim());
                payload.yearsExperience = Number(data.yearsExperience);
                payload.languages = data.languages.split(',').map((s: string) => s.trim());
                payload.availability = availability;
            } else {
                payload.interests = data.interests.split(',').map((s: string) => s.trim());
                payload.skillLevel = data.skillLevel;
                payload.learningGoals = data.learningGoals.split(',').map((s: string) => s.trim());
            }

            const res = await api.put('/users/profile', payload);

            // Update local user context
            setUser({ ...user, ...res.data });

            navigate('/dashboard');
        } catch (error) {
            console.error('Update failed', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6 text-neutral-charcoal">Edit Profile</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input {...register('name')} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                            <input {...register('avatarUrl')} className="w-full p-2 border rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                        <input {...register('password')} type="password" className="w-full p-2 border rounded-lg" />
                    </div>

                    <div className="border-t my-6"></div>

                    {/* Role Specific Info */}
                    {user?.role === 'mentor' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea {...register('bio')} className="w-full p-2 border rounded-lg" rows={4} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                                <input {...register('skills')} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                                    <input {...register('yearsExperience')} type="number" className="w-full p-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                                    <input {...register('languages')} className="w-full p-2 border rounded-lg" />
                                </div>
                            </div>

                            <div className="mt-6">
                                <AvailabilitySelector onChange={setAvailability} />
                                <p className="text-xs text-gray-500 mt-2">Note: This will overwrite your existing availability.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                                <input {...register('interests')} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                                <select {...register('skillLevel')} className="w-full p-2 border rounded-lg">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
                                <textarea {...register('learningGoals')} className="w-full p-2 border rounded-lg" rows={3} />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
