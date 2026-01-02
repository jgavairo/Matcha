import { Button, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForgotPasswordFormData } from '@app-types/forms';
import authService from '@features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.forgotPassword(formData);
      if (response.status === 200) {
        addToast('Email sent successfully', 'success');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      addToast('Failed to send email', 'error');
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
        />
      </div>
      <Button type="submit" color="pink" className="mt-4">
        Send
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