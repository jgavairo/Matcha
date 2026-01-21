import React, { useState, useRef } from 'react';
import { HiTrash, HiUpload, HiStar } from 'react-icons/hi';
import ImageEditor from './ImageEditor';
import { useNotification } from '@context/NotificationContext';
import { PHOTOS_MIN } from '@shared/validation';
import { resolveImageUrl } from '@utils/userUtils';

interface PhotoUploadProps {
    images: string[];
    onUpload: (file: File) => void;
    onDelete: (index: number) => void;
    onSetProfile: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ images, onUpload, onDelete, onSetProfile }) => {
    const [editingFile, setEditingFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { addToast } = useNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) {
            addToast('Please select a valid image file', 'error');
            resetFileInput();
            return;
        }

        // Valider que c'est bien une vraie image en essayant de la charger
        try {
            // Check valid MIME types
            const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validMimeTypes.includes(file.type.toLowerCase())) {
                addToast('Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed.', 'error');
                resetFileInput();
                return;
            }

            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Image loading timeout'));
                }, 5000); // 5 secondes timeout

                img.onload = () => {
                    clearTimeout(timeout);
                    URL.revokeObjectURL(objectUrl);
                    // Check that image has valid and reasonable dimensions
                    if (img.width > 0 && img.height > 0 && img.width <= 10000 && img.height <= 10000) {
                        // Check that image was actually loaded (not just a placeholder)
                        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                            resolve(true);
                        } else {
                            reject(new Error('Image failed to load completely'));
                        }
                    } else {
                        reject(new Error('Invalid image dimensions'));
                    }
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Failed to load image - file may be corrupted or not a valid image'));
                };
                img.src = objectUrl;
            });

            // Si on arrive ici, l'image est valide
            setEditingFile(file);
        } catch (error) {
            addToast('Invalid image file. Please select a valid image file (JPEG, PNG, GIF, or WebP).', 'error');
            resetFileInput();
        }
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleSaveEdited = (file: File) => {
        onUpload(file);
        setEditingFile(null);
        resetFileInput();
    };

    const handleEditorClose = () => {
        setEditingFile(null);
        resetFileInput();
    };

    const handleDelete = (index: number) => {
        if (images.length <= PHOTOS_MIN) {
            addToast(`You must have at least ${PHOTOS_MIN} photo(s)`, 'error');
            return;
        }
        onDelete(index);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                    <div key={index} className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ${index === 0 ? 'ring-4 ring-green-500' : ''}`}>
                        <img src={resolveImageUrl(img)} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />

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
                                onClick={() => handleDelete(index)}
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
                    <div 
                        className={`aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer relative
                            ${isDragging 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 text-center p-2">
                            <HiUpload className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Upload Photo</span>
                            <span className="text-xs mt-1">or drag and drop</span>
                        </div>
                    </div>
                )}
            </div>

            <ImageEditor 
                file={editingFile} 
                isOpen={!!editingFile} 
                onClose={handleEditorClose} 
                onSave={handleSaveEdited} 
            />
        </>
    );
};

export default PhotoUpload;