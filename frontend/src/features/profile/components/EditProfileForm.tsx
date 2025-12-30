import React from 'react';
import { useForm } from 'react-hook-form';
import { Label, TextInput, Textarea, Select, Button } from 'flowbite-react';
import { CurrentUser } from '@app-types/user';

interface EditProfileFormProps {
    user: CurrentUser;
    onSubmit: (data: Partial<CurrentUser>) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit }) => {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            sexualPreferences: user.sexualPreferences,
            biography: user.biography,
            tags: user.tags.join(', '),
        }
    });

    const onFormSubmit = (data: any) => {
        const processedData = {
            ...data,
            tags: data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
            sexualPreferences: Array.isArray(data.sexualPreferences) ? data.sexualPreferences : [data.sexualPreferences]
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="firstName">First Name</Label>
                    </div>
                    <TextInput id="firstName" {...register("firstName")} />
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="lastName">Last Name</Label>
                    </div>
                    <TextInput id="lastName" {...register("lastName")} />
                </div>
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="email">Email</Label>
                </div>
                <TextInput id="email" type="email" {...register("email")} />
            </div>

            <div>
                <div className="mb-2 block">
                    <Label>Location</Label>
                </div>
                <div className="flex gap-2">
                    <TextInput readOnly value={user.location?.city || "Unknown"} className="flex-1" />
                    <Button color="light" size="sm" onClick={() => navigator.geolocation.getCurrentPosition(() => alert("Location updated!"))}>
                        Update Location
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="gender">Gender</Label>
                    </div>
                    <Select id="gender" {...register("gender")}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </Select>
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="sexualPreferences">Sexual Preferences</Label>
                    </div>
                    <Select id="sexualPreferences" {...register("sexualPreferences")} multiple>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="biography">Biography</Label>
                </div>
                <Textarea id="biography" rows={4} {...register("biography")} />
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="tags">Interests (comma separated)</Label>
                </div>
                <TextInput id="tags" {...register("tags")} placeholder="geek, cinema, sport" />
            </div>

            <Button type="submit">Save Changes</Button>
        </form>
    );
};

export default EditProfileForm;
