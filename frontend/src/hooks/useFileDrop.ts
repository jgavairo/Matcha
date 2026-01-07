import { useState, useCallback } from 'react';

interface UseFileDropOptions {
    onFileSelect: (files: File[]) => void;
    accept?: string; // Regex string or mime type prefix like 'image/'
}

export const useFileDrop = ({ onFileSelect, accept = 'image/' }: UseFileDropOptions) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Only set dragging to false if we're leaving the drop zone itself, 
        // not just entering a child element.
        // However, for simplicity in React, often just setting it false on leave of the container works 
        // if we don't have complex pointer events. 
        // A common issue is flickering when dragging over children.
        // To fix that, we can check if relatedTarget is outside the currentTarget.
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            const validFiles = files.filter(file => !accept || file.type.startsWith(accept));
            
            if (validFiles.length > 0) {
                onFileSelect(validFiles);
            }
        }
    }, [onFileSelect, accept]);

    return {
        isDragging,
        dragHandlers: {
            onDragOver: handleDragOver,
            onDragEnter: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop
        }
    };
};
