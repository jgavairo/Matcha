import React from 'react';
import { HiLocationMarker, HiStar } from 'react-icons/hi';

interface UserDistanceProps {
    distance?: number;
    className?: string;
}

export const UserDistance: React.FC<UserDistanceProps> = ({ distance, className = "" }) => {
    // Distance is now calculated by backend
    const displayDistance = distance ?? 0;
    const distanceText = displayDistance === 0 ? "Less than 1 km away" : `${displayDistance} km away`;

    return (
        <div className={`flex items-center ${className}`}>
            <HiLocationMarker className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{distanceText}</span>
        </div>
    );
};

interface UserFameProps {
    rating: number;
    className?: string;
}

export const UserFame: React.FC<UserFameProps> = ({ rating, className = "" }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <HiStar className="w-4 h-4 mr-1" />
            <span className="text-sm font-bold">{rating}</span>
        </div>
    );
};
