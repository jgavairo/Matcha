import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textarea, TextInput } from 'flowbite-react';
import { useAuth } from '@context/AuthContext';
import { useNotification } from '@context/NotificationContext';
import { api } from '@services/api';
import { HiUpload, HiX, HiLocationMarker } from 'react-icons/hi';
import { resolveImageUrl } from '@utils/userUtils';

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

  const [isDragging, setIsDragging] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isValidatingCity, setIsValidatingCity] = useState(false);

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

  const nextStep = () => step < totalSteps - 1 && goToStep(step + 1);
  const prevStep = () => step > 0 && goToStep(step - 1);

  // --- LOGIQUE DE VALIDATION DE LA VILLE ---
  const validateAndSetCity = async (cityName: string) => {
    if (!cityName.trim()) return;
    
    setIsValidatingCity(true);
    setLocationError(null);
    
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const cleanCityName = display_name.split(',')[0];
        
        setProfileData(prev => ({
          ...prev,
          city: cleanCityName,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          geolocationConsent: false
        }));
      } else {
        setLocationError("City not found");
        setProfileData(prev => ({ ...prev, latitude: null, longitude: null }));
      }
    } catch (error) {
      setLocationError("Error validating city");
    } finally {
      setIsValidatingCity(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await api.post('/users/photos', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const imageUrl = response.data.url || response.data;
        setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
        addToast("Photo uploaded successfully", 'success');
      } catch (error) {
        addToast('Failed to upload photo', 'error');
      }
    } else {
      addToast('Please upload an image file', 'error');
    }
  };

  const handlePhotoDelete = async () => {
    if (!profileData.profileImage) return;
    
    const urlToDelete = profileData.profileImage;
    const previousImage = profileData.profileImage;

    // Optimistic update
    setProfileData(prev => ({ ...prev, profileImage: null }));

    try {
      await api.delete('/users/photos/complete', { data: { url: urlToDelete } });
    } catch (error: any) {
      setProfileData(prev => ({ ...prev, profileImage: previousImage }));
      const errorMessage = error.response?.data?.error || "Échec de la suppression de la photo";
      addToast(errorMessage, 'error');
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`);
          const data = await res.json();
          setProfileData(prev => ({ ...prev, latitude, longitude, city: data.city || data.locality || 'Unknown', geolocationConsent: true }));
          setLocationError(null);
        } catch (e) {
          setProfileData(prev => ({ ...prev, latitude, longitude, city: 'Unknown', geolocationConsent: true }));
        } finally { setIsGettingLocation(false); }
      },
      () => { setLocationError('Access denied. Enter your city.'); setIsGettingLocation(false); }
    );
  };

  const handleSubmit = async () => {
    try {
      const { profileImage, ...profileDataToSend } = profileData;
      await api.put('/users/profile/complete', profileDataToSend);
      await login();
      addToast('Profile completed!', 'success');
      navigate('/');
    } catch (error) {
      addToast('Error saving profile', 'error');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!profileData.gender;
      case 2: return profileData.sexualPreferences.length > 0;
      case 3: return profileData.biography.length >= 10;
      case 4: return profileData.tags.length >= 1;
      case 5: return !!profileData.profileImage;
      case 6: return !!profileData.city && profileData.latitude !== null && !isValidatingCity;
      default: return true;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 flex flex-col relative overflow-y-auto">
      {/* Barre de progression fixe */}
      <div className="sticky top-0 left-0 right-0 h-1.5 bg-white/20 z-30">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* Zone de contenu principale */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-36">
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-white w-8' : 'bg-white/30 w-4'}`} />
          ))}
        </div>

        <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {step === 0 && (
            <div className="text-white text-center py-10">
              <h1 className="text-4xl font-extrabold mb-4">Welcome to Matcha!</h1>
              <p className="text-lg text-white/90">Let's set up your profile to find your best matches.</p>
            </div>
          )}

          {step === 1 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">I am a...</h1>
              <div className="grid gap-4">
                {GENDERS.map(g => (
                  <button key={g.id} onClick={() => setProfileData(prev => ({...prev, gender: g.id}))} className={`p-5 rounded-2xl text-left font-semibold text-lg transition-all ${profileData.gender === g.id ? 'bg-white text-pink-600 shadow-xl scale-[1.02]' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">I'm interested in...</h1>
              <div className="grid gap-4">
                {PREFERENCES.map(p => (
                  <button key={p.id} onClick={() => {
                    const current = profileData.sexualPreferences;
                    setProfileData(prev => ({
                      ...prev,
                      sexualPreferences: current.includes(p.id) ? current.filter(x => x !== p.id) : [...current, p.id]
                    }));
                  }} className={`p-5 rounded-2xl text-left font-semibold text-lg transition-all ${profileData.sexualPreferences.includes(p.id) ? 'bg-white text-pink-600 shadow-xl scale-[1.02]' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2 text-center">About me</h1>
              <p className="text-white/80 text-center mb-6 text-sm">Min. 10 characters</p>
              <Textarea
                value={profileData.biography}
                onChange={(e) => setProfileData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="I like to cook, travel and read books..."
                rows={5}
                className="w-full bg-white text-gray-900 rounded-2xl p-4 border-none focus:ring-4 focus:ring-white/50"
              />
            </div>
          )}

          {step === 4 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-6">Interests</h1>
              <div className="flex flex-wrap justify-center gap-3">
                {AVAILABLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => {
                    const tags = profileData.tags;
                    setProfileData(prev => ({ ...prev, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] }));
                  }} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${profileData.tags.includes(tag) ? 'bg-white text-pink-600' : 'bg-white/10 border border-white/30'}`}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-6">Profile Photo</h1>
              {profileData.profileImage ? (
                <div className="relative inline-block group">
                  <img src={resolveImageUrl(profileData.profileImage)} alt="Profile" className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover border-4 border-white shadow-2xl" />
                  <button onClick={handlePhotoDelete} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 p-2 rounded-full shadow-lg transition-colors">
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div 
                  className={`w-full aspect-square max-h-[280px] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative ${isDragging ? 'bg-white/30 border-white scale-105' : 'bg-white/10 border-white/40'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <HiUpload className="w-12 h-12 mb-2 opacity-50" />
                  <p className="font-bold">Click or drag photo</p>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">Where are you?</h1>
              <p className="text-white/80 text-center mb-4 text-sm px-2">
                By using your location, you explicitly consent to share your geolocation data with Matcha to find people near you.
              </p>
              <button onClick={getCurrentLocation} disabled={isGettingLocation || isValidatingCity} className="w-full p-4 mb-6 rounded-2xl bg-white text-pink-600 font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                <HiLocationMarker className="w-5 h-5" />
                {isGettingLocation ? 'Finding you...' : 'Use My Current Location'}
              </button>
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/30"></div>
                <span className="px-4 text-sm opacity-60 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/30"></div>
              </div>
              <div className="relative">
              <p className="text-white/60 text-center mt-2 mb-2 text-xs px-2">
                By manually entering your city, you agree that your approximate location will be used for matchmaking.
              </p>
                <TextInput
                  placeholder="Enter your city (e.g. Paris)"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  onBlur={(e) => validateAndSetCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && validateAndSetCity(profileData.city)}
                  color={locationError ? "failure" : "gray"}
                />
                {isValidatingCity && <div className="absolute right-3 top-3 animate-spin h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full" />}
              </div>
              {locationError && <p className="mt-2 text-red-200 text-sm font-medium">{locationError}</p>}
              {profileData.latitude && !locationError && <p className="mt-2 text-center text-xs text-green-200">✓ City verified</p>}
            </div>
          )}
        </div>
      </main>

      {/* Navigation fixe en bas */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-rose-700 via-rose-600/90 to-transparent z-40">
        <div className="max-w-md mx-auto flex gap-4">
          {step > 0 && (
            <button onClick={prevStep} className="flex-1 py-4 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold transition-all">
              Back
            </button>
          )}
          <button
            onClick={step === totalSteps - 1 ? handleSubmit : nextStep}
            disabled={!canProceed()}
            className={`py-4 px-10 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              canProceed() ? 'bg-white text-pink-600 scale-100' : 'bg-white/50 text-white/50 cursor-not-allowed'
            } ${step === 0 ? 'w-full' : 'flex-[2]'}`}
          >
            {step === 0 ? "Let's Start" : step === totalSteps - 1 ? "Finish ✓" : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}