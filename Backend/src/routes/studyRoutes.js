import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import studyController from '../controllers/studyController.js'

const router = express.Router();

router.use(authenticateToken);

router.get('/:userId/courses', studyController.getCourses);


export default router