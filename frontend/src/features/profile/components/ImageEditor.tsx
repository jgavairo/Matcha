import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'flowbite-react';

interface ImageEditorProps {
    file: File | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (editedFile: File) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ file, isOpen, onClose, onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [filter, setFilter] = useState('none');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!isOpen) {
            setRotation(0);
            setScale(1);
            setFilter('none');
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    useEffect(() => {
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                setImage(img);
                // Fit image to canvas initially
                const canvasWidth = 400;
                const canvasHeight = 500;
                const scaleX = canvasWidth / img.width;
                const scaleY = canvasHeight / img.height;
                const initialScale = Math.max(scaleX, scaleY); // Cover
                
                setScale(initialScale);
                setRotation(0);
                setFilter('none');
                setPosition({ x: 0, y: 0 });
            };
        }
    }, [file]);

    useEffect(() => {
        draw();
    }, [image, scale, rotation, filter, position]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background (optional, maybe checkerboard for transparency)
        ctx.fillStyle = '#1f2937'; // dark gray
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();

        // Center of canvas
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Translate to center + pan position
        // We want the pan to be in screen coordinates, so we translate before rotating?
        // No, if we rotate, we rotate around the center of the image.
        // So:
        // 1. Translate to center of canvas
        // 2. Translate by position (pan)
        // 3. Rotate
        // 4. Scale? No, scale is in drawImage dimensions usually, or context scale.
        
        ctx.translate(cx + position.x, cy + position.y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Filter
        // @ts-ignore
        ctx.filter = filter;

        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;

        // Draw centered
        ctx.drawImage(
            image, 
            -scaledWidth / 2, 
            -scaledHeight / 2, 
            scaledWidth, 
            scaledHeight
        );

        ctx.restore();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSaveClick = () => {
        const canvas = canvasRef.current;
        if (!canvas || !file) return;
        
        canvas.toBlob((blob) => {
            if (blob) {
                const newFile = new File([blob], file.name, { type: file.type });
                onSave(newFile);
            }
        }, file.type);
    };

    return (
        <Modal show={isOpen} onClose={onClose} size="xl">
            <ModalHeader>Edit Photo</ModalHeader>
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center bg-gray-900 rounded-lg overflow-hidden">
                        <canvas 
                            ref={canvasRef} 
                            width={400} 
                            height={500} 
                            className="cursor-move touch-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label>Zoom</Label>
                            </div>
                            <input 
                                type="range"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                min={0.1} 
                                max={3} 
                                step={0.1} 
                                value={scale} 
                                onChange={(e) => setScale(parseFloat(e.target.value))} 
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label>Rotation ({rotation}°)</Label>
                            </div>
                            <input 
                                type="range"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                min={0} 
                                max={360} 
                                step={1} 
                                value={rotation} 
                                onChange={(e) => setRotation(parseInt(e.target.value))} 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-2 block">
                                <Label>Filter</Label>
                            </div>
                            <select 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="grayscale(100%)">Grayscale</option>
                                <option value="sepia(100%)">Sepia</option>
                                <option value="contrast(150%)">High Contrast</option>
                                <option value="brightness(120%)">Bright</option>
                                <option value="blur(2px)">Blur</option>
                            </select>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleSaveClick}>Save & Upload</Button>
                <Button color="gray" onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ImageEditor;
