import { Button } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { RegisterFormData } from '@app-types/forms';
import authService from '@features/auth/services/authService';
import { useNotification } from '@context/NotificationContext';
import { FormInput } from '../ui/FormInput';
import { FormDatePicker } from '../ui/FormDatePicker';
import { validateAge } from '../../utils/validators';
import { 
  EMAIL_REGEX, 
  USERNAME_REGEX, 
  NAME_REGEX, 
  PASSWORD_REGEX,
  USERNAME_MAX,
  NAME_MAX
} from '@shared/validation';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    control
  } = useForm<RegisterFormData>({
    mode: "onChange"
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data);
      addToast('Register successful, please check your email for verification', 'success');
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessages = Object.values(details).join(', ');
        addToast(`Validation errors: ${errorMessages}`, 'error');
      } else {
        const errorMessage = error.response?.data?.error || 'Error registering user';
        addToast(errorMessage, 'error');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormInput
        id="email"
        label="Email"
        placeholder="exemple@email.com"
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
                />
            )}
        />

      <FormInput
          id="password"
          label="Password"
          type="password"
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

