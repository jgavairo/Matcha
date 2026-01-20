import { Button, Spinner } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { RegisterFormData } from '@app-types/forms';
import authService from '@features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';
import { FormInput } from '../ui/FormInput';
import { FormDatePicker } from '../ui/FormDatePicker';
import { validateAge } from '../../utils/validators';
import { useState, useEffect } from 'react';
import { 
  EMAIL_REGEX, 
  USERNAME_REGEX, 
  NAME_REGEX, 
  PASSWORD_REGEX,
  USERNAME_MAX,
  NAME_MAX
} from '@shared/validation';

interface RegisterFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const RegisterForm = ({ onLoadingChange }: RegisterFormProps) => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  // Notify parent component of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    control,
    setError
  } = useForm<RegisterFormData>({
    mode: "onChange"
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      addToast('Register successful, please check your email for verification', 'success');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data?.error === 'Email already in use') {
        setError('email', { type: 'manual', message: 'Email already in use' });
        return; 
      }
      
      if (error.response?.data?.error === 'Username already taken') {
        setError('username', { type: 'manual', message: 'Username already taken' });
        return;
      }

      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessages = Object.values(details).join(', ');
        addToast(`Validation errors: ${errorMessages}`, 'error');
      } else {
        let errorMessage = 'Error registering user';

        if (error.response?.status === 429) {
          errorMessage = 'Too many registration attempts. Please try again later.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        addToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        id="email"
        label="Email"
        placeholder="exemple@email.com"
        disabled={isLoading}
        {...register("email", { 
          required: "Email is required",
          pattern: { value: EMAIL_REGEX, message: "Invalid email format" }
        })}
        error={errors.email}
      />

      <FormInput
        id="username"
        label="Username"
        placeholder="johndoe"
        maxLength={USERNAME_MAX}
        autoComplete="username"
        disabled={isLoading}
        {...register("username", { 
          required: "Username is required",
          pattern: { value: USERNAME_REGEX, message: "Username must be 3-16 alphanumeric characters" },
          maxLength: { value: USERNAME_MAX, message: `Max ${USERNAME_MAX} characters` }
        })}
        error={errors.username}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
            id="firstName"
            label="First Name"
            placeholder="John"
            maxLength={NAME_MAX}
            disabled={isLoading}
            {...register("firstName", { 
              required: "First name is required",
              pattern: { value: NAME_REGEX, message: "Use only letters. No numbers or consecutive spaces." },
              maxLength: { value: NAME_MAX, message: `Max ${NAME_MAX} characters` }
            })}
            error={errors.firstName}
        />
        
        <FormInput
            id="lastName"
            label="Last Name"
            placeholder="Doe"
            maxLength={NAME_MAX}
            disabled={isLoading}
            {...register("lastName", { 
              required: "Last name is required",
              pattern: { value: NAME_REGEX, message: "Use only letters. No numbers or consecutive spaces." },
              maxLength: { value: NAME_MAX, message: `Max ${NAME_MAX} characters` }
            })}
            error={errors.lastName}
        />
      </div>

      <Controller
            control={control}
            name="birthDate"
            rules={{
                required: "Birth date is required",
                validate: validateAge
            }}
            render={({ field: { onChange, value } }) => (
                <FormDatePicker
                    id="birthDate"
                    label="Birth Date"
                    value={value}
                    onChange={onChange}
                    error={errors.birthDate}
                    disabled={isLoading}
                />
            )}
        />

      <FormInput
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("password", { 
            required: "Password is required",
            pattern: { value: PASSWORD_REGEX, message: "Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char" }
          })}
          error={errors.password}
      />

      <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          disabled={isLoading}
          {...register("confirmPassword", { 
            required: "Please confirm your password",
            validate: (val) => {
              if (watch('password') != val) {
                return "Your passwords do no match";
              }
            },
          })}
          error={errors.confirmPassword}
      />

      <Button type="submit" color="pink" className="mt-4" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Registering...
          </>
        ) : (
          'Register'
        )}
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

