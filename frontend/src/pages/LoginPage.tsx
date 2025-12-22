import { Card } from 'flowbite-react';
import LoginForm from '../components/forms/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-white">
          Se connecter
        </h2>
        <LoginForm />
      </Card>
    </div>
  );
};

export default LoginPage;

