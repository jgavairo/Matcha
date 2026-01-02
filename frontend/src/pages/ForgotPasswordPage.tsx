import { ForgotPasswordForm } from '@components/forms/ForgotPasswordForm';
import { Card } from 'flowbite-react';

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-grow items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
          Forgot Password
        </h2>
        <ForgotPasswordForm />
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;