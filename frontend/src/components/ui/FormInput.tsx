import { Label, TextInput, TextInputProps } from 'flowbite-react';
import { FieldError } from 'react-hook-form';
import { forwardRef } from 'react';

interface FormInputProps extends Omit<TextInputProps, 'color'> {
  label: string;
  error?: FieldError;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={className}>
        <div className="mb-2 block">
            <Label htmlFor={props.id || props.name}>{label}</Label>
        </div>
        <TextInput
          {...props}
          ref={ref}
          color={error ? "failure" : "gray"}
        />
        {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500 font-medium">
                {error.message}
            </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
