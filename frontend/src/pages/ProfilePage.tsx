import React, { useState, useEffect } from 'react';
import { Card, Tabs, TabItem, Button } from 'flowbite-react';
import { HiUser, HiPhotograph, HiChartBar, HiBan, HiHeart, HiLockClosed, HiEye } from 'react-icons/hi';
import EditProfileForm from '@features/profile/components/EditProfileForm';
import PhotoUpload from '@features/profile/components/PhotoUpload';
import StatsDisplay from '@features/profile/components/StatsDisplay';
import UserList from '@features/profile/components/UserList';
import ChangePasswordForm from '@features/profile/components/ChangePasswordForm';
import SecuritySettings from '@features/profile/components/SecuritySettings';
import UserProfileModal from '@features/matches/components/UserProfileDrawer';
import { CurrentUser, UserProfile, UserSummary } from '@app-types/user';
import { api } from '@services/api';
import { matchService } from '@features/matches/services/matchService';
import { useNotification } from '@context/NotificationContext';
import { useBlockUser } from '@features/matches/hooks/useBlockUser';
import { resolveImageUrl } from '@utils/userUtils';
import { useSocket } from '@context/SocketContext';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const { addToast } = useNotification();
    const { blockUser } = useBlockUser();
    const { socketService } = useSocket();

    useEffect(() => {
        const handleStatusChange = (data: { userId: number; isOnline: boolean; lastConnection?: string }) => {
            setUser(current => {
                if (!current) return null;

                const updateList = (list: UserSummary[]) => list.map(u => 
                    u.id === data.userId ? { 
                        ...u, 
                        isOnline: data.isOnline, 
                        lastConnection: data.lastConnection 
                    } : u
                );

                return {
                    ...current,
                    matches: updateList(current.matches),
                    likedBy: updateList(current.likedBy),
                    viewedBy: updateList(current.viewedBy),
                    blockedUsers: updateList(current.blockedUsers)
                };
            });
        };

        socketService.on('user_status_change', handleStatusChange);

        return () => {
            socketService.off('user_status_change', handleStatusChange);
        };
    }, [socketService]);

    const handleTabChange = async (tabIndex: number) => {
        if (tabIndex === 3) { // Matches
            // Clear matches before fetching to show loading state or just refresh
            setUser(prev => prev ? { ...prev, matches: [] } : null);
            try {
                const response = await api.get('/users/matches');
                setUser(prev => prev ? { ...prev, matches: response.data } : null);
            } catch (error) {
                addToast("Failed to load matches", 'error');
            }
        } else if (tabIndex === 4) { // Activity
            // Clear activity before fetching
            setUser(prev => prev ? { ...prev, likedBy: [], viewedBy: [] } : null);
            try {
                const [likedByRes, viewedByRes] = await Promise.all([
                    api.get('/users/liked-by'),
                    api.get('/users/viewed-by')
                ]);
                setUser(prev => prev ? { 
                    ...prev, 
                    likedBy: likedByRes.data,
                    viewedBy: viewedByRes.data 
                } : null);
            } catch (error) {
                addToast("Failed to load activity", 'error');
            }
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
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
            addToast("Failed to update profile", 'error');
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!user) return;

        if (file && file.type.startsWith('image/')) {
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
                addToast("Failed to upload photo", 'error');
            }
        } else {
            addToast('Please upload an image file', 'error');
        }
    };

    const handlePhotoDelete = async (index: number) => {
        if (!user) return;
        const urlToDelete = user.images[index];
        const previousImages = [...user.images];

        // Optimistic update
        const newImages = [...user.images];
        newImages.splice(index, 1);
        setUser({ ...user, images: newImages });

        try {
            await api.delete('/users/photos', { data: { url: urlToDelete } });
            addToast("Photo deleted successfully", 'success');
        } catch (error: any) {
            setUser({ ...user, images: previousImages }); // Revert
            const errorMessage = error.response?.data?.error || "Failed to delete photo";
            addToast(errorMessage, 'error');
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
            addToast("Failed to set profile picture", 'error');
        }
    };

    const handleUnblock = async (blockedUser: any) => {
        if (!user) return;
        
        // Optimistic update: remove from list immediately
        const previousBlockedUsers = [...user.blockedUsers];
        setUser(prev => prev ? {
            ...prev,
            blockedUsers: prev.blockedUsers.filter(u => u.id !== blockedUser.id)
        } : null);

        try {
            const response = await api.post('/unblock', { unblockedId: blockedUser.id });
            if (response.status === 200) {
                addToast("User unblocked successfully", 'success');
            } else {
                // Revert on error
                setUser(prev => prev ? { ...prev, blockedUsers: previousBlockedUsers } : null);
                addToast((response as any).response?.data?.error || 'Failed to unblock user', 'error');
            }
        } catch (error) {
            // Revert on error
            setUser(prev => prev ? { ...prev, blockedUsers: previousBlockedUsers } : null);
            addToast((error as any).response?.data?.error || 'Failed to unblock user', 'error');
        }
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
                isOnline: data.is_online,
                lastConnection: data.last_connection ? new Date(data.last_connection).toISOString() : '', // Keep standard format
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
            addToast("Failed to load user profile", 'error');
        }
    };

    const handlePreview = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setSelectedUser(response.data);
        } catch (error) {
            addToast("Failed to load preview", 'error');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen dark:text-white">Loading...</div>;
    if (!user) return <div className="flex justify-center items-center h-screen dark:text-white">Error loading profile</div>;

    const filteredLikedBy = user.likedBy.filter(u => !user.matches.some(m => m.id === u.id));
    const filteredViewedBy = user.viewedBy.filter(u => 
        !user.likedBy.some(l => l.id === u.id) && 
        !user.matches.some(m => m.id === u.id)
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                    <img
                        src={resolveImageUrl(user.images[0]) || "https://via.placeholder.com/150"}
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
                    likesCount={user.likesCount ?? user.likedBy.length}
                    viewsCount={user.viewsCount ?? user.viewedBy.length}
                />

                <Card>
                    <Tabs aria-label="Profile tabs" variant="underline" onActiveTabChange={handleTabChange}>
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
                                    users={filteredLikedBy} 
                                    onUserClick={handleUserClick} 
                                    emptyMessage={user.likedBy.length > 0 ? "Everyone who liked you is a match!" : "No one has liked your profile yet."}
                                />
                                <UserList 
                                    title="Viewed By" 
                                    users={filteredViewedBy} 
                                    onUserClick={handleUserClick} 
                                    emptyMessage={user.viewedBy.length > 0 ? "Everyone who viewed you has liked or matched!" : "No one has viewed your profile yet."}
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
                            addToast("Failed to unlike user", 'error');
                        }
                    }
                }}
                onBlock={async () => {
                    if (selectedUser && selectedUser.id !== user?.id) {
                         await blockUser(selectedUser.id, () => {
                            setSelectedUser({ ...selectedUser, isMatch: false, isLiked: false });
                             setUser(prev => prev ? {
                                ...prev,
                                matches: prev.matches.filter(m => m.id !== selectedUser.id),
                                likedBy: prev.likedBy.filter(u => u.id !== selectedUser.id),
                                viewedBy: prev.viewedBy.filter(u => u.id !== selectedUser.id),
                                blockedUsers: [...prev.blockedUsers, selectedUser]
                            } : null);
                        });
                    }
                }}
                onReport={(reason) => console.log("Report", reason)}
                hideActions={selectedUser?.id === user?.id}
            />
        </div>
    );
};

export default ProfilePage;
