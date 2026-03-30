
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyQuizzes } from '../api/quiz';

interface Quiz {
    id?: string;
    _id?: string;
    slug?: string;
    title: string;
    questions?: any[];
    createdAt?: string;
    isActive?: boolean;
    attempts?: any[];
    responses?: number;
    avgScore?: number;
}

interface QuizContextType {
    quizzes: Quiz[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyQuizzes();
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load quizzes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    return (
        <QuizContext.Provider value={{ quizzes, loading, error, refresh: fetchQuizzes }}>
            {children}
        </QuizContext.Provider>
    );
};

export const useQuizzes = () => {
    const ctx = useContext(QuizContext);
    if (!ctx) throw new Error('useQuizzes must be used within a QuizProvider');
    return ctx;
};
