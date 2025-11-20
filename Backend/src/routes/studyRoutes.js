import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import studyController from '../controllers/studyController.js'

const router = express.Router();

router.get('/quiz/:quizId/questions/:questionId/image', studyController.downloadQuizQuestionImage);

router.use(authenticateToken);

router.get('/:userId/courses', studyController.getCourses);
router.get('/quiz/:courseId/:moduleId', studyController.getQuiz);


export default router