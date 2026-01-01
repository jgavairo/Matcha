import React from 'react';
import { useForm } from 'react-hook-form';
import { Label, TextInput, Button } from 'flowbite-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ChangePasswordForm: React.FC = () => {
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
    const newPassword = watch("newPassword");

    const onSubmit = async (data: any) => {
        try {
            await api.put('/users/password', { newPassword: data.newPassword });
            toast.success('Password updated successfully');
            reset();
        } catch (error: any) {
            console.error('Failed to update password:', error);
            toast.error(error.response?.data?.error || 'Failed to update password');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
            <div>
                <div className="mb-2 block">
                    <Label htmlFor="newPassword">New Password</Label>
                </div>
                <TextInput 
                    id="newPassword" 
                    type="password" 
                    {...register("newPassword", { 
                        required: "New password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" }
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

            <Button type="submit" color="dark">Change Password</Button>
        </form>
    );
};

export default ChangePasswordForm;
