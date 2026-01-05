import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@services/api";
import { Button, Label, TextInput, Spinner } from "flowbite-react";
import { useNotification } from "@context/NotificationContext";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { addToast } = useNotification();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token) {
            setStatus('error');
            setMessage('Invalid reset link. Token is missing.');
            return;
        }

        if (password !== confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        setStatus('loading');

        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: password
            });
            setStatus('success');
            setMessage(response.data.message || 'Password reset successfully!');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Failed to reset password');
        }
    };

    // No token in URL
    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">✗</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Invalid Link
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link 
                        to="/forgot-password" 
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            {status === 'form' && (
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Reset Your Password
                    </h1>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="password" className="mb-2 block">New Password</Label>
                            <TextInput
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                            <TextInput
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" color="pink" className="mt-4">
                            Reset Password
                        </Button>
                    </form>
                </div>
            )}

            {status === 'loading' && (
                <div className="text-center">
                    <Spinner size="xl" color="pink" />
                    <p className="mt-4 text-gray-600">Resetting your password...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center">
                    <div className="text-green-500 text-6xl mb-4">✓</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Password Reset!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <Link 
                        to="/login" 
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        Go to Login
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">✗</div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Reset Failed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <Link 
                        to="/forgot-password" 
                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        Request New Link
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ResetPasswordPage;

