import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Label, TextInput, Textarea, Select, Button, Badge } from 'flowbite-react';
import { CurrentUser } from '@app-types/user';
import { api } from '../../../services/api';
import { HiX } from 'react-icons/hi';
import { useNotification } from '../../../context/NotificationContext';

interface EditProfileFormProps {
    user: CurrentUser;
    onSubmit: (data: Partial<CurrentUser>) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit }) => {
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>(user.tags || []);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [location, setLocation] = useState({
        latitude: user.location?.latitude || 0,
        longitude: user.location?.longitude || 0,
        city: user.location?.city || ""
    });
    const [locationError, setLocationError] = useState("");
    const [isGeocoding, setIsGeocoding] = useState(false);
    const { addToast } = useNotification();

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

    const handleLocateMe = () => {
        if (!user.geolocationConsent) {
            addToast("Please enable geolocation consent in the Security tab to use this feature.", 'error');
            return;
        }
        if (!navigator.geolocation) {
            addToast("Geolocation is not supported by your browser", 'error');
            return;
        }
        setIsGeocoding(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                const city = data.address.city || data.address.town || data.address.village || "Unknown Location";
                setLocation({ latitude, longitude, city });
            } catch (e) {
                setLocation({ latitude, longitude, city: "GPS Location" });
            } finally {
                setIsGeocoding(false);
            }
        }, () => {
            addToast("Unable to retrieve your location", 'error');
            setIsGeocoding(false);
        });
    };

    const handleCityBlur = async () => {
        if (!location.city.trim()) return;
        setIsGeocoding(true);
        setLocationError("");
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.city)}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLocation(prev => ({
                    ...prev,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                }));
            } else {
                setLocationError("Location not found. Please check the spelling.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            setLocationError("Unable to validate location.");
        } finally {
            setIsGeocoding(false);
        }
    };

    const onFormSubmit = async (data: any) => {
        if (locationError) return;

        let finalLocation = { ...location };

        // If city is present but we want to ensure we have coords for THAT city.
        if (finalLocation.city && finalLocation.city.trim() !== "") {
             try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalLocation.city)}&limit=1`);
                const geoData = await res.json();
                if (geoData && geoData.length > 0) {
                    finalLocation.latitude = parseFloat(geoData[0].lat);
                    finalLocation.longitude = parseFloat(geoData[0].lon);
                } else {
                    setLocationError("Location not found.");
                    return; // Stop submission
                }
             } catch (e) {
                 // ignore or handle
             }
        }

        const processedData = {
            ...data,
            tags: selectedTags,
            ...finalLocation
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
                    <TextInput 
                        value={location.city} 
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        onBlur={handleCityBlur}
                        placeholder="City or Neighborhood"
                        className="flex-1" 
                        color={locationError ? "failure" : "gray"}
                        disabled={isGeocoding}
                    />
                    <Button color="light" size="sm" onClick={handleLocateMe} disabled={isGeocoding}>
                        {isGeocoding ? "Locating..." : "Locate Me"}
                    </Button>
                </div>
                {locationError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {locationError}
                    </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                </p>
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
