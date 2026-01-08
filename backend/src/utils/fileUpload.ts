import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Utilisation du chemin cohérent avec Docker
const uploadDir = process.env.UPLOADS_DIR || '/app/uploads';

// Sécurité pour s'assurer que le dossier existe au démarrage
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Nettoyage du nom de fichier pour éviter les espaces/caractères spéciaux
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Pour les images, on utilisera .jpg après traitement Sharp
        // Pour l'audio, on garde l'extension originale
        const ext = file.mimetype.startsWith('image/') ? '.jpg' : path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    // Accepter seulement les images et l'audio
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and audio are allowed.'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});