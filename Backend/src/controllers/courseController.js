import { Course, Material, Progress, Enrollment, User } from '../models/index.js';
import s3Service from '../services/s3Service.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const USE_S3 = process.env.USE_S3 === 'true';

// Helper function to determine file type
const getFileType = (mimeType) => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('doc')) return mimeType.includes('wordprocessingml') ? 'docx' : 'doc';
    if (mimeType.includes('text')) return 'txt';
    return 'other';
};

class CourseController {
    
    /**
     * Create a new course
     */
    async createCourse(req, res) {
        try {
            const { title, description, difficulty, modules } = req.body;


            const course = new Course({
                title,
                description,
                difficulty,
                modules: modules || []
            });

            await course.save();

            // Auto-enroll all existing students (locked by default)
            const students = await User.find({ role: 'student' }, '_id');
            if (students.length) {
                const bulk = students.map((s) => ({
                    updateOne: {
                        filter: { userId: s._id, courseId: course._id },
                        update: { userId: s._id, courseId: course._id, isOpen: false },
                        upsert: true
                    }
                }));
                await Enrollment.bulkWrite(bulk);

                // progress docs
                const progressBulk = [];
                for(const s of students){
                    for(const m of course.modules){
                        progressBulk.push({
                            updateOne:{
                                filter:{userId:s._id,moduleId:m._id},
                                update:{userId:s._id,courseId:course._id,moduleId:m._id,stars:0},
                                upsert:true
                            }
                        });
                    }
                }
                if(progressBulk.length){
                    await Progress.bulkWrite(progressBulk);
                }
            }


            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: course
            });

        } catch (error) {
            console.error('Create Course Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create course',
                error: error.message
            });
        }
    }

    /**
     * Get all courses with pagination
     */
    async getAllCourses(req, res) {
        try {
            const { page = 1, limit = 10, difficulty, isActive, search } = req.query;
            const skip = (page - 1) * limit;

            // Build filter object
            const filter = {};
            if (difficulty) filter.difficulty = difficulty;
            if (isActive !== undefined) filter.isActive = isActive === 'true';
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const courses = await Course.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Course.countDocuments(filter);

            res.json({
                success: true,
                data: {
                    courses,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalCourses: total,
                        hasNextPage: page * limit < total,
                        hasPrevPage: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Get Courses Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve courses',
                error: error.message
            });
        }
    }

    /**
     * Get single course by ID
     */
    async getCourseById(req, res) {
        try {
            const { courseId } = req.params;

            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }



            res.json({
                success: true,
                data: {
                    course,

                }
            });

        } catch (error) {
            console.error('Get Course Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve course',
                error: error.message
            });
        }
    }

    /**
     * Update course
     */
    async updateCourse(req, res) {
        try {
            const { courseId } = req.params;
            const updateData = req.body;

            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const updatedCourse = await Course.findByIdAndUpdate(
                courseId,
                updateData,
                { new: true, runValidators: true }
            );

            res.json({
                success: true,
                message: 'Course updated successfully',
                data: updatedCourse
            });

        } catch (error) {
            console.error('Update Course Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update course',
                error: error.message
            });
        }
    }

    /**
     * Delete course
     */
    async deleteCourse(req, res) {
        try {
            const { courseId } = req.params;

            const course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }



            // Delete associated materials from storage (S3 or local)
            const materials = await Material.find({ courseId });
            for (const material of materials) {
                try {
                    if (material.storageType === 's3' && material.cloudKey) {
                        await s3Service.deleteFile(material.cloudKey);
                    } else if (material.storageType === 'local' && material.url) {
                        const filePath = path.join(process.cwd(), material.url.replace(/^\//, ''));
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Failed to delete material from storage during course deletion:', err);
                }
            }

            // Delete materials from database
            await Material.deleteMany({ courseId });

            // Delete progress records
            await Progress.deleteMany({ courseId });

            // Delete enrollments
            await Enrollment.deleteMany({ courseId });

            // Delete course
            await Course.findByIdAndDelete(courseId);

            res.json({
                success: true,
                message: 'Course deleted successfully'
            });

        } catch (error) {
            console.error('Delete Course Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete course',
                error: error.message
            });
        }
    }

    /**
     * Upload course material
     */
    async uploadMaterial(req, res) {
        try {
            const { courseId, moduleId } = req.params;
            const files = req.files;
            console.log("I am here");
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const uploadedMaterials = [];

            for (const file of files) {
                // Two possible flows:
                // 1) File data is in memory (file.buffer) -> upload to S3 if enabled
                // 2) File was saved to disk by middleware -> file.path or req.savedFilePath available -> keep local

                if (file && file.buffer && USE_S3) {
                    // Upload to S3 using our service
                    const uploadResult = await s3Service.uploadFile(
                        file.buffer,
                        file.originalname,
                        file.mimetype,
                        courseId,
                        moduleId
                    );

                    // Create material record in database (S3)
                    const material = new Material({
                        filename: file.originalname,
                        type: getFileType(file.mimetype),
                        storageType: 's3',
                        url: uploadResult.url,
                        cloudKey: uploadResult.key,
                        courseId: courseId
                    });

                    await material.save();
                    uploadedMaterials.push(material);
                } else {
                    // Local disk flow: prefer req.savedFilePath (set by disk storage middleware), fallback to file.path
                    const relativePath = (req.savedFilePath) ? req.savedFilePath : (file.path ? path.relative(process.cwd(), file.path) : null);
                    const urlPath = relativePath ? `/${relativePath.replace(/\\/g, '/')}` : null;
                    console.log('Local file saved at URL path:', urlPath);
                    const material = new Material({
                        filename: file.originalname,
                        type: getFileType(file.mimetype || ''),
                        storageType: 'local',
                        url: urlPath || '',
                        cloudKey: null,
                        courseId: courseId
                    });

                    await material.save();
                    uploadedMaterials.push(material);
                }
            }

            res.status(201).json({
                success: true,
                message: `${uploadedMaterials.length} file(s) uploaded successfully`,
                data: uploadedMaterials
            });

        } catch (error) {
            console.error('Upload Material Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload materials',
                error: error.message
            });
        }
    }

    /**
     * Get material with signed URL for secure access
     */
    async getMaterial(req, res) {
        try {
            const { materialId } = req.params;

            const material = await Material.findById(materialId);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            // If material is stored in S3, generate a signed URL. For local files just return the stored URL path.
            let secureUrl = null;
            if (material.storageType === 's3' && material.cloudKey) {
                secureUrl = await s3Service.getSignedUrl(material.cloudKey);
            } else if (material.storageType === 'local' && material.url) {
                secureUrl = material.url; // served via static route (e.g., /uploads/...)
            }

            res.json({
                success: true,
                data: {
                    material: {
                        ...material.toObject(),
                        secureUrl
                    }
                }
            });

        } catch (error) {
            console.error('Get Material Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve material',
                error: error.message
            });
        }
    }

    /**
     * Delete material
     */
    async deleteMaterial(req, res) {
        try {
            const { materialId } = req.params;

            const material = await Material.findById(materialId);

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            // Find all courses that reference this material and remove the reference
            const courses = await Course.find({
                'modules.materials.materialId': materialId
            });

            let removedFromModules = 0;
            let updatedCourses = [];

            for (const course of courses) {
                let courseModified = false;
                
                for (const module of course.modules) {
                    const initialLength = module.materials.length;
                    module.materials = module.materials.filter(
                        material => material.materialId.toString() !== materialId
                    );
                    
                    if (module.materials.length !== initialLength) {
                        courseModified = true;
                        removedFromModules += (initialLength - module.materials.length);
                    }
                }
                
                if (courseModified) {
                    await course.save();
                    updatedCourses.push(course._id);
                }
            }

            // Delete from storage
            try {
                if (material.storageType === 's3' && material.cloudKey) {
                    await s3Service.deleteFile(material.cloudKey);
                } else if (material.storageType === 'local' && material.url) {
                    // material.url is stored as a relative path like '/uploads/...'
                    const filePath = path.join(process.cwd(), material.url.replace(/^\//, ''));
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (err) {
                console.error('Failed to delete material from storage:', err);
                // Continue with database deletion
            }

            // Delete from database
            await Material.findByIdAndDelete(materialId);

            res.json({
                success: true,
                message: 'Material deleted successfully',
                data: {
                    materialId,
                    removedFromModules,
                    updatedCourses: updatedCourses.length,
                    courseIds: updatedCourses
                }
            });

        } catch (error) {
            console.error('Delete Material Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete material',
                error: error.message
            });
        }
    }

    /**
     * Add or update course modules
     */
    async updateModules(req, res) {
        try {
            const { courseId } = req.params;
            const { modules } = req.body;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Process modules to handle temporary IDs
            const processedModules = modules.map(module => {
                // If _id exists but is not a valid ObjectId, remove it so MongoDB generates a new one
                if (module._id && !mongoose.Types.ObjectId.isValid(module._id)) {
                    const { _id, ...moduleWithoutId } = module;
                    return moduleWithoutId;
                }
                return module;
            });

            // Get old module IDs for comparison (only valid ObjectIds)
            const oldModuleIds = course.modules.map(module => module._id.toString());
            const newModuleIds = processedModules
                .map(module => module._id)
                .filter(id => id && mongoose.Types.ObjectId.isValid(id));

            // Find deleted modules (modules that exist in old but not in new)
            const deletedModuleIds = oldModuleIds.filter(oldId => !newModuleIds.includes(oldId));

            // If there are deleted modules, find and delete their associated materials
            if (deletedModuleIds.length > 0) {
                // Get all material IDs from deleted modules
                const materialsToDelete = [];
                course.modules.forEach(module => {
                    if (deletedModuleIds.includes(module._id.toString())) {
                        module.materials.forEach(material => {
                            materialsToDelete.push(material.materialId);
                        });
                    }
                });

                // Delete materials from S3 and database
                if (materialsToDelete.length > 0) {
                    // Get material details for S3 deletion
                    const materials = await Material.find({ _id: { $in: materialsToDelete } });
                    
                    // Delete from storage (S3 or local)
                    for (const material of materials) {
                        try {
                            if (material.storageType === 's3' && material.cloudKey) {
                                await s3Service.deleteFile(material.cloudKey);
                            } else if (material.storageType === 'local' && material.url) {
                                const filePath = path.join(process.cwd(), material.url.replace(/^\//, ''));
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                            }
                        } catch (s3Error) {
                            console.error('Failed to delete material from storage:', s3Error);
                            // Continue with database deletion even if storage deletion fails
                        }
                    }

                    // Delete from database
                    await Material.deleteMany({ _id: { $in: materialsToDelete } });
                }
            }

            // Update modules with processed data
            course.modules = processedModules;
            await course.save();

            res.json({
                success: true,
                message: 'Modules updated successfully',
                data: course,
                deletedModules: deletedModuleIds.length > 0 ? deletedModuleIds.length : 0
            });

        } catch (error) {
            console.error('Update Modules Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update modules',
                error: error.message
            });
        }
    }

    /**
     * Get upload presigned URL for direct client uploads
     */
    async getUploadUrl(req, res) {
        try {
            const { courseId, moduleId } = req.params;
            const { fileName, fileType } = req.body;

            if (!fileName || !fileType) {
                return res.status(400).json({
                    success: false,
                    message: 'fileName and fileType are required'
                });
            }

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const uploadData = await s3Service.getUploadPresignedUrl(
                fileName,
                fileType,
                courseId,
                moduleId
            );

            res.json({
                success: true,
                data: uploadData
            });

        } catch (error) {
            console.error('Get Upload URL Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate upload URL',
                error: error.message
            });
        }
    }

    /**
     * Upload course thumbnail
     */
    async uploadThumbnail(req, res) {
        try {
            const { courseId } = req.params;
            const file = req.file; // Single file for thumbnail

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No thumbnail file uploaded'
                });
            }

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Delete old thumbnail if exists
            try {
                if (course.thumbnail?.cloudKey) {
                    await s3Service.deleteFile(course.thumbnail.cloudKey);
                } else if (course.thumbnail?.url) {
                    const oldPath = path.join(process.cwd(), course.thumbnail.url.replace(/^\//, ''));
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            } catch (err) {
                console.error('Failed to delete previous thumbnail:', err);
            }

            // Upload new thumbnail either to S3 (if enabled and buffer available) or keep local path
            if (file && file.buffer && USE_S3) {
                const uploadResult = await s3Service.uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    courseId,
                    'thumbnail'
                );

                // Update course with thumbnail info (S3)
                course.thumbnail = {
                    url: uploadResult.url,
                    cloudKey: uploadResult.key,
                    filename: file.originalname
                };
            } else {
                // Local thumbnail saved by middleware
                const relativePath = req.savedFilePath ? req.savedFilePath : (file.path ? path.relative(process.cwd(), file.path) : null);
                const urlPath = relativePath ? `/${relativePath.replace(/\\/g, '/')}` : null;

                course.thumbnail = {
                    url: urlPath,
                    cloudKey: null,
                    filename: file.originalname
                };
            }

            await course.save();

            res.json({
                success: true,
                message: 'Thumbnail uploaded successfully',
                data: {
                    courseId: courseId,
                    thumbnail: course.thumbnail
                }
            });

        } catch (error) {
            console.error('Upload Thumbnail Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload thumbnail',
                error: error.message
            });
        }
    }

    /**
     * Delete course thumbnail
     */
    async deleteThumbnail(req, res) {
        try {
            const { courseId } = req.params;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            if (!course.thumbnail?.cloudKey && !course.thumbnail?.url) {
                return res.status(404).json({
                    success: false,
                    message: 'No thumbnail found for this course'
                });
            }

            // Delete from storage
            try {
                if (course.thumbnail?.cloudKey) {
                    await s3Service.deleteFile(course.thumbnail.cloudKey);
                } else if (course.thumbnail?.url) {
                    const filePath = path.join(process.cwd(), course.thumbnail.url.replace(/^\//, ''));
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error('Failed to delete thumbnail from storage:', err);
            }

            // Remove thumbnail from course
            course.thumbnail = {
                url: null,
                cloudKey: null,
                filename: null
            };

            await course.save();

            res.json({
                success: true,
                message: 'Thumbnail deleted successfully'
            });

        } catch (error) {
            console.error('Delete Thumbnail Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete thumbnail',
                error: error.message
            });
        }
    }

    /**
     * Get thumbnail with secure URL (if needed)
     */
    async getThumbnail(req, res) {
        try {
            const { courseId } = req.params;

            const course = await Course.findById(courseId);
            if (!course || (!course.thumbnail?.cloudKey && !course.thumbnail?.url)) {
                return res.status(404).json({
                    success: false,
                    message: 'No thumbnail found for this course'
                });
            }

            let secureUrl = null;
            if (course.thumbnail?.cloudKey) {
                secureUrl = await s3Service.getSignedUrl(course.thumbnail.cloudKey);
            } else if (course.thumbnail?.url) {
                secureUrl = course.thumbnail.url; 
                console.log("Local file saved at URL path:", secureUrl);
            }

            res.json({
                success: true,
                data: {
                    thumbnail: {
                        ...course.thumbnail,
                        secureUrl
                    }
                }
            });

        } catch (error) {
            console.error('Get Thumbnail Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get thumbnail',
                error: error.message
            });
        }
    }

}

export default new CourseController(); 