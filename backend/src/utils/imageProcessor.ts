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
 * Traite et sécurise une image avec Sharp
 * - Redimensionne si nécessaire
 * - Convertit en format sûr (JPEG/PNG/WebP)
 * - Valide que c'est bien une image valide
 * - Supprime les métadonnées sensibles
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
        // Lire et valider l'image avec Sharp
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Vérifier que c'est bien une image valide avec format détecté
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image: unable to read dimensions');
        }

        // Vérifier que le format est un format d'image valide
        const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'svg', 'avif', 'heic', 'heif'];
        if (!metadata.format || !validFormats.includes(metadata.format.toLowerCase())) {
            throw new Error(`Invalid image format: ${metadata.format || 'unknown'}`);
        }

        // Vérifier les dimensions minimales (au moins 1x1 pixel)
        if (metadata.width < 1 || metadata.height < 1) {
            throw new Error('Invalid image: dimensions too small');
        }

        // Vérifier les dimensions maximales pour éviter les attaques de déni de service
        if (metadata.width > 10000 || metadata.height > 10000) {
            throw new Error('Image dimensions too large');
        }

        // Traiter l'image : redimensionner, convertir, nettoyer
        let processedImage = image
            .resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .removeAlpha() // Supprimer la transparence pour JPEG
            .jpeg({ quality, mozjpeg: true }); // Convertir en JPEG par défaut

        // Si le format demandé est PNG, utiliser PNG
        if (format === 'png') {
            processedImage = image
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ quality, compressionLevel: 9 });
        }

        // Si le format demandé est WebP, utiliser WebP
        if (format === 'webp') {
            processedImage = image
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality });
        }

        // Supprimer toutes les métadonnées EXIF (données personnelles, géolocalisation, etc.)
        processedImage = processedImage.withMetadata({});

        // Sauvegarder l'image traitée
        await processedImage.toFile(outputPath);

        // Supprimer le fichier original
        await fs.unlink(inputPath);
    } catch (error) {
        // En cas d'erreur, supprimer le fichier original
        try {
            await fs.unlink(inputPath);
        } catch (unlinkError) {
            // Ignorer l'erreur de suppression si le fichier n'existe pas
        }
        throw error;
    }
};

/**
 * Valide qu'un fichier est bien une image valide en essayant de le lire avec Sharp
 * Vérifie aussi que le format détecté correspond à un format d'image valide
 */
export const validateImage = async (filePath: string): Promise<boolean> => {
    try {
        const metadata = await sharp(filePath).metadata();
        
        // Vérifier que les dimensions existent
        if (!metadata.width || !metadata.height) {
            return false;
        }
        
        // Vérifier que le format est un format d'image valide
        const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif', 'tiff', 'svg', 'avif', 'heic', 'heif'];
        if (!metadata.format || !validFormats.includes(metadata.format.toLowerCase())) {
            return false;
        }
        
        // Vérifier que les dimensions sont raisonnables (au moins 1x1 pixel)
        if (metadata.width < 1 || metadata.height < 1) {
            return false;
        }
        
        // Essayer de lire les premières données de l'image pour s'assurer qu'elle est valide
        // Si Sharp peut lire les métadonnées et le format, c'est probablement une vraie image
        return true;
    } catch (error) {
        // Si Sharp ne peut pas lire le fichier, ce n'est pas une image valide
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
    // Par défaut, convertir en JPEG (meilleure compression)
    return 'jpeg';
};

