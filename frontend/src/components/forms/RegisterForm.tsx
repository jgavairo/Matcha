import { Button, Label, TextInput, Datepicker } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterFormData } from '@app-types/forms';
import authService from '@features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';
import { EMAIL_REGEX, USERNAME_REGEX, NAME_REGEX, PASSWORD_REGEX } from '@utils/regexUtils';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
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
      await authService.register(formData);
      addToast('Register successful, please check your email for verification', 'success');
        navigate('/login');
    } catch (error: any) {
      // Vérifier si ce sont des erreurs de validation
      if (error.response?.data?.details) {
        // Afficher toutes les erreurs de validation
        const details = error.response.data.details;
        const errorMessages = Object.values(details).join(', ');
        addToast(`Validation errors: ${errorMessages}`, 'error');
      } else {
        // Erreur générale
        const errorMessage = error.response?.data?.error || 'Error registering user';
        addToast(errorMessage, 'error');
      }
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
          pattern={EMAIL_REGEX.source}
          placeholder="exemple@email.com"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="username" className="mb-2 block">Username</Label>
        <TextInput
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          pattern={USERNAME_REGEX.source}
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="mb-2 block">First Name</Label>
          <TextInput
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            pattern={NAME_REGEX.source}
            required
            value={formData.firstName}
            onChange={handleChange}
            
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-2 block">Last Name</Label>
          <TextInput
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            pattern={NAME_REGEX.source}
            required
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="birthDate" className="mb-2 block">Birth Date</Label>
        <Datepicker
          id="birthDate"
          className="w-full"
          value={formData.birthDate ? new Date(formData.birthDate) : undefined}
          onChange={(date: Date | null) => {
            if (!date) return;
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
            const dateString = adjustedDate.toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, birthDate: dateString }));
          }}
          maxDate={new Date()}
        />
      </div>

      <div>
        <Label htmlFor="password" className="mb-2 block">Password</Label>
        <TextInput
          id="password"
          name="password"
          type="password"
          pattern={PASSWORD_REGEX.source}
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          pattern={PASSWORD_REGEX.source}
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" color="pink" className="mt-4">
        Register
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account ?{' '}
        <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;

