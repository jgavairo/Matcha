import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Appel API backend
    console.log('Login submitted:', formData);
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

      {/* Mot de passe */}
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
          <Label htmlFor="remember">Se souvenir de moi</Label>
        </div>
        <Link to="/forgot-password" className="text-sm text-pink-600 hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      {/* Bouton submit */}
      <Button type="submit" color="pink" className="mt-4">
        Se connecter
      </Button>

      {/* Lien vers register */}
      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-pink-600 hover:text-pink-500">
          S'inscrire
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;

