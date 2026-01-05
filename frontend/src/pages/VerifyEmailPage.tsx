import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "@services/api";
import { Spinner } from "flowbite-react";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Token is missing');
                return;
            }

            try {
                const response = await api.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Failed to verify email');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            {status === 'loading' && (
                <div className="text-center">
                    <Spinner size="xl" color="pink" />
                    <p className="mt-4 text-gray-600">Verifying your email...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Email Verified!
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Verification Failed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <Link 
                        to="/login" 
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Go to Login
                    </Link>
                </div>
            )}
        </div>
    );
};

export default VerifyEmailPage;