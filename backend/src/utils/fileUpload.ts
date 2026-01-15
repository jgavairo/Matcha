import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use path consistent with Docker
const uploadDir = process.env.UPLOADS_DIR || '/app/uploads';

// Security to ensure the directory exists on startup
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Clean filename to avoid spaces/special characters
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // For images, we'll use .jpg after Sharp processing
        // For audio, we keep the original extension
        const ext = file.mimetype.startsWith('image/') ? '.jpg' : path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    // Accept only images and audio
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