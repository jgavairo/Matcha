import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label, TextInput, Textarea, Select, Button, Badge } from 'flowbite-react';
import { CurrentUser } from '@app-types/user';
import { api } from '../../../services/api';
import { HiX } from 'react-icons/hi';

interface EditProfileFormProps {
    user: CurrentUser;
    onSubmit: (data: Partial<CurrentUser>) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit }) => {
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>(user.tags || []);

    const { register, handleSubmit } = useForm({
        defaultValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            sexualPreferences: user.sexualPreferences,
            biography: user.biography,
        }
    });

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await api.get('/tags');
                setAvailableTags(response.data);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleAddTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tag = e.target.value;
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        e.target.value = ""; // Reset select
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const onFormSubmit = (data: any) => {
        const processedData = {
            ...data,
            tags: selectedTags,
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
                    <Select id="sexualPreferences" {...register("sexualPreferences")}>
                        <option value="hetero">Heterosexual</option>
                        <option value="bi">Bisexual</option>
                        <option value="homo">Homosexual</option>
                    </Select>
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
                    <Label htmlFor="tags">Interests</Label>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tag => (
                        <Badge key={tag} color="info" size="sm" className="px-2 py-1 flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 ml-1">
                                <HiX className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <Select id="tags" onChange={handleAddTag} value="">
                    <option value="" disabled>Select an interest to add...</option>
                    {availableTags
                        .filter(tag => !selectedTags.includes(tag))
                        .map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                </Select>
            </div>

            <Button type="submit">Save Changes</Button>
        </form>
    );
};

export default EditProfileForm;
