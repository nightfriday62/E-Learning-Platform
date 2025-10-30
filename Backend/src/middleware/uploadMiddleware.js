import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_CONFIG } from '../config/aws.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types for course materials
const ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
    document: 10 * 1024 * 1024,  // 10MB for documents
    image: 10 * 1024 * 1024,      // 10MB for images  
    default: 10 * 1024 * 1024    // 10MB default
};

// File type validator
const fileFilter = (req, file, cb) => {
    const isAllowed = ALLOWED_FILE_TYPES[file.mimetype];
    
    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${Object.values(ALLOWED_FILE_TYPES).join(', ')}`), false);
    }
};

// S3 storage configuration
const s3Storage = multerS3({
    s3: s3Client,
    bucket: S3_CONFIG.bucketName,
    serverSideEncryption: 'AES256',
    key: function (req, file, cb) {
        const { courseId, moduleId } = req.params;
        const fileExtension = path.extname(file.originalname);
        const uniqueFileName = `${uuidv4()}${fileExtension}`;
        
        // Create folder structure
        let key = `courses/${courseId}/`;
        if (moduleId) {
            key += `modules/${moduleId}/`;
        }
        key += uniqueFileName;
        
        // Store key in request for later use
        req.s3Key = key;
        cb(null, key);
    },
    metadata: function (req, file, cb) {
        cb(null, {
            originalName: file.originalname,
            courseId: req.params.courseId || '',
            moduleId: req.params.moduleId || '',
            uploadedBy: req.user?.id || '',
            uploadedAt: new Date().toISOString()
        });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
});

// Memory storage for custom processing
const memoryStorage = multer.memoryStorage();

// Create upload middleware with S3 storage
const s3Upload = multer({
    storage: s3Storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.default,
        files: 20 // Maximum 20 files per request
    }
});

// Create upload middleware with memory storage (for custom S3 handling)
const memoryUpload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.default,
        files: 20 // Maximum 20 files per request
    }
});

// Add thumbnail-specific file filter
const thumbnailFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Thumbnail must be a PNG or JPEG image'), false);
    }
};

// Create thumbnail upload middleware
const thumbnailUpload = multer({
    storage: memoryStorage,
    fileFilter: thumbnailFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB for thumbnails
        files: 1 // Only 1 thumbnail per course
    }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large',
                error: error.message
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files',
                error: error.message
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name',
                error: error.message
            });
        }
    }
    
    if (error.message.includes('File type')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type',
            error: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload error',
        error: error.message
    });
};

export {
    s3Upload,
    memoryUpload,
    thumbnailUpload,
    handleUploadError,
    ALLOWED_FILE_TYPES,
    FILE_SIZE_LIMITS
}; 