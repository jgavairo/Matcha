import React, { useState, useEffect } from 'react';
import { Card, Tabs, TabItem } from 'flowbite-react';
import { HiUser, HiPhotograph, HiChartBar, HiBan, HiHeart } from 'react-icons/hi';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import PhotoUpload from '../features/profile/components/PhotoUpload';
import StatsDisplay from '../features/profile/components/StatsDisplay';
import UserList from '../features/profile/components/UserList';
import UserProfileModal from '../features/matches/components/UserProfileDrawer';
import { CurrentUser, UserProfile, UserSummary } from '@app-types/user';
import { mockUsers } from '../data/mockUsers';
import { api } from '../services/api';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = (data: Partial<CurrentUser>) => {
        if (!user) return;
        setUser({ ...user, ...data });
        // TODO: API call to update profile
    };

    const handlePhotoUpload = (file: File) => {
        if (!user) return;
        // TODO: Handle file upload
        const newUrl = URL.createObjectURL(file);
        setUser({ ...user, images: [...user.images, newUrl] });
    };

    const handlePhotoDelete = (index: number) => {
        if (!user) return;
        const newImages = [...user.images];
        newImages.splice(index, 1);
        setUser({ ...user, images: newImages });
    };

    const handleSetProfilePic = (index: number) => {
        if (!user) return;
        if (index === 0) return;
        const newImages = [...user.images];
        const [selectedImage] = newImages.splice(index, 1);
        newImages.unshift(selectedImage);
        setUser({ ...user, images: newImages });
    };

    const handleUnblock = (blockedUser: any) => {
        // TODO: Unblock user
        console.log("Unblock", blockedUser);
    };

    const handleUserClick = (summary: UserSummary) => {
        // In a real app, we would fetch the full profile here
        // For now, we'll find the user in our mock data or mock the missing fields
        const foundUser = mockUsers.find(u => u.id === summary.id);

        const fullProfile: UserProfile = foundUser || {
            ...summary,
            firstName: "Unknown",
            lastName: "User",
            sexualPreferences: "bi",
            isOnline: false,
            lastConnection: "Recently",
            hasLikedYou: true,
            isMatch: false
        };
        setSelectedUser(fullProfile);
        setIsModalOpen(true);
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
                            <EditProfileForm user={user} onSubmit={handleProfileUpdate} />
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

                        <TabItem title="Matches" icon={HiHeart}>
                            <UserList title="My Matches" users={user.matches} onUserClick={handleUserClick} />
                        </TabItem>

                        <TabItem title="Activity" icon={HiChartBar}>
                            <div className="space-y-8">
                                <UserList title="Liked By" users={user.likedBy} onUserClick={handleUserClick} />
                                <UserList title="Viewed By" users={user.viewedBy} onUserClick={handleUserClick} />
                            </div>
                        </TabItem>

                        <TabItem title="Blocked" icon={HiBan}>
                            <UserList
                                title="Blocked Users"
                                users={user.blockedUsers}
                                actionLabel="Unblock"
                                onAction={handleUnblock}
                            />
                            {user.blockedUsers.length === 0 && (
                                <p className="text-gray-500">You haven't blocked anyone yet.</p>
                            )}
                        </TabItem>
                    </Tabs>
                </Card>
            </div>

            <UserProfileModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLike={() => console.log("Like")}
                onDislike={() => console.log("Dislike")}
                onBlock={() => console.log("Block")}
                onReport={(reason) => console.log("Report", reason)}
            />
        </div>
    );
};

export default ProfilePage;
