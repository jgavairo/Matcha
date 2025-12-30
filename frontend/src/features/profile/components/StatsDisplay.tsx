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
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <HiStar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fame Rating</p>
                        <h3 className="text-xl font-bold">{fameRating}</h3>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pink-100 text-pink-600 rounded-full">
                        <HiHeart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Liked By</p>
                        <h3 className="text-xl font-bold">{likesCount}</h3>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <HiEye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Viewed By</p>
                        <h3 className="text-xl font-bold">{viewsCount}</h3>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StatsDisplay;
