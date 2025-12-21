import { Button, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Appel API backend
    console.log('Form submitted:', formData);
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

      {/* Username */}
      <div>
        <Label htmlFor="username" className="mb-2 block">Nom d'utilisateur</Label>
        <TextInput
          id="username"
          name="username"
          type="text"
          placeholder="johndoe"
          required
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      {/* Nom / Prénom sur la même ligne */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="mb-2 block">Prénom</Label>
          <TextInput
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-2 block">Nom</Label>
          <TextInput
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Date de naissance */}
      <div>
        <Label htmlFor="birthDate" className="mb-2 block">Date de naissance</Label>
        <TextInput
          id="birthDate"
          name="birthDate"
          type="date"
          required
          value={formData.birthDate}
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

      {/* Confirmer mot de passe */}
      <div>
        <Label htmlFor="confirmPassword" className="mb-2 block">Confirmer le mot de passe</Label>
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {/* Bouton submit */}
      <Button type="submit" color="pink" className="mt-4">
        S'inscrire
      </Button>

      {/* Lien vers login */}
      <p className="text-center text-sm text-gray-600">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
          Se connecter
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;

