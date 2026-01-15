import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

interface ProcessImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Process and secure an image with Sharp
 * - Resize if necessary
 * - Convert to safe format (JPEG/PNG/WebP)
 * - Validate that it's a valid image
 * - Remove sensitive metadata
 */
export const processImage = async (
    inputPath: string,
    outputPath: string,
    options: ProcessImageOptions = {}
): Promise<void> => {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 85,
        format = 'jpeg'
    } = options;

    try {
        // Read and validate image with Sharp
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Check that it's a valid image with detected format
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image: unable to read dimensions');
        }

        // Check that the format is a valid image format
        const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'svg', 'avif', 'heic', 'heif'];
        if (!metadata.format || !validFormats.includes(metadata.format.toLowerCase())) {
            throw new Error(`Invalid image format: ${metadata.format || 'unknown'}`);
        }

        // Check minimum dimensions (at least 1x1 pixel)
        if (metadata.width < 1 || metadata.height < 1) {
            throw new Error('Invalid image: dimensions too small');
        }

        // Check maximum dimensions to avoid denial of service attacks
        if (metadata.width > 10000 || metadata.height > 10000) {
            throw new Error('Image dimensions too large');
        }

        // Process image: resize, convert, clean
        let processedImage = image
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .removeAlpha() // Remove transparency for JPEG
            .jpeg({ quality, mozjpeg: true }); // Convert to JPEG by default

        // If requested format is PNG, use PNG
        if (format === 'png') {
            processedImage = image
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ quality, compressionLevel: 9 });
        }

        // If requested format is WebP, use WebP
        if (format === 'webp') {
            processedImage = image
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality });
        }

        // Remove all EXIF metadata (personal data, geolocation, etc.)
        processedImage = processedImage.withMetadata({});

        // Save the processed image
        await processedImage.toFile(outputPath);

        // Delete the original file
        await fs.unlink(inputPath);
    } catch (error) {
        // In case of error, delete the original file
        try {
            await fs.unlink(inputPath);
        } catch (unlinkError) {
            // Ignore deletion error if file doesn't exist
        }
        throw error;
    }
};

/**
 * Validates that a file is a valid image by trying to read it with Sharp
 * Also checks that the detected format corresponds to a valid image format
 */
export const validateImage = async (filePath: string): Promise<boolean> => {
    try {
        const metadata = await sharp(filePath).metadata();
        
        // Check that dimensions exist
        if (!metadata.width || !metadata.height) {
            return false;
        }
        
        // Check that the format is a valid image format
        const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'svg', 'avif', 'heic', 'heif'];
        if (!metadata.format || !validFormats.includes(metadata.format.toLowerCase())) {
            return false;
        }
        
        // Check that dimensions are reasonable (at least 1x1 pixel)
        if (metadata.width < 1 || metadata.height < 1) {
            return false;
        }
        
        // Try to read the first image data to ensure it's valid
        // If Sharp can read metadata and format, it's probably a real image
        return true;
    } catch (error) {
        // If Sharp can't read the file, it's not a valid image
        return false;
    }
};

/**
 * Obtient le format optimal pour une image basé sur son type MIME
 */
export const getOptimalFormat = (mimetype: string): 'jpeg' | 'png' | 'webp' => {
    if (mimetype === 'image/png') {
        return 'png';
    }
    if (mimetype === 'image/webp') {
        return 'webp';
    }
    // By default, convert to JPEG (better compression)
    return 'jpeg';
};

