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
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
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

    const handleAddTag = (tag: string) => {
        if (tag && !selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setSearchTerm("");
        setShowDropdown(false);
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

    const filteredTags = availableTags.filter(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !selectedTags.includes(tag)
    );

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="firstName">First Name</Label>
                    </div>
                    <TextInput 
                        id="firstName" 
                        {...register("firstName", { required: "First name is required" })} 
                        color={errors.firstName ? "failure" : "gray"}
                    />
                    {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            {errors.firstName.message as string}
                        </p>
                    )}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="lastName">Last Name</Label>
                    </div>
                    <TextInput 
                        id="lastName" 
                        {...register("lastName", { required: "Last name is required" })} 
                        color={errors.lastName ? "failure" : "gray"}
                    />
                    {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            {errors.lastName.message as string}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="email">Email</Label>
                </div>
                <TextInput 
                    id="email" 
                    type="email" 
                    {...register("email", { 
                        required: "Email is required",
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    })} 
                    color={errors.email ? "failure" : "gray"}
                />
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {errors.email.message as string}
                    </p>
                )}
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
                <div className="relative">
                    <TextInput 
                        id="tags" 
                        placeholder="Type to search interests..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        autoComplete="off"
                    />
                    {showDropdown && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                            {filteredTags.length > 0 ? (
                                filteredTags.map(tag => (
                                    <li 
                                        key={tag} 
                                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                                        onClick={() => handleAddTag(tag)}
                                    >
                                        {tag}
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-gray-500 dark:text-gray-400">No matching interests</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>

            <Button type="submit" color="pink">Save Changes</Button>
        </form>
    );
};

export default EditProfileForm;
