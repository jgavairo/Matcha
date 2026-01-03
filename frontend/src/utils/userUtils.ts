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
