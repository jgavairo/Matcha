import React, { useState, useEffect } from 'react';
import { Card, Tabs, TabItem, Button } from 'flowbite-react';
import { HiUser, HiPhotograph, HiChartBar, HiBan, HiHeart, HiLockClosed, HiEye } from 'react-icons/hi';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import PhotoUpload from '../features/profile/components/PhotoUpload';
import StatsDisplay from '../features/profile/components/StatsDisplay';
import UserList from '../features/profile/components/UserList';
import ChangePasswordForm from '../features/profile/components/ChangePasswordForm';
import SecuritySettings from '../features/profile/components/SecuritySettings';
import UserProfileModal from '../features/matches/components/UserProfileDrawer';
import { CurrentUser, UserProfile, UserSummary } from '@app-types/user';
import { mockUsers } from '../data/mockUsers';
import { api } from '../services/api';
import { matchService } from '../features/matches/services/matchService';
import { useNotification } from '../context/NotificationContext';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const { addToast } = useNotification();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                addToast("Failed to load profile", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [addToast]);

    const handleProfileUpdate = async (data: Partial<CurrentUser>) => {
        if (!user) return;
        try {
            await api.put('/users/profile', data);
            setUser({ ...user, ...data });
            addToast("Profile updated successfully", 'success');
        } catch (error) {
            console.error("Failed to update profile", error);
            addToast("Failed to update profile", 'error');
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!user) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post('/users/photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Assuming response.data is the image object with url
            setUser({ ...user, images: [...user.images, response.data.url] });
            addToast("Photo uploaded successfully", 'success');
        } catch (error) {
            console.error("Failed to upload photo", error);
            addToast("Failed to upload photo", 'error');
        }
    };

    const handlePhotoDelete = async (index: number) => {
        if (!user) return;
        const urlToDelete = user.images[index];
        try {
            await api.delete('/users/photos', { data: { url: urlToDelete } });
            const newImages = [...user.images];
            newImages.splice(index, 1);
            setUser({ ...user, images: newImages });
            addToast("Photo deleted successfully", 'success');
        } catch (error) {
            console.error("Failed to delete photo", error);
            addToast("Failed to delete photo", 'error');
        }
    };

    const handleSetProfilePic = async (index: number) => {
        if (!user) return;
        if (index === 0) return;
        const urlToSet = user.images[index];
        try {
            await api.put('/users/photos/profile', { url: urlToSet });
            const newImages = [...user.images];
            const [selectedImage] = newImages.splice(index, 1);
            newImages.unshift(selectedImage);
            setUser({ ...user, images: newImages });
            addToast("Profile picture updated", 'success');
        } catch (error) {
            console.error("Failed to set profile picture", error);
            addToast("Failed to set profile picture", 'error');
        }
    };

    const handleUnblock = (blockedUser: any) => {
        // TODO: Unblock user
        console.log("Unblock", blockedUser);
    };

    const handleUserClick = async (summary: UserSummary) => {
        try {
            // Fetch full profile from API
            const response = await api.get(`/users/${summary.id}`);
            const data = response.data;
            
            // Transform API data to match UserProfile interface
            const fullProfile: UserProfile = {
                id: data.id,
                username: data.username,
                firstName: data.first_name,
                lastName: data.last_name,
                age: data.age,
                gender: data.gender,
                biography: data.biography || '',
                tags: data.tags || [],
                fameRating: data.fame_rating || 0,
                distance: summary.distance || 0,
                isOnline: false, // Placeholder
                lastConnection: new Date().toISOString(), // Placeholder
                images: data.images || [],
                location: {
                    city: data.city || '',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0
                },
                sexualPreferences: data.sexual_preferences || [],
                birthDate: data.birth_date,
                hasLikedYou: data.has_liked_you || false,
                isLiked: data.is_liked || false,
                isMatch: data.is_match || false
            };

            setSelectedUser(fullProfile);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            addToast("Failed to load user profile", 'error');
        }
    };

    const handlePreview = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setSelectedUser(response.data);
        } catch (error) {
            console.error("Failed to fetch profile for preview", error);
            addToast("Failed to load preview", 'error');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>;
    if (!user) return <div className="flex justify-center items-center h-screen dark:text-white">Error loading profile</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                    <img
                        src={user.images[0] || "https://via.placeholder.com/150"}
                        alt={user.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h1>
                    <p className="text-gray-500">@{user.username}</p>
                </div>
                <div className="ml-auto">
                    <Button color="light" onClick={handlePreview}>
                        <HiEye className="mr-2 h-5 w-5" />
                        Preview
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Stats Overview */}
                <StatsDisplay
                    fameRating={user.fameRating}
                    likesCount={user.likedBy.length}
                    viewsCount={user.viewedBy.length}
                />

                <Card>
                    <Tabs aria-label="Profile tabs" variant="underline">
                        <TabItem active title="Edit Profile" icon={HiUser}>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold dark:text-white">Personal Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal details and interests.</p>
                                <EditProfileForm user={user} onSubmit={handleProfileUpdate} />
                            </div>
                        </TabItem>

                        <TabItem title="Photos" icon={HiPhotograph}>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold dark:text-white">Manage Photos</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add up to 5 photos to your profile.</p>
                                <PhotoUpload
                                    images={user.images}
                                    onUpload={handlePhotoUpload}
                                    onDelete={handlePhotoDelete}
                                    onSetProfile={handleSetProfilePic}
                                />
                            </div>
                        </TabItem>

                        <TabItem title="Security" icon={HiLockClosed}>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold dark:text-white">Change Password</h3>
                                <ChangePasswordForm />
                                <SecuritySettings 
                                    consent={user.geolocationConsent} 
                                    onConsentChange={(newConsent) => setUser({ ...user, geolocationConsent: newConsent })} 
                                />
                            </div>
                        </TabItem>

                        <TabItem title="Matches" icon={HiHeart}>
                            <UserList 
                                title="My Matches" 
                                users={user.matches} 
                                onUserClick={handleUserClick} 
                                emptyMessage="You haven't matched with anyone yet. Go discover some people!"
                            />
                        </TabItem>

                        <TabItem title="Activity" icon={HiChartBar}>
                            <div className="space-y-8">
                                <UserList 
                                    title="Liked By" 
                                    users={user.likedBy} 
                                    onUserClick={handleUserClick} 
                                    emptyMessage="No one has liked your profile yet."
                                />
                                <UserList 
                                    title="Viewed By" 
                                    users={user.viewedBy} 
                                    onUserClick={handleUserClick} 
                                    emptyMessage="No one has viewed your profile yet."
                                />
                            </div>
                        </TabItem>

                        <TabItem title="Blocked" icon={HiBan}>
                            <UserList
                                title="Blocked Users"
                                users={user.blockedUsers}
                                actionLabel="Unblock"
                                onAction={handleUnblock}
                                emptyMessage="You haven't blocked anyone yet."
                            />
                        </TabItem>
                    </Tabs>
                </Card>
            </div>

            <UserProfileModal
                user={selectedUser?.id === user?.id ? user : selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onLike={async () => {
                    if (selectedUser && selectedUser.id !== user?.id) {
                        try {
                            const result = await matchService.likeUser(selectedUser.id);
                            setSelectedUser({ ...selectedUser, isLiked: true, isMatch: result.isMatch });
                            addToast("User liked", 'success');
                        } catch (error) {
                            console.error("Failed to like user", error);
                            addToast("Failed to like user", 'error');
                        }
                    }
                }}
                onDislike={async () => {
                    if (selectedUser && selectedUser.id !== user?.id) {
                        try {
                            await matchService.dislikeUser(selectedUser.id);
                            setSelectedUser(null); // Close modal on pass
                            addToast("User passed", 'success');
                        } catch (error) {
                            console.error("Failed to dislike user", error);
                            addToast("Failed to dislike user", 'error');
                        }
                    }
                }}
                onUnlike={async () => {
                    if (selectedUser && selectedUser.id !== user?.id) {
                        try {
                            await matchService.unlikeUser(selectedUser.id);
                            setSelectedUser({ ...selectedUser, isLiked: false, isMatch: false });
                            addToast("User unliked", 'success');
                        } catch (error) {
                            console.error("Failed to unlike user", error);
                            addToast("Failed to unlike user", 'error');
                        }
                    }
                }}
                onBlock={() => console.log("Block")}
                onReport={(reason) => console.log("Report", reason)}
                hideActions={selectedUser?.id === user?.id}
            />
        </div>
    );
};

export default ProfilePage;
