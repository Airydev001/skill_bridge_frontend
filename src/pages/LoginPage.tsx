import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await login(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-softGray flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-heading font-bold text-center mb-6 text-primary">Welcome Back</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            {...register('password', { required: 'Password is required' })}
                            type="password"
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
                    </div>
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot Password?</Link>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                </form>
                <p className="text-center mt-4 text-neutral-charcoal">
                    Don't have an account? <Link to="/register" className="text-primary font-medium">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
