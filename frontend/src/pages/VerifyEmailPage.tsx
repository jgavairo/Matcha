import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "@services/api";
import { Spinner, Button } from "flowbite-react";
import { useAuth } from "../context/AuthContext";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const { isAuthenticated } = useAuth();
    
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
                const query = type ? `&type=${type}` : '';
                const response = await api.get(`/auth/verify-email?token=${token}${query}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Failed to verify email');
            }
        };

        verifyEmail();
    }, [token, type]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            {status === 'loading' && (
                <div className="text-center">
                    <Spinner size="xl" color="pink" />
                    <p className="mt-4 text-gray-600">Verifying your email...</p>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Email Verified!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    
                    {isAuthenticated ? (
                         <Link to="/profile">
                            <Button className="relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-12 px-5 text-base bg-pink-700 text-white hover:bg-pink-800 focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800">
                                Return to Profile
                            </Button>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <Button className="relative flex items-center justify-center rounded-lg text-center font-medium focus:outline-none focus:ring-4 h-12 px-5 text-base bg-pink-700 text-white hover:bg-pink-800 focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800">
                                Proceed to Login
                            </Button>
                        </Link>
                    )}
                </div>
            )}

            {status === 'error' && (
                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">
                        Verification Failed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
                    <Link to={isAuthenticated ? "/profile" : "/login"}>
                        <Button color="gray">
                            {isAuthenticated ? "Return to Profile" : "Back to Login"}
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default VerifyEmailPage;