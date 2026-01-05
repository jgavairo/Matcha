import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Textarea, TextInput } from 'flowbite-react';
import { useAuth } from '@context/AuthContext';
import { useNotification } from '@context/NotificationContext';
import { api } from '@services/api';
import ImageEditor from '@features/profile/components/ImageEditor';
import { HiUpload, HiX, HiLocationMarker } from 'react-icons/hi';

const AVAILABLE_TAGS = [
  'Travel', 'Music', 'Movies', 'Reading', 'Sports',
  'Cooking', 'Photography', 'Gaming', 'Art', 'Technology'
];

const GENDERS = [
  { id: 'male', label: 'Man' },
  { id: 'female', label: 'Woman' },
  { id: 'other', label: 'Other' }
];

const PREFERENCES = [
  { id: 'male', label: 'Men' },
  { id: 'female', label: 'Women' },
  { id: 'other', label: 'Other' }
];

interface ProfileData {
  gender: string;
  sexualPreferences: string[];
  biography: string;
  tags: string[];
  profileImage: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  geolocationConsent: boolean;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { addToast } = useNotification();
  
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    gender: user?.gender || '',
    sexualPreferences: user?.sexualPreferences || [],
    biography: user?.biography || '',
    tags: user?.tags || [],
    profileImage: user?.images?.[0] || null,
    city: user?.location?.city || '',
    latitude: user?.location?.latitude || null,
    longitude: user?.location?.longitude || null,
    geolocationConsent: user?.geolocationConsent || false
  });

  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const totalSteps = 7;

  const goToStep = (newStep: number) => {
    if (isAnimating) return;
    setDirection(newStep > step ? 'next' : 'prev');
    setIsAnimating(true);
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 300);
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      goToStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      goToStep(step - 1);
    }
  };

  const handleGenderSelect = (gender: string) => {
    setProfileData(prev => ({ ...prev, gender }));
  };

  const handlePreferenceSelect = (pref: string) => {
    setProfileData(prev => ({
      ...prev,
      sexualPreferences: prev.sexualPreferences.includes(pref)
        ? prev.sexualPreferences.filter(p => p !== pref)
        : [...prev.sexualPreferences, pref]
    }));
  };

  const handleTagToggle = (tag: string) => {
    setProfileData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setEditingFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSaveEdited = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/users/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Assuming response.data is the image object with url
      const imageUrl = response.data.url || response.data;
      setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
      setEditingFile(null);
      addToast('Profile picture uploaded successfully', 'success');
    } catch (error) {
      console.error('Failed to upload photo', error);
      addToast('Failed to upload photo', 'error');
    }
  };

  const handleRemovePhoto = () => {
    setProfileData(prev => ({ ...prev, profileImage: null }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`
          );
          const data = await response.json();
          const city = data.city || data.locality || 'Unknown';

          setProfileData(prev => ({
            ...prev,
            latitude,
            longitude,
            city,
            geolocationConsent: true
          }));
          addToast('Localisation récupérée avec succès', 'success');
        } catch (error) {
          console.error('Error getting city name:', error);
          setProfileData(prev => ({
            ...prev,
            latitude,
            longitude,
            city: 'Unknown',
            geolocationConsent: true
          }));
          addToast('Localisation récupérée, mais impossible de déterminer la ville', 'warning');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Impossible d\'obtenir votre localisation. Veuillez renseigner votre ville manuellement.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleCityChange = (city: string) => {
    setProfileData(prev => ({
      ...prev,
      city,
      geolocationConsent: false
    }));
  };

  const handleSubmit = async () => {
    try {
      // Exclude profileImage from the request as it's already uploaded separately
      const { profileImage, ...profileDataToSend } = profileData;
      await api.put('/users/profile', {
        ...profileDataToSend,
        statusId: 2
      });
      await login();
      addToast('Profile completed!', 'success');
      navigate('/');
    } catch (error: any) {
      console.error('Error completing profile:', error);
      addToast(error.response?.data?.error || 'Failed to save profile', 'error');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!profileData.gender;
      case 2: return profileData.sexualPreferences.length > 0;
      case 3: return profileData.biography.length >= 10;
      case 4: return profileData.tags.length >= 1;
      case 5: return !!profileData.profileImage;
      case 6: return !!profileData.city && profileData.city.trim().length > 0;
      default: return true;
    }
  };


  return (
    <div className="flex-1 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 overflow-hidden relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 z-10">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? 'bg-white w-6' : i < step ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Content container */}
      <div className="h-full flex items-center justify-center p-6 pt-16">
        <div 
          className={`w-full max-w-lg transition-all duration-300 ease-out ${
            isAnimating 
              ? direction === 'next' 
                ? 'opacity-0 translate-x-12' 
                : 'opacity-0 -translate-x-12'
              : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4 animate-pulse">Welcome to Matcha!</h1>
              <p className="text-xl text-white/80 mb-8">
                Let's set up your profile in just a few steps
              </p>
            </div>
          )}

          {/* Step 1: Gender */}
          {step === 1 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">I am a...</h1>
              <p className="text-white/70 mb-8">Select your gender</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {GENDERS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleGenderSelect(g.id)}
                    className={`p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-200 ${
                      profileData.gender === g.id
                        ? 'bg-white text-pink-600 shadow-lg scale-105'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <span className="text-xl font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">I'm interested in...</h1>
              <p className="text-white/70 mb-8">Who would you like to meet?</p>
              
              <div className="flex flex-col gap-4 mb-8">
                {PREFERENCES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePreferenceSelect(p.id)}
                    className={`p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-200 ${
                      profileData.sexualPreferences.includes(p.id)
                        ? 'bg-white text-pink-600 shadow-lg scale-105'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <span className="text-xl font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Biography */}
          {step === 3 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
              <p className="text-white/70 mb-8">Write a short bio (min. 10 characters)</p>
              
              <Textarea
                value={profileData.biography}
                onChange={(e) => setProfileData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="I love hiking, cooking, and exploring new places..."
                rows={4}
                className="mb-4 bg-white/20 border-white/30 text-white placeholder-white/50 focus:border-white focus:ring-white rounded-2xl"
              />
              
              <p className="text-white/60 text-sm mb-6">
                {profileData.biography.length}/10 characters minimum
              </p>
            </div>
          )}

          {/* Step 4: Tags */}
          {step === 4 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Your interests</h1>
              <p className="text-white/70 mb-8">Select at least one interest</p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      profileData.tags.includes(tag)
                        ? 'bg-white text-pink-600 shadow-lg scale-105'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Profile Photo */}
          {step === 5 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Your profile photo</h1>
              <p className="text-white/70 mb-8">Add a photo to your profile</p>
              
              {profileData.profileImage ? (
                <div className="mb-8">
                  <div className="relative inline-block">
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    />
                    <button
                      onClick={handleRemovePhoto}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`w-full max-w-md mx-auto aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer relative mb-8 ${
                    isDragging 
                      ? 'border-white bg-white/30' 
                      : 'border-white/50 bg-white/10 hover:bg-white/20'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center text-white text-center p-2">
                    <HiUpload className="w-12 h-12 mb-4" />
                    <span className="text-lg font-medium">Upload Photo</span>
                    <span className="text-sm mt-2 opacity-80">or drag and drop</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Location */}
          {step === 6 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-2">Votre localisation</h1>
              <p className="text-white/70 mb-8">Autorisez la géolocalisation ou renseignez votre ville</p>
              
              <div className="flex flex-col gap-4 mb-8">
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="p-4 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <HiLocationMarker className="w-6 h-6" />
                  <span className="text-xl font-medium">
                    {isGettingLocation ? 'Récupération de votre position...' : 'Autoriser la géolocalisation'}
                  </span>
                </button>

                {locationError && (
                  <p className="text-red-200 text-sm">{locationError}</p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/70">ou</span>
                  </div>
                </div>

                <div>
                  <TextInput
                    type="text"
                    placeholder="Entrez votre ville"
                    value={profileData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder-white/50 focus:border-white focus:ring-white rounded-2xl"
                  />
                </div>

                {profileData.city && (
                  <div className="mt-4 p-4 bg-white/10 rounded-2xl">
                    <p className="text-white/80 text-sm">
                      {profileData.geolocationConsent 
                        ? `Ville détectée : ${profileData.city}` 
                        : `Ville renseignée : ${profileData.city}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      <ImageEditor 
        file={editingFile} 
        isOpen={!!editingFile} 
        onClose={() => setEditingFile(null)} 
        onSave={handleSaveEdited} 
      />

      {/* Navigation buttons */}
      <div className="absolute bottom-8 left-0 right-0 px-6 z-10">
        <div className="max-w-lg mx-auto flex justify-between items-center gap-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`bg-white text-pink-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              step === 0 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            ← Previous
          </button>
          
          {step === totalSteps - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="bg-white text-pink-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Complete ✓
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-white text-pink-600 hover:bg-white/90 px-8 py-3 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    </div>
  );
}
