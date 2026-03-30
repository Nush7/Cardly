const getQuizzesByUser = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const { getQuizzesByUserService } = await import('../services/quiz.service');
        const quizzes = await getQuizzesByUserService(req.user.userId);
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
};
import { Request, Response, NextFunction } from 'express';
import {
    createQuiz,
    getQuizBySlugService,
    attemptQuizService,
    getQuizStatsService
} from '../services/quiz.service';

const generateQuiz = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const { numQuestions, validUntil, title, theme, rawText } = req.body;
        let text = rawText;
        if (req.file) {
            // TODO: Extract text from .docx (not implemented here)
            text = req.file.buffer.toString();
        }
        if (!text) return res.status(400).json({ message: 'No text provided' });
        try {
            const result = await createQuiz(req.user.userId, { numQuestions, validUntil, title, theme, rawText: text });
            res.status(201).json(result);
        } catch (err: any) {
            console.error('Error in createQuiz:', err);
            // If error is from Gemini API, show a more helpful message
            if (err.message && err.message.includes('GEMINI_API_KEY')) {
                return res.status(500).json({ message: 'Gemini API key is missing or invalid on the server.' });
            }
            if (err.message && err.message.includes('Gemini API error')) {
                return res.status(500).json({ message: 'Gemini API error: ' + err.message });
            }
            if (err.message && err.message.includes('Failed to generate questions')) {
                return res.status(500).json({ message: err.message });
            }
            return res.status(500).json({ message: 'Internal server error', error: err.message || err });
        }
    } catch (err) {
        next(err);
    }
};

const getQuizBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const result = await getQuizBySlugService(slug);
        if (!result) return res.status(404).json({ message: 'Quiz not found' });
        if (result === 'expired') return res.status(410).json({ message: 'Quiz expired' });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const attemptQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { email, answers } = req.body;
        const result = await attemptQuizService(slug, email, answers);
        if (result.error === 'not_found') return res.status(404).json({ message: 'Quiz not found' });
        if (result.error === 'expired') return res.status(410).json({ message: 'Quiz expired' });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

const getQuizStats = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const result = await getQuizStatsService(slug, req.user.userId);
        if (result.error === 'not_found') return res.status(404).json({ message: 'Quiz not found' });
        if (result.error === 'forbidden') return res.status(403).json({ message: 'Forbidden' });
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export { generateQuiz, getQuizBySlug, attemptQuiz, getQuizStats, getQuizzesByUser };
