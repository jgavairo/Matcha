import React, { useState } from 'react';
import { Card, Tabs, TabItem } from 'flowbite-react';
import { HiUser, HiPhotograph, HiChartBar, HiBan } from 'react-icons/hi';
import EditProfileForm from '../features/profile/components/EditProfileForm';
import PhotoUpload from '../features/profile/components/PhotoUpload';
import StatsDisplay from '../features/profile/components/StatsDisplay';
import UserList from '../features/profile/components/UserList';
import { CurrentUser } from '@app-types/user';

// Mock data - replace with actual data fetching
const mockCurrentUser: CurrentUser = {
    id: 1,
    username: "jdoe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    age: 28,
    gender: "male",
    sexualPreferences: "hetero",
    biography: "Lover of coffee and code.",
    tags: ["geek", "coffee", "coding"],
    images: ["https://i.pravatar.cc/300?img=11", "https://i.pravatar.cc/300?img=12"],
    fameRating: 450,
    distance: 0,
    location: { city: "Paris", latitude: 48.8566, longitude: 2.3522 },
    isOnline: true,
    lastConnection: "Now",
    hasLikedYou: false,
    isMatch: false,
    likedBy: [
        { id: 2, username: "jane", age: 25, gender: "female", biography: "Hi", distance: 5, tags: [], images: ["https://i.pravatar.cc/300?img=5"], fameRating: 100 }
    ],
    viewedBy: [
        { id: 3, username: "bob", age: 30, gender: "male", biography: "Hello", distance: 10, tags: [], images: ["https://i.pravatar.cc/300?img=3"], fameRating: 50 }
    ],
    blockedUsers: []
};

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<CurrentUser>(mockCurrentUser);

    const handleProfileUpdate = (data: Partial<CurrentUser>) => {
        setUser({ ...user, ...data });
        // TODO: API call to update profile
    };

    const handlePhotoUpload = (file: File) => {
        // TODO: Handle file upload
        const newUrl = URL.createObjectURL(file);
        setUser({ ...user, images: [...user.images, newUrl] });
    };

    const handlePhotoDelete = (index: number) => {
        const newImages = [...user.images];
        newImages.splice(index, 1);
        setUser({ ...user, images: newImages });
    };

    const handleUnblock = (blockedUser: any) => {
        // TODO: Unblock user
        console.log("Unblock", blockedUser);
    };

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
                                <h3 className="text-lg font-semibold">Manage Photos</h3>
                                <p className="text-sm text-gray-500">Add up to 5 photos to your profile.</p>
                                <PhotoUpload
                                    images={user.images}
                                    onUpload={handlePhotoUpload}
                                    onDelete={handlePhotoDelete}
                                />
                            </div>
                        </TabItem>

                        <TabItem title="Activity" icon={HiChartBar}>
                            <div className="space-y-8">
                                <UserList title="Liked By" users={user.likedBy} />
                                <UserList title="Viewed By" users={user.viewedBy} />
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
        </div>
    );
};

export default ProfilePage;
