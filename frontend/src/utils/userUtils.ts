export const getSexualOrientationLabel = (gender: string, preferences: string[]): string => {
  if (!preferences || preferences.length === 0) return 'Unknown';

  const prefs = preferences.map(p => p.toLowerCase());
  const userGender = gender.toLowerCase();

  const likesMale = prefs.includes('male');
  const likesFemale = prefs.includes('female');
  const likesOther = prefs.includes('other');

  // Pansexual: likes everyone
  if (likesMale && likesFemale && likesOther) return 'Pansexual';
  
  // Bisexual: likes any 2 genders
  const prefsCount = (likesMale ? 1 : 0) + (likesFemale ? 1 : 0) + (likesOther ? 1 : 0);
  if (prefsCount === 2) return 'Bisexual';

  if (userGender === 'male') {
    if (likesMale && !likesFemale && !likesOther) return 'Gay';
    if (!likesMale && likesFemale && !likesOther) return 'Heterosexual';
  } 
  
  if (userGender === 'female') {
    if (!likesMale && likesFemale && !likesOther) return 'Lesbian';
    if (likesMale && !likesFemale && !likesOther) return 'Heterosexual';
  }

  // Fallback: just list the preferences capitalized
  return prefs.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};
