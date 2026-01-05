import { Card } from 'flowbite-react';
import RegisterForm from '@components/forms/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex flex-grow items-center justify-center">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <RegisterForm />
      </Card>
    </div>
  );
};

export default RegisterPage;
