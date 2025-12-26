import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginFormData } from '../../types/forms';
import { loginUser } from '../../features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      if (response.message === 'Login successful') {
        addToast('Connection successful', 'success');
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging in user');
      addToast('Wrong email or password', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email */}
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

      {/* Password */}
      <div>
        <Label htmlFor="password" className="mb-2 block">Mot de passe</Label>
        <TextInput
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {/* Remember me + Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        <Link to="/forgot-password" className="text-sm text-pink-600 hover:underline">
          Forgot password ?
        </Link>
      </div>

      {/* Bouton submit */}
      <Button type="submit" color="pink" className="mt-4">
        Sign in
      </Button>

      {/* Lien vers register */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account ?{' '}
        <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;

