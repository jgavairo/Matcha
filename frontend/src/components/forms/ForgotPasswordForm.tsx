import { Button, Label, TextInput, Spinner } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForgotPasswordFormData } from '@app-types/forms';
import authService from '@features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';

interface ForgotPasswordFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

export const ForgotPasswordForm = ({ onLoadingChange }: ForgotPasswordFormProps) => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(formData);
      addToast('Email sent successfully', 'success');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error sending email';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email" className="mb-2 block">Email</Label>
        <TextInput
          id="email"
          name="email"
          type="email"
          placeholder="exemple@email.com"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" color="pink" className="mt-4" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Sending...
          </>
        ) : (
          'Send'
        )}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Back to{' '}
        <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
          Login
        </Link>
      </p>
    </form>
  );
};