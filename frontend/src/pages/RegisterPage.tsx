import { Card, Spinner } from 'flowbite-react';
import RegisterForm from '@components/forms/RegisterForm';
import { useState } from 'react';

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      {/* Loading Overlay - covers entire page */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" color="pink" />
            <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">Creating your account...</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-grow items-center justify-center">
        <Card className="w-full max-w-md">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <RegisterForm onLoadingChange={setIsLoading} />
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;
