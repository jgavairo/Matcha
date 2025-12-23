import { Card } from 'flowbite-react';
import RegisterForm from '../components/forms/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-white">
          Create your account
        </h2>
        <RegisterForm />
      </Card>
    </div>
  );
};

export default RegisterPage;
