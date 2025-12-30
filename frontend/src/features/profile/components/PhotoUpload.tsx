import React from 'react';
import { HiTrash, HiUpload } from 'react-icons/hi';

interface PhotoUploadProps {
    images: string[];
    onUpload: (file: File) => void;
    onDelete: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ images, onUpload, onDelete }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                        onClick={() => onDelete(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <HiTrash />
                    </button>
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
