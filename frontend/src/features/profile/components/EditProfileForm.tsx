import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Label, TextInput, Textarea, Select, Button, Badge, Checkbox } from 'flowbite-react';
import { CurrentUser } from '@app-types/user';
import { api } from '@services/api';
import { HiX } from 'react-icons/hi';
import { useNotification } from '@context/NotificationContext';
import { FormInput } from '@components/ui/FormInput';
import { FormDatePicker } from '@components/ui/FormDatePicker';
import { validateAge } from '@utils/validators';
import { 
    EMAIL_REGEX, 
    USERNAME_REGEX, 
    NAME_REGEX, 
    BIRTH_DATE_REGEX, 
    BIOGRAPHY_REGEX,
    USERNAME_MAX,
    NAME_MAX,
    BIOGRAPHY_MIN,
    BIOGRAPHY_MAX,
    CITY_MAX,
    TAGS_MIN,
    MIN_AGE
} from '@shared/validation';

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
    const [cityInput, setCityInput] = useState(user.location?.city || "");
    const [locationError, setLocationError] = useState("");
    const [isGeocoding, setIsGeocoding] = useState(false);
    const { addToast } = useNotification();

    const { register, handleSubmit, formState: { errors }, watch, getValues, control, setValue } = useForm({
        mode: "onChange",
        defaultValues: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            sexualPreferences: user.sexualPreferences || [],
            biography: user.biography,
            birthDate: user.birthDate || ""
        }
    });

    const save = handleSubmit(async (data) => {
        await onFormSubmit(data);
    }, (errors) => {
        console.log("Form validation failed:", errors);
    });

    const watchedSexualPreferences = watch('sexualPreferences');

    // Sync birthDate when user prop updates
    useEffect(() => {
        setValue("birthDate", user.birthDate || "");
    }, [user.birthDate, setValue]);

    // Auto-save for Tags, Location, Sexual Preferences (when they change)
    useEffect(() => {
        const sortArray = (arr: any[]) => [...(arr || [])].sort();
        
        // Skip initial render or if values haven't changed meaningfully
        if (location.city === user.location?.city && 
            location.latitude === user.location?.latitude && 
            location.longitude === user.location?.longitude &&
            JSON.stringify(sortArray(selectedTags)) === JSON.stringify(sortArray(user.tags)) &&
            JSON.stringify(sortArray(watchedSexualPreferences)) === JSON.stringify(sortArray(user.sexualPreferences))) {
            return;
        }
        save();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, selectedTags, watchedSexualPreferences]);

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
        if (selectedTags.length <= TAGS_MIN) {
            addToast(`You must have at least ${TAGS_MIN} interest(s)`, 'error');
            return;
        }
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
                setCityInput(city);
            } catch (e) {
                setLocation({ latitude, longitude, city: "GPS Location" });
                setCityInput("GPS Location");
            } finally {
                setIsGeocoding(false);
            }
        }, () => {
            addToast("Unable to retrieve your location", 'error');
            setIsGeocoding(false);
        });
    };

    const handleCityBlur = async () => {
        if (!cityInput.trim()) return;
        setIsGeocoding(true);
        setLocationError("");
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityInput)}&limit=1`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLocation(prev => ({
                    ...prev,
                    city: cityInput,
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
        // Only fetch if coordinates are missing (0,0)
        if (finalLocation.city && finalLocation.city.trim() !== "" && (finalLocation.latitude === 0 || finalLocation.longitude === 0)) {
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

    // Helper to wrap register with onBlur/onChange save
    const registerWithSave = (name: any, options?: any) => {
        const { onBlur, onChange, ...rest } = register(name, options);
        return {
            ...rest,
            onBlur: async (e: any) => {
                await onBlur(e);
                const currentValue = getValues(name);
                const userValue = user[name as keyof CurrentUser] || "";
                if (currentValue !== userValue) {
                    save();
                }
            },
            onChange: async (e: any) => {
                await onChange(e);
                // Only save on change for Selects, not TextInputs
                if (e.target.tagName === 'SELECT') {
                    const currentValue = getValues(name);
                    const userValue = user[name as keyof CurrentUser] || "";
                    if (currentValue !== userValue) {
                        save();
                    }
                }
            }
        };
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <FormInput
                        id="username"
                        label="Username"
                        maxLength={USERNAME_MAX}
                        {...registerWithSave("username", { 
                            pattern: { value: USERNAME_REGEX, message: "Invalid username" },
                            required: "Username is required", 
                            maxLength: { value: USERNAME_MAX, message: `Username must be less than ${USERNAME_MAX} characters` }
                        })}
                        error={errors.username}
                    />
                </div>
                <div>
                    <FormInput
                        id="firstName"
                        label="First Name"
                        maxLength={NAME_MAX}
                        {...registerWithSave("firstName", { 
                            required: "First name is required", 
                            pattern: { value: NAME_REGEX, message: "Use only letters. No numbers or consecutive spaces." },
                            maxLength: { value: NAME_MAX, message: `First name must be less than ${NAME_MAX} characters` }
                        })}
                        error={errors.firstName}
                    />
                </div>
                <div>
                    <FormInput
                        id="lastName"
                        label="Last Name"
                        maxLength={NAME_MAX}
                        {...registerWithSave("lastName", { 
                            required: "Last name is required", 
                            pattern: { value: NAME_REGEX, message: "Use only letters. No numbers or consecutive spaces." },
                            maxLength: { value: NAME_MAX, message: `Last name must be less than ${NAME_MAX} characters` }
                        })}
                        error={errors.lastName}
                    />
                </div>
            </div>

            <div>
                <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    {...registerWithSave("email", { 
                        required: "Email is required",
                        pattern: {
                            value: EMAIL_REGEX,
                            message: "Invalid email address"
                        }
                    })}
                    error={errors.email}
                />
            </div>

            <div>
                <div className="mb-2 block">
                    <Label>Location</Label>
                </div>
                <div className="flex gap-2">
                    <TextInput 
                        value={cityInput} 
                        onChange={(e) => setCityInput(e.target.value)}
                        onBlur={handleCityBlur}
                        maxLength={100}
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
                     <Controller
                        control={control}
                        name="birthDate"
                        rules={{
                            required: "Birth date is required",
                            pattern: { value: BIRTH_DATE_REGEX, message: "Invalid date format" },
                            validate: validateAge
                        }}
                        render={({ field: { onChange, value } }) => (
                            <FormDatePicker
                                key={user.birthDate} // Force re-render when date changes from outside
                                id="birthDate"
                                label="Date of Birth"
                                value={value}
                                onChange={(dateString: string) => {
                                    onChange(dateString);
                                    
                                    const userValue = user.birthDate || "";
                                    if (dateString !== userValue) {
                                        save();
                                    }
                                }}
                                error={errors.birthDate}
                            />
                        )}
                    />
                </div>

                <div>
                    <div className="mb-2 block">
                        <Label>Sexual Preferences</Label>
                    </div>
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                             <Checkbox id="pref-male" value="male" {...register("sexualPreferences")} />
                             <Label htmlFor="pref-male">Male</Label>
                         </div>
                         <div className="flex items-center gap-2">
                             <Checkbox id="pref-female" value="female" {...register("sexualPreferences")} />
                             <Label htmlFor="pref-female">Female</Label>
                         </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="pref-other" value="other" {...register("sexualPreferences")} />
                            <Label htmlFor="pref-other">Other</Label>
                        </div>
                    </div>
                    {errors.sexualPreferences && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            {errors.sexualPreferences.message as string}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <div className="mb-2 block">
                    <Label htmlFor="biography">Biography</Label>
                </div>
                <Textarea 
                    id="biography" 
                    maxLength={BIOGRAPHY_MAX}
                    rows={4} 
                    {...registerWithSave("biography", {
                        required: "Biography is required",
                        minLength: { value: BIOGRAPHY_MIN, message: `Biography must be at least ${BIOGRAPHY_MIN} characters` },
                        maxLength: { value: BIOGRAPHY_MAX, message: `Biography must be less than ${BIOGRAPHY_MAX} characters` },
                        pattern: { value: BIOGRAPHY_REGEX, message: "Avoid multiple consecutive spaces. Must contain valid text." }
                    })} 
                    color={errors.biography ? "failure" : "gray"}
                />
                {errors.biography && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                        {errors.biography.message as string}
                    </p>
                )}
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
                        <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto bottom-full mb-1">
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
        </form>
    );
};

export default EditProfileForm;
