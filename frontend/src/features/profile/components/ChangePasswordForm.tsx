import React from 'react';
import { useForm } from 'react-hook-form';
import { Label, TextInput, Button } from 'flowbite-react';
import { api } from '@services/api';
import { useNotification } from '@context/NotificationContext';
import { PASSWORD_REGEX } from '@shared/validation';

const ChangePasswordForm: React.FC = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
    const newPassword = watch("newPassword");
    const { addToast } = useNotification();

    const onSubmit = async (data: any) => {
        try {
            await api.put('/users/password', { newPassword: data.newPassword });
            addToast('Password updated successfully', 'success');
            reset();
        } catch (error: any) {
            addToast(error.response?.data?.error || 'Failed to update password', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input type="text" autoComplete="username" className="hidden" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="newPassword">New Password</Label>
                    </div>
                    <TextInput 
                        id="newPassword" 
                        type="password" 
                        autoComplete="new-password"
                        {...register("newPassword", { 
                            required: "New password is required",
                            pattern: { value: PASSWORD_REGEX, message: "Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char" }
                        })} 
                        color={errors.newPassword ? "failure" : "gray"}
                    />
                    {errors.newPassword && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            {errors.newPassword.message as string}
                        </p>
                    )}
                </div>

                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    </div>
                    <TextInput 
                        id="confirmPassword" 
                        type="password" 
                        autoComplete="new-password"
                        {...register("confirmPassword", { 
                            required: "Please confirm your password",
                            validate: value => value === newPassword || "Passwords do not match"
                        })} 
                        color={errors.confirmPassword ? "failure" : "gray"}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            {errors.confirmPassword.message as string}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" color="pink">Change Password</Button>
        </form>
    );
};

export default ChangePasswordForm;
