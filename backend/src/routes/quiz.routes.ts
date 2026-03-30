import { Router } from 'express';
import { generateQuiz, getQuizBySlug, attemptQuiz, getQuizStats } from '../controllers/quiz.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();


router.post('/generate', authMiddleware, uploadMiddleware, generateQuiz);
import { getQuizzesByUser } from '../controllers/quiz.controller';
router.get('/mine', authMiddleware, getQuizzesByUser);
router.get('/:slug', getQuizBySlug);
router.post('/:slug/attempt', attemptQuiz);
router.get('/:slug/stats', authMiddleware, getQuizStats);

export default router;
