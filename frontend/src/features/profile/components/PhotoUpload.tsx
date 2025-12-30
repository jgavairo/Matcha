import React from 'react';
import { HiTrash, HiUpload, HiStar } from 'react-icons/hi';

interface PhotoUploadProps {
    images: string[];
    onUpload: (file: File) => void;
    onDelete: (index: number) => void;
    onSetProfile: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ images, onUpload, onDelete, onSetProfile }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
                <div key={index} className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 ${index === 0 ? 'ring-4 ring-green-500' : ''}`}>
                    <img src={img} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {index !== 0 && (
                            <button
                                onClick={() => onSetProfile(index)}
                                className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors"
                                title="Set as Profile Picture"
                            >
                                <HiStar className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Delete Photo"
                        >
                            <HiTrash className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Profile Picture Indicator */}
                    {index === 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                            Profile Pic
                        </div>
                    )}
                </div>
            ))}
            {images.length < 5 && (
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center text-gray-500">
                        <HiUpload className="w-8 h-8 mb-2" />
                        <span className="text-sm">Upload Photo</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;
