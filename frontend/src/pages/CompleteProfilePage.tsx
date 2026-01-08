import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Textarea, TextInput } from 'flowbite-react';
import { useAuth } from '@context/AuthContext';
import { useNotification } from '@context/NotificationContext';
import { api } from '@services/api';
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

  const nextStep = () => step < totalSteps - 1 && goToStep(step + 1);
  const prevStep = () => step > 0 && goToStep(step - 1);

  const handleGenderSelect = (gender: string) => setProfileData(prev => ({ ...prev, gender }));

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
        addToast('Photo de profil uploadée avec succès', 'success');
      } catch (error) {
        addToast('Échec de l\'upload de la photo', 'error');
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Localisation not supported by your browser');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=fr`);
          const data = await response.json();
          setProfileData(prev => ({ ...prev, latitude, longitude, city: data.city || data.locality || 'Unknown', geolocationConsent: true }));
          addToast('Location retrieved successfully', 'success');
        } catch (error) {
          setProfileData(prev => ({ ...prev, latitude, longitude, city: 'Unknown', geolocationConsent: true }));
        } finally { setIsGettingLocation(false); }
      },
      () => {
        setLocationError('Unable to retrieve location. Please enter manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async () => {
    try {
      const { profileImage, ...profileDataToSend } = profileData;
      await api.put('/users/profile/complete', profileDataToSend);
      await login();
      addToast('Profile completed!', 'success');
      navigate('/');
    } catch (error: any) {
      addToast('Failed to save profile', 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600 flex flex-col relative">
      {/* Progress bar - Sticky top */}
      <div className="sticky top-0 left-0 right-0 h-1.5 bg-white/20 z-30">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out"
          style={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-32">
        {/* Step dots */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-white w-8' : 'bg-white/30 w-4'}`} />
          ))}
        </div>

        <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-white text-center py-10">
              <h1 className="text-4xl font-extrabold mb-4">Welcome to Matcha!</h1>
              <p className="text-lg text-white/90">Let's set up your profile in just a few steps to find your best matches.</p>
            </div>
          )}

          {/* Step 1: Gender */}
          {step === 1 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">I am a...</h1>
              <div className="grid gap-4">
                {GENDERS.map(g => (
                  <button key={g.id} onClick={() => handleGenderSelect(g.id)} className={`p-5 rounded-2xl text-left font-semibold text-lg transition-all ${profileData.gender === g.id ? 'bg-white text-pink-600 shadow-xl' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">I'm interested in...</h1>
              <div className="grid gap-4">
                {PREFERENCES.map(p => (
                  <button key={p.id} onClick={() => handlePreferenceSelect(p.id)} className={`p-5 rounded-2xl text-left font-semibold text-lg transition-all ${profileData.sexualPreferences.includes(p.id) ? 'bg-white text-pink-600 shadow-xl' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Biography */}
          {step === 3 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2 text-center">About me</h1>
              <p className="text-white/80 text-center mb-6 text-sm">Min. 10 characters to express yourself</p>
              <Textarea
                value={profileData.biography}
                onChange={(e) => setProfileData(prev => ({ ...prev, biography: e.target.value }))}
                placeholder="Share your passions, your vibe..."
                rows={5}
                className="w-full bg-white text-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-white/50 p-4"
              />
              <p className="mt-2 text-right text-xs opacity-70">{profileData.biography.length} characters</p>
            </div>
          )}

          {/* Step 4: Tags */}
          {step === 4 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-6">Interests</h1>
              <div className="flex flex-wrap justify-center gap-3">
                {AVAILABLE_TAGS.map(tag => (
                  <button key={tag} onClick={() => handleTagToggle(tag)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${profileData.tags.includes(tag) ? 'bg-white text-pink-600' : 'bg-white/10 border border-white/30'}`}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Photo */}
          {step === 5 && (
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-6">Profile Photo</h1>
              {profileData.profileImage ? (
                <div className="relative inline-block group">
                  <img src={profileData.profileImage} alt="Profile" className="w-48 h-48 md:w-64 md:h-64 rounded-3xl object-cover border-4 border-white shadow-2xl" />
                  <button onClick={() => setProfileData(prev => ({...prev, profileImage: null}))} className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div 
                  className={`w-full aspect-square max-h-[320px] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer relative ${isDragging ? 'bg-white/30 border-white scale-105' : 'bg-white/10 border-white/40'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]); }}
                >
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                  <HiUpload className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-bold">Click or drag photo</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Location */}
          {step === 6 && (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-6 text-center">Where are you?</h1>
              <button onClick={getCurrentLocation} disabled={isGettingLocation} className="w-full p-4 mb-6 rounded-2xl bg-white text-pink-600 font-bold flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors disabled:opacity-50">
                <HiLocationMarker className="w-5 h-5" />
                {isGettingLocation ? 'Finding you...' : 'Use My Current Location'}
              </button>
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/30"></div>
                <span className="px-4 text-sm opacity-60 uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/30"></div>
              </div>
              <TextInput
                placeholder="Enter your city manually"
                value={profileData.city}
                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value, geolocationConsent: false }))}
                className="rounded-2xl"
              />
            </div>
          )}
        </div>
      </main>

      {/* Navigation - Fixed Bottom */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-rose-700 via-rose-600/90 to-transparent z-20">
        <div className="max-w-md mx-auto flex gap-4">
          {step > 0 && (
            <button onClick={prevStep} className="flex-1 py-4 px-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
              Back
            </button>
          )}
          <button
            onClick={step === totalSteps - 1 ? handleSubmit : nextStep}
            disabled={!canProceed()}
            className={`py-4 px-10 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              canProceed() 
                ? 'bg-white text-pink-600 scale-100 hover:scale-[1.02]' 
                : 'bg-white/50 text-white/50 cursor-not-allowed'
            } ${step === 0 ? 'w-full' : 'flex-[2]'}`}
          >
            {step === 0 ? "Let's Start" : step === totalSteps - 1 ? "Finish ✓" : "Continue"}
          </button>
        </div>
      </footer>
    </div>
  );
}