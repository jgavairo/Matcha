import React from 'react';
import { Card } from 'flowbite-react';
import { HiEye, HiHeart, HiStar } from 'react-icons/hi';

interface StatsDisplayProps {
    fameRating: number;
    likesCount: number;
    viewsCount: number;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ fameRating, likesCount, viewsCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-full">
                        <HiStar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fame Rating</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{fameRating}</h3>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 rounded-full">
                        <HiHeart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Liked By</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{likesCount}</h3>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                        <HiEye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Viewed By</p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewsCount}</h3>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StatsDisplay;
