import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') || 'mentee';

    interface RegisterFormInputs {
        name: string;
        email: string;
        password: string;
        role: string;
    }

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
        defaultValues: { role: defaultRole }
    });
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            await registerUser(data);
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-heading font-bold text-center mb-6 text-primary">Join SkillBridge</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-charcoal mb-1">Full Name</label>
                        <input
                            {...register('name', { required: 'Name is required' })}
                            type="text"
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-charcoal mb-1">Email</label>
                        <input
                            {...register('email', { required: 'Email is required' })}
                            type="email"
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-charcoal mb-1">Password</label>
                        <input
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                            type="password"
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-charcoal mb-1">I want to be a</label>
                        <select
                            {...register('role')}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value="mentee">Mentee</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition">
                        Sign Up
                    </button>
                </form>
                <p className="text-center mt-4 text-neutral-charcoal">
                    Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
