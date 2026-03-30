export const getQuizzesByUserService = async (userId: string) => {
    // Fetch quizzes and populate attempts for admin/library view
    const quizzes = await Quiz.find({ createdBy: userId }).sort({ createdAt: -1 });
    // For each quiz, fetch attempts and attach as extra fields (not typed on model)
    const quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz) => {
            const attempts = await Attempt.find({ quizId: quiz._id }).sort({ attemptedAt: -1 });
            // Attach attempts and responses count as plain object fields
            const quizObj: any = quiz.toObject();
            quizObj.attempts = attempts.map(a => ({
                email: a.email,
                score: a.score,
                createdAt: a.attemptedAt,
            }));
            quizObj.responses = attempts.length;
            return quizObj;
        })
    );
    return quizzesWithAttempts;
};
import { IQuizQuestion } from '../models/quiz.model';
import Quiz from '../models/quiz.model';
import Attempt from '../models/attempt.model';
import { generateQuestionsWithLLM } from './llm.service';
import { generateSlug } from '../utils/slug';

export const createQuiz = async (userId: string, {
    numQuestions,
    validUntil,
    title,
    theme,
    rawText
}: {
    numQuestions: number;
    validUntil: Date;
    title?: string;
    theme?: string;
    rawText: string;
}) => {
    const questions = await generateQuestionsWithLLM(rawText, numQuestions);
    const slug = await generateSlug();
    const quiz = await Quiz.create({
        slug,
        title: title || 'Untitled Quiz',
        questions,
        createdBy: userId,
        validUntil,
        theme,
    });
    return { quizId: quiz._id, shareLink: `https://yourapp.com/quiz/${slug}` };
};

export const getQuizBySlugService = async (slug: string) => {
    const quiz = await Quiz.findOne({ slug });
    if (!quiz) return null;
    if (quiz.validUntil < new Date()) return 'expired';
    quiz.views++;
    await quiz.save();
    return {
        title: quiz.title,
        questions: quiz.questions.map((q: IQuizQuestion) => ({
            questionText: q.questionText,
            options: q.options,
        })),
        validUntil: quiz.validUntil,
        createdAt: quiz.createdAt,
    };
};

export const attemptQuizService = async (slug: string, email: string, answers: number[]) => {
    const quiz = await Quiz.findOne({ slug });
    if (!quiz) return { error: 'not_found' };
    if (quiz.validUntil < new Date()) return { error: 'expired' };
    let score = 0;
    quiz.questions.forEach((q: IQuizQuestion, i: number) => {
        if (answers[i] === q.correctIndex) score++;
    });
    await Attempt.create({ quizId: quiz._id, email, selectedOptions: answers, score });
    return { score, total: quiz.questions.length };
};

export const getQuizStatsService = async (slug: string, userId: string) => {
    const quiz = await Quiz.findOne({ slug });
    if (!quiz) return { error: 'not_found' };
    if (quiz.createdBy.toString() !== userId) return { error: 'forbidden' };
    const attempts = await Attempt.find({ quizId: quiz._id });
    const avgScore = attempts.length ? attempts.reduce((a, b) => a + b.score, 0) / attempts.length : 0;
    return {
        views: quiz.views,
        attempts: attempts.length,
        avgScore: Number(avgScore.toFixed(2)),
        individualAttempts: attempts.map((a: any) => ({ email: a.email, score: a.score })),
    };
};
