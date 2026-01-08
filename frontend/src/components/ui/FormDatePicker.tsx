import { Label, Datepicker } from 'flowbite-react';
import { FieldError } from 'react-hook-form';

interface FormDatePickerProps {
  id: string;
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  error?: FieldError;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export const FormDatePicker = ({ 
    id, 
    label, 
    value, 
    onChange, 
    error, 
    minDate = new Date(1900, 0, 1), 
    maxDate,
    disabled = false
}: FormDatePickerProps) => {
  return (
      <div>
        <div className="mb-2 block">
            <Label htmlFor={id}>{label}</Label>
        </div>
        <Datepicker
          id={id}
          className="w-full"
          minDate={minDate}
          maxDate={maxDate}
          value={value ? new Date(value) : undefined}
          onChange={(date: Date | null) => {
              if (!date) {
                  onChange("");
                  return;
              }
              const offset = date.getTimezoneOffset();
              const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
              const dateString = adjustedDate.toISOString().split('T')[0];
              onChange(dateString);
          }}
          color={error ? "failure" : "gray"}
          disabled={disabled}
        />
        {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500 font-medium">
                {error.message}
            </p>
        )}
      </div>
  );
};
